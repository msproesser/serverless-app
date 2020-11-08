import PeerId from "peer-id";
import { ChainNode } from "./chain-node"
import { signAccount, signPin, verifyAccount, verifyPin } from "./helper";
import { Storage } from "./storage";
import {pipe} from 'it-pipe'


export class Wallet {

  constructor(peerId) {
    this.id = peerId
    this.publicKey = peerId.pubKey.bytes.toString('base64')
    this.chainNode = new ChainNode(peerId)
    this.storage = new Storage()
  }

  start() {
    return this.chainNode._start().then(() => {
      this.chainNode.subscribe('register-account', msg => this._accountRegister(msg))
      this.chainNode.subscribe('register-pin', msg => this._pinRegister(msg))
      this.chainNode.handle('/sync', response => this.synchronize(response))
    })
  }

  _snapshot() {
    const peers = [...this.chainNode.peerStore.peers.values()]
    .map(peer => peer.addresses.map(addr => addr.multiaddr.toString() + '/p2p/' + peer.id.toB58String()))

    const accounts = [...this.storage.accounts.values()]
    const pins = [...this.storage.pins.values()].reduce((sum, pinList) => sum.concat(pinList), [])
    return { peers, accounts, pins }
  }

  async joinNetwork(nodeAddress) {
    const { stream } = await this.chainNode.dialProtocol(nodeAddress, '/sync')
    this.synchronize({stream})
    return 
  }

  async _accountRegister({ msg: account, ...all }) {
    this.storage.addAccount(account)
  }

  async _pinRegister({ msg: pin, ...all }) {
    this.storage.addPin(pin)
  }

  async register({name, email}) {
    const account = {name, email, updatedAt: Date.now()}
    const publicKey = this.publicKey
    const signature = await signAccount(this.id.privKey, account)
    this.chainNode.publish('register-account', { ...account, publicKey, signature })
  }

  async registerAccount(account) {
    verifyAccount(account)
    return this.chainNode.publish('register-account', account)
  }

  listAccounts() {
    return this.storage.listAccounts()
  }

  async registerPin(pin) {
    verifyPin(pin)
    return this.chainNode.publish('register-pin', pin)
  }
  // title, description, sender, receiver
  async createPin({title, description, receiver}) {
    const sender = this.publicKey
    const pin = { title, description, sender, receiver, createdAt: Date.now() }
    const signature = await signPin(this.id.privKey, pin)
    this.chainNode.publish('register-pin', { ...pin, sender, signature })
  }

  listPins(receiver) {
    return this.storage.listPins(receiver)
  }

  synchronize({ stream }) {
    const self = this
    pipe(
      stream,
      async function (source) {
        for await (const msg of source) {
          // Output the data as a utf8 string
          console.log('-> ' + msg.toString())
          const {peers, accounts, pins} = JSON.parse(msg.toString())
          self.merge({peers, accounts, pins})
        }
      }
    )
    pipe(
      [JSON.stringify(this._snapshot())],
      stream
    )

  }

  merge({peers, accounts, pins}) {
    accounts.forEach(account => this.storage.addAccount(account, false))
    pins.forEach(pin => this.storage.addPin(pin))
    peers.forEach(peerAddrs => peerAddrs.reduce(async (dialSuccess, addr) => {
      if (!dialSuccess) {
        console.log('dialing: ', addr)
        return await this.chainNode.dial(addr).then(r => true).catch(err => false)
      }
      return true
    }, false))
  }
}
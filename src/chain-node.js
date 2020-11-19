import PeerId from 'peer-id'
import CustomNode from './libp2p-bundle'
import { signAccount, signPin, verifyAccount, verifyPin } from "./helper";
import { Storage } from "./storage";
import {pipe} from 'it-pipe'
import fs from 'fs'

const SNAPSHOT_FILE = process.env.SNAPSHOT_FILE || './snapshot.json'

export class ChainNode extends CustomNode {

  constructor(peerId) {
    super({
      peerId,
      addresses: {
        listen: ['/ip4/0.0.0.0/tcp/0']
      }
    })
    this.storage = new Storage()
    console.log('my peerId is ' + peerId.toB58String())
    fs.readFile(SNAPSHOT_FILE, (err, data) => {
      if(err) {
        return console.log(err)
      }
      if (data) {
        try {
          data.length > 0 && this.merge(JSON.parse(data))
        } catch (err) {
          console.log('Error to load snapshot')
        }
      }
    })
  }

  start() {
    return super.start().then(_ => {
      this.subscribe('register-account', msg => this._accountRegister(msg))
      this.subscribe('register-pin', msg => this._pinRegister(msg))
      this.handle('/sync', response => this.synchronize(response))
      this.fullAddresses = this.multiaddrs.map(ma => ma.toString() + '/p2p/' + this.peerId.toB58String())
      console.log(this.fullAddresses)
    })
  }

  _snapshot() {
    const peers = [...this.peerStore.peers.values()]
      .map(peer => peer.addresses.map(addr => {
        const baseAddr = addr.multiaddr.toString()
        if(baseAddr.includes('p2p')) {
          return baseAddr
        }
        return addr.multiaddr.toString() + '/p2p/' + peer.id.toB58String() 
      }))

    const accounts = [...this.storage.accounts.values()]
    const pins = [...this.storage.pins.values()].reduce((sum, pinList) => sum.concat(pinList), [])
    return { peers, accounts, pins }
  }

  async joinNetwork(nodeAddress) {
    const { stream } = await this.dialProtocol(nodeAddress, '/sync')
    this.synchronize({ stream })
    return
  }

  async _accountRegister({ msg: account, ...all }) {
    await this.storage.addAccount(account)
    this.doBackup()
  }

  async _pinRegister({ msg: pin, ...all }) {
    await this.storage.addPin(pin)
    this.doBackup()
  }
 
  async registerAccount(account) {
    verifyAccount(account)
    this.publish('register-account', account)
    return
  }

  listAccounts() {
    return this.storage.listAccounts()
  }

  async registerPin(pin) {
    verifyPin(pin)
    return this.publish('register-pin', pin)
  }

  listPins(receiver) {
    return this.storage.listPins(receiver)
  }

  publish(queue, obj) {
    this.pubsub.publish(queue, Buffer.from(JSON.stringify(obj)))
  }

  synchronize({ stream }) {
    const self = this
    pipe(
      stream,
      async function (source) {
        for await (const msg of source) {
          const {peers, accounts, pins} = JSON.parse(msg.toString())
          self.merge({peers, accounts, pins})
          self.doBackup()
        }
      }
    )
    pipe(
      [JSON.stringify(this._snapshot())],
      stream
    )
  }

  subscribe(queue, handler) {
    this.pubsub.subscribe(queue, ({ data, ...all }) => {
      const msg = JSON.parse(data.toString())
      handler({ msg, ...all })
    })
  }

  merge({peers, accounts, pins}) {
    accounts.forEach(account => this.storage.addAccount(account, false))
    pins.forEach(pin => this.storage.addPin(pin))
    peers.forEach(peerAddrs => peerAddrs.reduce(async (dialSuccess, addr) => {
      if (!dialSuccess) {
        console.log('dialing: ', addr)
        return await this.dial(addr).then(r => true).catch(err => false)
      }
      return true
    }, false))
  }

  doBackup() {
    console.log('change received, doing backup')
    fs.writeFile('./snapshot.json', JSON.stringify(this._snapshot()), (err, data) => {
      if (err) {
        return console.log(err)
      }
      if (data) {
        console.log(data)
      }
    })
  }
}



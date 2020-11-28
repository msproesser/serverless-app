import { verifyAccount, verifyPin } from "./helper"

export class Storage {
  constructor(initialState) {
    this.accounts = new Map()
    this.pins = new Map()
    this.peers = new Set()
    if (initialState) {
      this.merge(initialState)
    }
  }
  async addAccount(account) {
    const isValid = await verifyAccount(account)
    if ( isValid ) {
      const existent = this.accounts.get(account.publicKey)
      if ( !existent || existent.updatedAt < account.updatedAt ) {
        this.accounts.set(account.publicKey, account)
      }
    }
  }

  async addPin(pin) {
    const isValid = await verifyPin(pin)
    if (isValid) {
        const pins = this.pins.get(pin.receiver) || []
        const exists = pins.filter(p => p.signature === pin.signature) > 0
        if (!exists) {
          this.pins.set(pin.receiver, [...pins, pin])
        }
    }
  }

  addPeer(peer) {
    this.peers.add(peer)
  }

  listAccounts() {
    return [...this.accounts.values()]
  }

  listPins(receiver) {
    if (receiver) {
      return [[receiver, this.pins.get(receiver)]] || []
    }
    return [...this.pins.entries()]
  }

  listPeers() {
    return [...this.peers]
  }

  merge({peers = [], accounts = [], pins = []}) {
    const newAccounts = accounts.map(account => this.addAccount(account))
    const newPins = pins.map(pin => this.addPin(pin))
    peers.forEach(peerAddrs => this.addPeer(peerAddrs))
    return Promise.all(newAccounts, newPins)
  }

  snapshot() {
    const peers = this.listPeers()
    const accounts = this.listAccounts()
    const pins = this.listPins()
    return { peers, accounts, pins }
  }
}
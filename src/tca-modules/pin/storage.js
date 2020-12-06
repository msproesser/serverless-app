import { verifyAccount, verifyPin } from "../../helper"

export class Storage {
  constructor(initialState) {
    this.accounts = new Map()
    this.pins = new Map()
    if (initialState) {
      this.merge(initialState)
    }
  }
  async _addAccount(account) {
    const isValid = await verifyAccount(account)
    if ( isValid ) {
      const existent = this.accounts.get(account.publicKey)
      if ( !existent || existent.updatedAt < account.updatedAt ) {
        this.accounts.set(account.publicKey, account)
      }
    }
  }

  async _addPin(pin) {
    const isValid = await verifyPin(pin)
    const receiver = this.accounts.get(pin.receiver) || false
    if (isValid && !!receiver) {
      const pins = this.pins.get(pin.receiver) || []
      const exists = pins.filter(p => p.signature === pin.signature) > 0
      if (!exists) {
        this.pins.set(pin.receiver, [...pins, pin])
      }
    }
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

  async merge({accounts = [], pins = []}) {
    const _ = await Promise.all(accounts.map(account => this._addAccount(account)))
    return await Promise.all(pins.map(pin => this._addPin(pin)))
  }

  load(backup) {
    this.merge(backup)
  }
  
  snapshot() {
    const accounts = this.listAccounts()
    const pins = this.listPins()
    return { accounts, pins }
  }
}
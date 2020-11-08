import { verifyAccount, verifyPin } from "./helper"

export class Storage {
  constructor() {
    this.accounts = new Map()
    this.pins = new Map()
  }
  async addAccount(account, overwrite = true) {
    const isValid = await verifyAccount(account)
    if ( isValid ) {
      if ( !this.accounts.has(account.publicKey) || overwrite ) {
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

  listAccounts() {
    return [...this.accounts.values()]
  }

  listPins(receiver) {
    return this.pins.get(receiver) || []
  }
}
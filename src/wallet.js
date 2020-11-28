import PeerId from "peer-id";
import { signAccount, signPin } from "./helper";


export class Wallet {

  constructor(peerId) {
    this.id = peerId
    this.publicKey = peerId.pubKey.bytes.toString('base64')
  }
  async registerAccount({name, email}) {
    const account = {name, email, updatedAt: Date.now()}
    const publicKey = this.publicKey
    const signature = await signAccount(this.id.privKey, account)
    return ({ ...account, publicKey, signature })
  }

  async registerPin({title, description, receiver}) {
    const sender = this.publicKey
    const pin = { title, description, sender, receiver, createdAt: Date.now() }
    const signature = await signPin(this.id.privKey, pin)
    return ({ ...pin, sender, signature })
  }
}
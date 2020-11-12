import PeerId from "peer-id";
import { ChainNode } from "./chain-node"
import { signAccount, signPin } from "./helper";


export class Wallet {

  constructor(peerId) {
    this.id = peerId
    this.publicKey = peerId.pubKey.bytes.toString('base64')
    this.chainNode = new ChainNode(peerId)
    //TODO: wallet deve usar pubsub pra criar pin sem instanciar chainNode
  }
  start() {
    this.chainNode.start()
  }
  async register({name, email}) {
    const account = {name, email, updatedAt: Date.now()}
    const publicKey = this.publicKey
    const signature = await signAccount(this.id.privKey, account)
    this.chainNode.registerAccount({ ...account, publicKey, signature })
  }

  // title, description, sender, receiver
  async createPin({title, description, receiver}) {
    const sender = this.publicKey
    const pin = { title, description, sender, receiver, createdAt: Date.now() }
    const signature = await signPin(this.id.privKey, pin)
    this.chainNode.registerPin({ ...pin, sender, signature })
  }
}
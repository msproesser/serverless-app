import Blockchain from "./blockchain";
import PeerId from "peer-id";
import {ChainNode} from "./chain-node"
export class Wallet {

    private chainNode: ChainNode
    private blockchain: Blockchain
    private id: PeerId

    constructor(peerId: PeerId, nodeAddress?: string) {
        this.id = peerId
        this.chainNode = new ChainNode(peerId)
        this.blockchain = this.chainNode.blockchain
        this.blockchain
    }

    async transfer({amount, to}: {amount: number, to: string}) {
        const sign = await this.id.privKey.sign(Buffer.from(JSON.stringify({to, amount}))).then(buf => buf.toString('base64'))
        const from = this.id.pubKey.bytes.toString('base64')
        this.chainNode.sendTransaction({ from, to, amount, sign })
    }
}
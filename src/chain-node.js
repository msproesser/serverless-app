import PeerId from 'peer-id'
import CustomNode from '../libp2p-bundle'
import Blockchain from './blockchain'

export class ChainNode extends CustomNode {

    constructor(peerId) {
        super({
            peerId,
            addresses: {
                listen: ['/ip4/0.0.0.0/tcp/0']
            }
        })
        console.log('my peerId is' + peerId.toB58String())
        this.peer = peerId
        this.blockchain = new Blockchain()
        this.seqnoset = new Set()
          this.start().then(_ => {
            this.handle('/register-peer', this._handleMeetPeer)
            this.multiaddrs.forEach( ma => 
                console.log(ma.toString() + '/p2p/' + peerId.toB58String())
            )
            this.pubsub.subscribe('global', msg => this._globalHandler(msg))
        })
    }

    _handleMeetPeer({ connection, stream, protocol }) {
        console.log('meet-peer = ' + protocol, {connection, stream})
    }

    _globalHandler({data, ...all}) {
        console.log('global msg is = ', all)
        
        const seqno = all.seqno.toString('hex')
        if (this.seqnoset.has(seqno)) return
        this.seqnoset.add(seqno) 

        const msg = JSON.parse(data.toString())
        if (!!msg.transaction) {
            console.log('data msg', msg)
            console.log('blockchain here is', this.blockchain)
            this.blockchain.addTransaction(msg.transaction)
        }
    }

    sendTransaction(transaction) {
        this.pubsub.publish('global', Buffer.from(JSON.stringify({ transaction })))
    }
}



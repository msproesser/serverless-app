import PeerId from 'peer-id'
import CustomNode from '../libp2p-bundle'

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
    }

    _start() {
        return this.start().then(_ => {
            this.multiaddrs.forEach( ma => 
                console.log(ma.toString() + '/p2p/' + this.peer.toB58String())
            )
        })
    }

    publish(queue, obj) {
        this.pubsub.publish(queue, Buffer.from(JSON.stringify(obj)))
    }

    subscribe(queue, handler) {
        this.pubsub.subscribe(queue, ({data, ...all}) => {
            const msg = JSON.parse(data.toString())
            handler({msg, ...all})
        })
    }
}



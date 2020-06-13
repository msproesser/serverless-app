import PeerId from 'peer-id'
import CNode from './libp2p-bundle'

export class MyNode extends CNode {

    constructor(peerId) {
        console.log('my peerId is' + peerId.toB58String())
        super({
            addresses: {
              listen: ['/ip4/0.0.0.0/tcp/0']
            },
            peerId: peerId
          })
          this.start().then(_ => {
            this.handle('/register-peer', this._handleMeetPeer)
            this.multiaddrs.forEach( ma => 
                console.log(ma.toString() + '/p2p/' + peerId.toB58String())
            )
            this.pubsub.subscribe('common', msg => {
                console.log('pubsub msg is = ',msg)
            })
        })
    }

    _handleMeetPeer({ connection, stream, protocol }) {
        console.log('meet-peer = ' + protocol, {connection, stream})
    }
}



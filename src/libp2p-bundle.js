'use strict'

import TCP from 'libp2p-tcp'
import WS from 'libp2p-websockets'
import WebrtcStar from 'libp2p-webrtc-star'
import wrtc from 'wrtc'
import mplex from 'libp2p-mplex'
import { NOISE } from 'libp2p-noise'
import Bootstrap from 'libp2p-bootstrap'
import MDNS from 'libp2p-mdns'
import DHT from 'libp2p-kad-dht'
import GossipSub from 'libp2p-gossipsub'
import defaultsDeep from '@nodeutils/defaults-deep'
import libp2p from 'libp2p'


export default class CustomNode extends libp2p {
  constructor (_options) {
    const defaults = {
      modules: {
        transport: [ TCP, WS, WebrtcStar ],
        streamMuxer: [ mplex ],
        connEncryption: [ NOISE ],
        peerDiscovery: [ Bootstrap, MDNS ],
        dht: DHT,
        pubsub: GossipSub
      },
      config: {
        transport : {
          [WebrtcStar.prototype[Symbol.toStringTag]]: {
            wrtc
          }
        },
        peerDiscovery: {
          bootstrap: {
            list: [ '/dnsaddr/sjc-1.bootstrap.libp2p.io/tcp/4001/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN' ]
          }
        },
        dht: {
          enabled: true,
          randomWalk: {
            enabled: true
          }
        }
      }
    }
    console.log(defaultsDeep(_options, defaults))
    super(defaultsDeep(_options, defaults))
  }
}

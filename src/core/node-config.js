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

export default function NodeP2P(peerId) {
  return libp2p.create({
    peerId,
    addresses: {
      listen: [
        '/ip4/0.0.0.0/tcp/0',
        '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
        // '/ip4/116.203.242.65/tcp/443/wss/p2p-webrtc-star/'
      ]
    },
    modules: {
      transport: [ TCP, WS, WebrtcStar ],
      streamMuxer: [ mplex ],
      connEncryption: [ NOISE ],
      peerDiscovery: [ MDNS ],
      dht: DHT,
      pubsub: GossipSub
    },
    config: {
      transport : {
        [WebrtcStar.prototype[Symbol.toStringTag]]: {
          wrtc
        }
      },
      dht: {
        enabled: true,
        randomWalk: {
          enabled: true
        }
      }
    }
  })
}
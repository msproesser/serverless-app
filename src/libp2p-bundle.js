'use strict'

import TCP from 'libp2p-tcp'
import WS from 'libp2p-websockets'
import mplex from 'libp2p-mplex'
import SECIO from 'libp2p-secio'
import { NOISE } from 'libp2p-noise'

import DHT from 'libp2p-kad-dht'
import GossipSub from 'libp2p-gossipsub'
import defaultsDeep from '@nodeutils/defaults-deep'
import libp2p from 'libp2p'


export default class CustomNode extends libp2p {
  constructor (_options) {
    const defaults = {
      modules: {
        transport: [ TCP, WS ],
        streamMuxer: [ mplex ],
        connEncryption: [ NOISE, SECIO ],
        dht: DHT,
        pubsub: GossipSub
      }
    }
    
    super(defaultsDeep(_options, defaults))
  }
}

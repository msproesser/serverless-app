import pipe from "it-pipe"
import { retry, streamToJSON } from "../helper"

const SIGNALING_SERVER="/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star"

export default async function(nodeP2p, protocol) {
  const commInterface = {}
  const knownPeers = new Set()

  commInterface.handle = function(handler) {
    commInterface.handler = handler
    nodeP2p.handle(protocol, ({stream}) => {
      pipe(
        stream,
        streamToJSON(command => {
          console.log('Received new command', command)
          const responses = handler(command).map(response => {
            if(typeof(response) === 'string') return response
            return JSON.stringify(response)
          })
          pipe(responses, stream)
        })
      )
    })
  }

  function responseHandler(command) {
    console.log('received a RESPONSE', command)
    commInterface.handler(command)
  }

  async function sendMessageToPeer(peer, message) {
    try {
      const {stream} = await retry(3, () => nodeP2p.dialProtocol(SIGNALING_SERVER+peer, protocol))
      pipe(stream, streamToJSON(responseHandler))
      pipe([JSON.stringify(message)], stream)
      return true
    } catch (err) {
      console.log('could not dial peer: ' + peer, err.message)
      return false
    }
  }

  commInterface.broadcast = function(message) {
    commInterface.send([...knownPeers], message, responseHandler)
  }

  commInterface.addPeer = function(peer) {
    knownPeers.add(peer)
  }

  commInterface.send = function(peerList, message) {
    peerList.forEach(peer => sendMessageToPeer(peer, message, responseHandler))
  }
  
  await nodeP2p.start().then(_ => {
    const fullAddress = '/p2p/' + nodeP2p.peerId.toB58String()
    console.log('my address: ' + fullAddress)
    commInterface.myAddress = fullAddress
    console.log(nodeP2p.multiaddrs.map(ma => ma.toString() + '/p2p/' + nodeP2p.peerId.toB58String()))
  })

  return commInterface
}
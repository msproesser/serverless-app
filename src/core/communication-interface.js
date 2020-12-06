import pipe from "it-pipe"
import { retry, streamToJSON } from "../helper"

export default async function(nodeP2p, protocol) {
  const commInterface = {}
  const knownPeers = new Set()
  commInterface.handle = function(handler) {
    nodeP2p.handle(protocol, ({stream}) => {
      pipe(
        stream,
        streamToJSON(command => {
          const responses = handler(command).map(response => {
            if(typeof(response) === 'string') return response
            return JSON.stringify(response)
          })
          pipe(responses, stream)
        })
      )
    })
  }

  async function sendMessageToPeer(peer, message, responseHandler = () => {}) {
    try {
      const {stream} = await retry(3, () => nodeP2p.dialProtocol(peer, protocol))
      streamToJSON
      pipe(stream, streamToJSON(responseHandler))
      pipe([JSON.stringify(message)], stream)
      return true
    } catch (err) {
      console.log('could not dial peer: ' + peer, err.message)
      return false
    }
  }

  commInterface.broadcast = function(message, responseHandler = () => {}) {
    commInterface.send([...knownPeers], message, responseHandler)
  }

  commInterface.addPeer = function(peer) {
    knownPeers.add(peer)
  }

  commInterface.send = function(peerList, message, responseHandler = () => {}) {
    peerList.forEach(peer => sendMessageToPeer(peer, message, responseHandler))
  }
  
  await nodeP2p.start().then(_ => {
    const fullAddress = '/p2p/' + nodeP2p.peerId.toB58String()
    console.log('my address: ' + fullAddress)
    commInterface.myAddress = fullAddress
  })

  return commInterface
}
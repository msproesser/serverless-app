import pipe from "it-pipe"
import { retry, streamToJSON } from "./helper"

export default function(nodeP2p, protocol) {
  const commInterface = {}
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

  commInterface.send = function(peerList, message, responseHandler = () => {}) {
    peerList.forEach(peer => sendMessageToPeer(peer, message, responseHandler))
  }
  // move nodep2p.start() here
  return commInterface
}
import { mergeCommandHandler, syncFeedbackCommandHandler } from "./core-handlers";
import peerStore from "./peer-store";

export default function(communicationInterface) {
  const storage = peerStore()
  const handlers = [
    mergeCommandHandler(storage, communicationInterface),
    syncFeedbackCommandHandler(storage)
  ]

  const api = Object.freeze({
    async joinNetwork(nodeAddress) {
      const p2pAddress = nodeAddress.substring(nodeAddress.indexOf('/p2p/'))
      const snapshot = storage.snapshot()
      snapshot.sync = true
      return communicationInterface.send([p2pAddress], snapshot)
    },
    sync() {
      storage.list().forEach(api.joinNetwork)
    },
    addPeer(address) {
      storage.add(address)
      communicationInterface.addPeer(address)
    },
    myAddress() {
      return communicationInterface.myAddress
    }
  })
  return {
    handlers, api,
    load: storage.load,
    snapshot: storage.snapshot
  }
} 
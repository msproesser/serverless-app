import pipe from "it-pipe"
import { streamToJSON } from "../../helper"
import fs from 'fs'


export function mergeCommandHandler(storage, communicationInterface) {
  return function merge({peers = []}) {
    peers.forEach(storage.add)
    peers.forEach(communicationInterface.addPeer)
  }
}

export function syncFeedbackCommandHandler(storage) {
  return function syncFeedback(command) {
    if (command.sync) {
      return { peers: storage.list() }
    }
  }
}


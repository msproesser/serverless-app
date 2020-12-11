import NodeP2P from './node-config'
import {readFile} from '../helper'
import fs from 'fs'
import communicationInterfaceFactory from './communication-interface'

import CoreModule from '../tca-modules/core'
import { mergeModules, snapshotLoad, snapshotHandler, nodeHandler } from './helper'

const SNAPSHOT_FILE = process.env.SNAPSHOT_FILE || './snapshot.json'

export default async function(peerId, modules = []) {
  const nodeP2p = new NodeP2P(peerId)
  const communicationInterface = await communicationInterfaceFactory(nodeP2p, '/tca-sync/1.0')
  const moduleInstances = modules.map(module => module(communicationInterface))
  moduleInstances.push(CoreModule(communicationInterface))

  const {api, handlers} = mergeModules(moduleInstances)
  api.addPeer(communicationInterface.myAddress)
  const commandHandler = nodeHandler([
    ...handlers,
    snapshotHandler(moduleInstances, SNAPSHOT_FILE)
  ])
  await snapshotLoad(moduleInstances, SNAPSHOT_FILE)

  communicationInterface.handle(commandHandler)

  setTimeout(() => { //TODO fix this timeout, used to counter snapshotLoad delay
    const sync = moduleInstances.reduce((payload, module) => {
      if (module.sync) {
        return Object.assign(payload, module.sync())
      }
      return payload
    }, {sync:true})
    communicationInterface.broadcast(sync)
  }, 0);

  api.snapshot = () => {
    return moduleInstances.reduce((snapshot, module) => {
      return Object.assign(snapshot, module.snapshot())
    }, {})
  }
  return api
}
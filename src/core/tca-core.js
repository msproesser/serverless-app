import NodeP2P from './node-config'
import {readFile} from '../helper'
import fs from 'fs'
import communicationInterfaceFactory from './communication-interface'

import CoreModule from '../tca-modules/core'
import { mergeModules, snapshotLoad, snapshotHandler, nodeHandler } from './helper'

const SNAPSHOT_FILE = process.env.SNAPSHOT_FILE || './snapshot.json'

export default async function(peerId, moduleFactories = []) {
  const nodeP2p = new NodeP2P(peerId)
  const communicationInterface = await communicationInterfaceFactory(nodeP2p, '/tca-sync/1.0')
  const modules = moduleFactories.map(module => module(communicationInterface))
  modules.push(CoreModule(communicationInterface))

  const {api, handlers} = mergeModules(modules)
  api.addPeer(communicationInterface.myAddress)
  const commandHandler = nodeHandler([
    ...handlers,
    snapshotHandler(modules, SNAPSHOT_FILE)
  ])
  await snapshotLoad(modules, SNAPSHOT_FILE)

  communicationInterface.handle(commandHandler)

  setTimeout(() => { //TODO fix this timeout, used to counter snapshotLoad delay
    const sync = modules.reduce((payload, module) => {
      if (module.sync) {
        return Object.assign(payload, module.sync())
      }
      return payload
    }, {sync:true})
    communicationInterface.broadcast(sync)
  }, 0);

  api.snapshot = () => {
    return modules.reduce((snapshot, module) => {
      return Object.assign(snapshot, module.snapshot())
    }, {})
  }
  return api
}
import NodeP2P from './node-config'
import {readFile} from '../helper'
import fs from 'fs'
import communicationInterfaceFactory from './communication-interface'

import CoreModule from '../tca-modules/core'

const SNAPSHOT_FILE = process.env.SNAPSHOT_FILE || './snapshot.json'

function nodeHandler(handlers = []) {
  function commandHandler(command) {
    return handlers
    .map(handle => handle(command))
    .filter(response => !!response && typeof(response) === 'object')
    .map(JSON.stringify)
  }
  return commandHandler
}

function mergeModules(modules) {
  return modules.reduce((globalModule, module) => {
    return {
      api: Object.assign(globalModule.api, module.api),
      handlers: [...globalModule.handlers, ...module.handlers]
    }
  }, {api: {}, handlers: []})
}

function snapshotHandler(modules, snapshotFile) {
  return function() {
    setTimeout(() => {
      const snapshot = modules.reduce((snapshot, module) => {
        return Object.assign(snapshot, module.snapshot())
      }, {})
      fs.writeFile(snapshotFile, JSON.stringify(snapshot, null, 4), () => {})
    }, 0)
  }
}

async function snapshotLoad(modules, snapshotFile) {
  const snapshot = await readFile(snapshotFile)
  modules.forEach(module => module.load(snapshot))
}

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
  api.sync()
  console.log('API', api)
  return api
}
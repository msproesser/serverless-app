import fs from 'fs'
import NodeP2P from './node-config'
import { Storage } from "./storage";
import tcaApiFactory from './tca-api'
import {readFile} from './helper'
import nodeHandler, {doBackupCommandHandler, mergeCommandHandler, syncFeedbackCommandHandler} from './node-handler'
import communicationInterfaceFactory from './communication-interface'

const SNAPSHOT_FILE = process.env.SNAPSHOT_FILE || './snapshot.json'

export default async function(peerId) {
  const nodeP2p = new NodeP2P(peerId)
  const storage = new Storage(await readFile(SNAPSHOT_FILE))
  const communicationInterface = communicationInterfaceFactory(nodeP2p, '/tca-sync/1.0')
  const tcaApi = tcaApiFactory(communicationInterface, storage)

  await nodeP2p.start().then(_ => {
    const fullAddress = '/p2p/' + nodeP2p.peerId.toB58String()
    console.log('my address: ' + fullAddress)
    storage.addPeer(fullAddress)
  })

  const commandHandler = nodeHandler([
    mergeCommandHandler(storage),
    syncFeedbackCommandHandler(storage),
    doBackupCommandHandler(storage, SNAPSHOT_FILE)
  ])
  communicationInterface.handle(commandHandler)
  storage.listPeers().forEach(tcaApi.joinNetwork)

  return tcaApi
}
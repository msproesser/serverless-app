import PeerId from 'peer-id'
import NodeP2P from './node-config'
import { retry } from "./helper";
import { Storage } from "./storage";
import {pipe} from 'it-pipe'
import fs from 'fs'

const SNAPSHOT_FILE = process.env.SNAPSHOT_FILE || './snapshot.json'

export class TcaNode {
  constructor(peerId) {
    this.nodeP2p = new NodeP2P(peerId)
    this.storage = new Storage()

    fs.readFile(SNAPSHOT_FILE, (err, data) => {
      if(err) { return console.log(err) }
      if (data) {
        try {
          data.length > 0 && this.storage.merge(JSON.parse(data))
        } catch (err) {
          console.log('Error to load snapshot', err)
        }
      }
    })
    this.nodeP2p.start().then(_ => {
      this.nodeP2p.handle('/tca-sync/1.0', msg => this.patchHandler(msg))
      this.fullAddresses = this.nodeP2p.multiaddrs.map(ma => ma.toString() + '/p2p/' + this.nodeP2p.peerId.toB58String())
      this.storage.addPeer('/p2p/' + this.nodeP2p.peerId.toB58String())
      console.log(this.fullAddresses)
    })
  }
  async joinNetwork(nodeAddress) {
    const p2pAddress = nodeAddress.substring(nodeAddress.indexOf('/p2p/'))
    const snapshot = this.storage.snapshot()
    snapshot.sync = true
    const connected = await this.patchPeer(p2pAddress, snapshot)
    if(connected) {
      this.storage.addPeer(p2pAddress)
      this.doBackup()
    }
    return connected
  }

  listAccounts() { return this.storage.listAccounts() }
  listPins(receiver) { return this.storage.listPins(receiver) }

  async registerAccount(account) {
    const patch = { accounts: [ account ] }
    this.sendPatch(patch)
  }

  async registerPin(pin) {
    const patch = { pins: [ pin ] }
    this.sendPatch(patch)
  }

  sendPatch(patch) {
    this.storage.listPeers().forEach(async peer => this.patchPeer(peer, patch))
  }

  async patchPeer(peer, patch) {
    try {
      const {stream} = await retry(3, () => this.nodeP2p.dialProtocol(peer, '/tca-sync/1.0'))
      pipe(
        [JSON.stringify(patch)],
        stream
      )
      return true
    } catch (err) {
      console.log('could not dial peer: ' + peer, err.message)
      return false
    }
  }

  patchHandler({stream}) {
    const self = this
    pipe(
      stream,
      async function (source) {
        for await (const msg of source) {
          const snapshotDiff = JSON.parse(msg.toString())
          self.patch(snapshotDiff)
          if (snapshotDiff.sync) {
            console.log('sending snapshot feedback')
            pipe(
              [self.storage.snapshot()],
              stream
            )
          }
        }
      }
    )
  }

  patch({peers, accounts, pins}) {
    this.storage.merge({peers, accounts, pins})
    .then(() => this.doBackup())
  }

  doBackup() {
    console.log('change received, doing backup', this.storage.snapshot())
    fs.writeFile(SNAPSHOT_FILE, JSON.stringify(this.storage.snapshot(), null, 4), (err, data) => {
      if (err) { return console.log(err) }
      if (data) { console.log(data) }
    })
  }
}
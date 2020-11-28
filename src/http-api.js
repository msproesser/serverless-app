import express from 'express'
import PeerId from 'peer-id'
import { TcaNode } from './tca-node'

const app = express()
app.use(express.json())

const PEER_ID_FILE = process.env.PEER_ID_FILE || '../peer-id.json'

const thePeer = PeerId.createFromJSON(require(PEER_ID_FILE))

thePeer
.then(async peerId => {
  console.log('peerId: ', PeerId.isPeerId(peerId))
  const tcaNode = new TcaNode(peerId)

  app.post('/accounts', async (req, res) => {
    try {
      console.log('Registering new account')
      await tcaNode.registerAccount(req.body)
      res.json({register: 'OK'})
    } catch(err) {
      console.log('error on account register', err)
      res.json({err: err.message})
    }
  })
  app.get('/accounts', (req, res) => {
    const accounts = tcaNode.listAccounts()
    res.json({accounts})
  })
  
  app.post('/pins', async (req, res) => {
    try {
      console.log('Registering new Pin')
      await tcaNode.registerPin(req.body)
      res.json({register: 'OK'})
    } catch(err) {
      console.log('error on pin register', err)
      res.json({err: err.message})
    }
  })
  app.get('/pins', (req, res) => {
    const pins = tcaNode.listPins(req.query.receiver)
    res.json({pins})
  })

  app.post('/join-network', (req, res) => {
    console.log('joining', req.body.network)
    tcaNode.joinNetwork(req.body.network)
    .catch(err => res.json({err: err.message}))
    .then(_ => res.json({join: 'OK'}))
    
  })

  app.get('/snapshot', (req, res) => {
    const snapshot = tcaNode.storage.snapshot()
    res.json({snapshot})
  })

  app.get('/my-address', (req, res) => {
    res.json({address: tcaNode.fullAddresses})
  })

  app.listen(20000, () => { console.log('listening on port 20000') })
})

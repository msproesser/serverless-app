import express from 'express'
import PeerId from 'peer-id'
import { ChainNode } from './chain-node'

const app = express()
app.use(express.json())

const PEER_ID_FILE = process.env.PEER_ID_FILE || '../peer-id.json'

const thePeer = PeerId.createFromJSON(require(PEER_ID_FILE))

thePeer
.then(async peerId => {
  const chainNode = new ChainNode(peerId)
  await chainNode.start()

  app.post('/accounts', async (req, res) => {
    try {
      console.log('Registering new account')
      await chainNode.registerAccount(req.body)
      res.json({register: 'OK'})
    } catch(err) {
      console.log('error on account register', err)
      res.json({err: err.message})
    }
  })
  app.get('/accounts', (req, res) => {
    const accounts = chainNode.listAccounts()
    res.json({accounts})
  })
  
  app.post('/pins', async (req, res) => {
    try {
      console.log('Registering new Pin')
      await chainNode.registerPin(req.body)
      res.json({register: 'OK'})
    } catch(err) {
      console.log('error on pin register', err)
      res.json({err: err.message})
    }
  })
  app.get('/pins', (req, res) => {
    const pins = chainNode.listPins(req.query.receiver)
    res.json({pins})
  })

  app.post('/join-network', (req, res) => {
    console.log('joining', req.body.network)
    chainNode.joinNetwork(req.body.network)
    .catch(err => res.json({err: err.message}))
    .then(_ => res.json({join: 'OK'}))
    
  })

  app.get('/snapshot', (req, res) => {
    const snapshot = chainNode._snapshot()
    res.json({snapshot})
  })

  app.get('/my-address', (req, res) => {
    res.json({address: chainNode.fullAddresses})
  })

  app.listen(20000, () => { console.log('listening on port 20000') })
})

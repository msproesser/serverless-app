import express from 'express'
import PeerId from 'peer-id'
import { ChainNode } from './chain-node'

const app = express()
app.use(express.json())
PeerId
.createFromJSON(require('../'+process.argv[2]))
.then(async peerId => {
  const chainNode = new ChainNode(peerId)
  await chainNode.start()

  app.post('/accounts', (req, res) => {
    try {
      console.log('Registering new account')
      await chainNode.registerAccount(req.body)
      res.json({sent: 'OK'})
    } catch(err) {
      console.log('error on account register', err)
      res.json({err: err.message})
    }
  })
  app.get('/accounts', (req, res) => {
    const accounts = chainNode.listAccounts()
    res.json({accounts})
  })
  
  app.post('/pins', (req, res) => {
    try {
      console.log('Registering new Pin')
      await chainNode.registerPin(req.body)
      res.json({sent: 'OK'})
    } catch(err) {
      console.log('error on pin register', err)
      res.json({err: err.message})
    }
  })
  app.get('/pins', (req, res) => {
    req.query.receiver
    const pins = chainNode.listPins(req.query.receiver)
    res.json({pins})
  })

  app.post('/join-network', (req, res) => {
    chainNode.joinNetwork(req.body.newtwork).catch(err => res.json({err: err.message}))
    res.json({join: 'OK'})
  })

  app.listen(8000, () => {})
})


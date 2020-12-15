import express from 'express'
import PeerId from 'peer-id'
import CoreFactory from './core/tca-core'
import PinModule from './tca-modules/pin'
const app = express()
app.use(express.json())

const PEER_ID_FILE = process.env.PEER_ID_FILE || '../peer-id.json'
const SERVER_PORT = process.env.SERVER_PORT || 20000

const thePeer = PeerId.createFromJSON(require(PEER_ID_FILE))

thePeer
.then(async peerId => {
  console.log('peerId: ', PeerId.isPeerId(peerId))
  const api = await CoreFactory(peerId, [PinModule])

  app.post('/accounts', async (req, res) => {
    try {
      console.log('Registering new account')
      api.account.register(req.body)
      res.json({register: 'OK'})
    } catch(err) {
      console.log('error on account register', err)
      res.json({err: err.message})
    }
  })
  app.get('/accounts', (req, res) => {
    const accounts = api.account.list()
    res.json({accounts})
  })
  
  app.post('/pins', async (req, res) => {
    try {
      console.log('Registering new Pin')
      api.pin.register(req.body)
      res.json({register: 'OK'})
    } catch(err) {
      console.log('error on pin register', err)
      res.json({err: err.message})
    }
  })
  app.get('/pins', (req, res) => {
    const receiver = req.query.receiver || ''
    const pins = api.pin.list(receiver.replace(' ', '+'))
    res.json({pins})
  })

  app.post('/join-network', (req, res) => {
    console.log('joining', req.body.network)
    api.joinNetwork(req.body.network)
    .catch(err => res.json({err: err.message}))
    .then(_ => res.json({join: 'OK'}))
    
  })

  app.get('/snapshot', (req, res) => {
    const snapshot = api.snapshot()
    res.json({snapshot})
  })

  app.get('/my-address', (req, res) => {
    res.json({address: api.myAddress()})
  })

  app.listen(SERVER_PORT, () => { console.log('listening on port 20000') })
})

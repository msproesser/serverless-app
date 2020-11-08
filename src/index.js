import express from 'express'
const app = express()
app.use(express.json())

import PeerId from 'peer-id'
import { exit } from 'process'
import { Wallet } from './wallet'

if(!process.argv[2]) {
  console.log("you must pass a peer-id.json, generate with:\n    npx peer-id --type ed25519 --bytes 2048 > peer-id.json")
  exit(1)
}

PeerId.createFromJSON(require('../'+process.argv[2]))
.then(async peerId => {
  const wallet = new Wallet(peerId)
  console.log('1')
  await wallet.start()
  if (!!process.argv[3]) await wallet.joinNetwork(process.argv[3])

  wallet.register({name: 'matheus', email: 'matheuss@bla.com'})
  setTimeout(() => {
    console.log(wallet.listAccounts())
    console.log('OK done')
  }, 100);
})

if(false) {

const pid = require('peer-id')
const {Wallet} = require('./src/wallet')
let wallet;
pid.createFromJSON(require('./other-peer')).then(peerid => {
  wallet = new Wallet(peerid)
  wallet.start()
})

wallet.register({name: 'other', email: 'other@gmail.com'})




const pid = require('peer-id')
const {Wallet} = require('./src/wallet')
let wallet;
pid.createFromJSON(require('./my-id')).then(peerid => {
  wallet = new Wallet(peerid)
  wallet.start()
})

wallet.joinNetwork('/ip4/127.0.0.1/tcp/36597/p2p/12D3KooWG39WpHhHyR9fVh5WPSciwmwvw4CRDHu1RGoUoQXqvYEQ')
wallet.register({name: 'matheuss', email: 'matheus@gmail.com'})
wallet.createPin({title:'exemplo 1', description: 'esse exemplo ta de parabens ein pqp', receiver: 'CAESIFxsXT3N9N1gFb/UqKKGHhiL5IeEI0C86R1aaUQ54/Yt'})






}
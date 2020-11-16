import Vorpal from 'vorpal'
import PeerId from 'peer-id'
import { Wallet } from './wallet'
import fetch from 'node-fetch'

const hostname = process.env.PINBERNETES_HOST || 'localhost'
const port = process.env.PINBERNETES_PORT || 20000
const vorpal = Vorpal()

function post(body) {
  return { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }
  }
}

PeerId.createFromJSON(require(process.env.WALLET_PEER_ID || '../my-id.json'))
.then(async peerId => {
  const wallet = new Wallet(peerId)
  vorpal.command('account register <name> <email>')
  .action(async function(args, callback) {
    const payload = await wallet.registerAccount({name: args.name, email: args.email})
    const response = await fetch(`http://${hostname}:${port}/accounts`, post(payload))
    this.log('Account register', await response.json())
    
    callback()
  })

  vorpal.command('account list')
  .action(async function(args, callback) {
    const response = await fetch(`http://${hostname}:${port}/accounts`)
    this.log('Account list', await response.json())
    callback()
  })

  vorpal.command('pin register <title> <description> <receiver>')
  .action(async function(args, callback) {
    const {title, description, receiver} = args 
    const payload = await wallet.registerPin({title, description, receiver})

    const response = await fetch(`http://${hostname}:${port}/pins`, post(payload))
    this.log('Pin register', await response.json())

    callback()
  })

  vorpal.command('pin list [receiver]')
  .action(async function(args, callback) {
    let query = '';
    if (args.receiver) { query = '?receiver='+args.receiver }

    const response = await fetch(`http://${hostname}:${port}/pins${query}`)
    this.log('Account list', await response.json())
    callback()
  })

  vorpal.command('join network <address>')
  .action(async function(args, callback) {
    const response = await fetch(`http://${hostname}:${port}/join-network`, post({network: args.address}))
    this.log('Join result', await response.json())
    callback()
  })

  vorpal.command('snapshot')
  .action(function(args, callback) {
    
    callback()
  })

  vorpal.command('get-address')
  .action(async function(args, callback) {
    const response = await fetch(`http://${hostname}:${port}/my-address`)
    this.log('my address list', (await response.json()).address)
    callback()
  })
vorpal.delimiter('P9S >').show()
})

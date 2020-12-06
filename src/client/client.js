import Vorpal from 'vorpal'
import Table from 'cli-table'
import PeerId from 'peer-id'
import { Wallet } from './wallet'
import fetch from 'node-fetch'

const hostname = process.env.SERVER_HOST || 'localhost'
const port = process.env.SERVER_PORT || 20000
const PEER_ID = process.env.PEER_ID || '../../peer-id.json'

const vorpal = Vorpal()

function post(body) {
  return { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }
  }
}

PeerId.createFromJSON(require(PEER_ID))
.then(async peerId => {
  const wallet = new Wallet(peerId)

  vorpal.command('account register <name> <email>')
  .action(async function(args, callback) {
    const payload = await wallet.registerAccount({name: args.name, email: args.email})
    const response = await fetch(`http://${hostname}:${port}/accounts`, post(payload))
    this.log('- Account register', await response.json())
    
    callback()
  })

  vorpal.command('account list')
  .action(async function(args, callback) {
    const response = await fetch(`http://${hostname}:${port}/accounts`)
    const results = await response.json()
    const table = new Table({head: ['name', 'email', 'address']})
    results.accounts.forEach(account => {
      table.push([account.name, account.email, account.publicKey])
    })
    this.log(table.toString())
    callback()
  })

  vorpal.command('pin register <title> <description> <receiver>')
  .action(async function(args, callback) {
    const {title, description, receiver} = args 
    const payload = await wallet.registerPin({title, description, receiver})

    const response = await fetch(`http://${hostname}:${port}/pins`, post(payload))
    this.log('- Pin register', await response.json())

    callback()
  })

  vorpal.command('pin list [receiver]')
  .action(async function(args, callback) {
    let query = '';
    if (args.receiver) { query = '?receiver='+args.receiver }

    const response = await fetch(`http://${hostname}:${port}/pins${query}`)
    const results = await response.json()
    results.pins.forEach(([receiver, pinList]) => {
      const table = new Table({head: ['Title', 'Description', 'Sender']})
      pinList.forEach(pin => {
        table.push([pin.title, pin.description, pin.sender])
      })
      this.log('- Receiver:', receiver)
      this.log(table.toString())
    })
    callback()
  })

  vorpal.command('join network <address>')
  .action(async function(args, callback) {
    const response = await fetch(`http://${hostname}:${port}/join-network`, post({network: args.address}))
    this.log('Join result', await response.json())
    callback()
  })

  vorpal.command('snapshot')
  .action(async function(args, callback) {
    const response = await fetch(`http://${hostname}:${port}/snapshot`)
    console.log(JSON.stringify(await response.json(), null, 4))
    callback()
  })

  vorpal.command('get-address')
  .action(async function(args, callback) {
    const response = await fetch(`http://${hostname}:${port}/my-address`)
    this.log('my address list', (await response.json()).address)
    callback()
  })
vorpal.delimiter('Team Choice Awards CLI>').show()
})

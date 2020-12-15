import Vorpal from 'vorpal'
import Table from 'cli-table'
import PeerId from 'peer-id'
import { Wallet } from './wallet'
import fetch from 'node-fetch'

const HOSTNAME = process.env.SERVER_HOST || 'localhost'
const PORT = process.env.SERVER_PORT || 20000
const PEER_ID = process.env.PEER_ID || '../../peer-id.json'
const BASE_PATH = process.env.BASE_PATH || `${HOSTNAME}:${PORT}`

const vorpal = Vorpal()

function post(body) {
  return { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }
  }
}
function toJson(response) {
  return response.json()
}


PeerId.createFromJSON(require(PEER_ID))
.then(async peerId => {
  const wallet = new Wallet(peerId)
  const api = {
    account: {
      register: account =>  wallet.registerAccount({name: account.name, email: account.email})
        .then(payload => fetch(`http://${BASE_PATH}/accounts`, post(payload)))
        .then(toJson),
      list: () => fetch(`http://${BASE_PATH}/accounts`).then(toJson)
    },
    pin: {
      register: ({title, description, receiver}) => wallet.registerPin({title, description, receiver})
        .then(payload => fetch(`http://${BASE_PATH}/pins`, post(payload)))
        .then(toJson),
      list: receiver => {
        let query = receiver ? `?receiver=${receiver}` : ''
        return fetch(`http://${BASE_PATH}/pins${query}`).then(toJson)
      }
    }
  }
  vorpal.command('account register <name> <email>')
  .action(async function(args, callback) {
    const response = await api.account.register(args)
    this.log('- Account register', response)
    
    callback()
  })

  vorpal.command('account list')
  .action(async function(args, callback) {
    const results = await api.account.list()
    const table = new Table({head: ['name', 'email', 'address']})
    results.accounts.forEach(account => {
      table.push([account.name, account.email, account.publicKey])
    })
    this.log(table.toString())
    callback()
  })

  vorpal.command('pin register <title> <description> <receiver>')
  .action(async function(args, callback) {
    const response = await api.pin.register(args)
    this.log('- Pin register', response)

    callback()
  })

  vorpal.command('pin list [receiver]')
  .action(async function(args, callback) {
    const {accounts} = await api.account.list()
    const accMap = accounts.reduce((map, account) => map.set(account.publicKey, account.email), new Map())
    const results = await api.pin.list(args.receiver)
    results.pins.forEach(([receiver, pinList]) => {
      const table = new Table({head: ['Title', 'Description', 'Sender']})
      pinList.forEach(pin => {
        table.push([pin.title, pin.description, accMap.get(pin.sender)])
      })
      this.log('- Receiver:', accMap.get(receiver))
      this.log(table.toString())
    })
    callback()
  })

  vorpal.command('join network <address>')
  .action(async function(args, callback) {
    const response = await fetch(`http://${BASE_PATH}/join-network`, post({network: args.address}))
    this.log('Join result', await response.json())
    callback()
  })

  vorpal.command('snapshot')
  .action(async function(args, callback) {
    const response = await fetch(`http://${BASE_PATH}/snapshot`)
    console.log(JSON.stringify(await response.json(), null, 4))
    callback()
  })

  vorpal.command('get-address')
  .action(async function(args, callback) {
    const response = await fetch(`http://${BASE_PATH}/my-address`)
    this.log('my address list', (await response.json()).address)
    callback()
  })
vorpal.delimiter('Team Choice Awards CLI>').show()
})

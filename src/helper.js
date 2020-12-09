import PeerId from "peer-id"
import fs from 'fs'
import crypto from 'crypto'

const SEPARATOR = '$&$'
function signBuffer(arr) {
  return Buffer.from(arr.reduce((sum, value) => sum + SEPARATOR + value))
}

export async function verifyAccount(account) {
  const publicPeer = await PeerId.createFromPubKey(Buffer.from(account.publicKey, "base64"))
  return publicPeer.pubKey.verify(
    signBuffer([account.name, account.email, account.updatedAt]),
    Buffer.from(account.signature, "base64")
  )
}

export async function signAccount(privateKey, account) {
  const {name, email, updatedAt} = account
  return (await privateKey.sign(signBuffer([name, email, updatedAt]))).toString('base64')
}

export async function verifyPin({title, description, sender, receiver, createdAt, signature}) {
  const publicPeer = await PeerId.createFromPubKey(Buffer.from(sender, "base64"))
  return publicPeer.pubKey.verify(
    signBuffer([title, description, receiver, createdAt]),
    Buffer.from(signature, "base64")
  )
}

export async function signPin(privateKey, {title, description, receiver, createdAt}) {
  return (await privateKey.sign(signBuffer([title, description, receiver, createdAt]))).toString('base64')
}

export async function retry(count, fn) {
  let error;
  for (let i = 0; i < count; i++) {
    const result = await fn().catch(err => {
      error = err
      return false
    })
    if (result != false) {
      return result
    }
  }
  throw new Error('too many retries')
}

export function streamToJSON(handler) {
  return async function streamToJSON(source) {
    for await (const msg of source) {
      const srcJson = JSON.parse(msg.toString())
      handler(srcJson)
    }
  }
}

export function readFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if(err) { return reject(err) }
      try {
        if (data && data.length > 0) {
          return resolve(JSON.parse(data))
        } else {
          return resolve({})
        }
      } catch (err) {
        reject(err)
      }
    })
  })
}

export async function validateTransaction({type, sender, createdAt, payload, signature}) {
  const publicPeer = await PeerId.createFromPubKey(Buffer.from(sender, "base64"))
  return publicPeer.pubKey.verify(
    signBuffer([type, sender, createdAt, payload]),
    Buffer.from(signature, "base64")
  )
}

export async function validateBlock({sender, createdAt, transactions, nonce, previousHash, signature}) {
  const publicPeer = await PeerId.createFromPubKey(Buffer.from(sender, "base64"))
  return publicPeer.pubKey.verify(
    signBuffer([sender, createdAt, transactions, nonce, previousHash]),
    Buffer.from(signature, "base64")
  )
}

export async function validateHash({sender, createdAt, transactions, nonce, previousHash, hash}, dificulty = 3) {
  const startWith = '0'.repeat(dificulty)
  const sha256 = crypto.createHash('sha256')

  sha256.update(signBuffer([sender, createdAt, transactions, nonce, previousHash]))
  return hash.indexOf(startWith) === 0 && hash === sha256.digest('hex')
}


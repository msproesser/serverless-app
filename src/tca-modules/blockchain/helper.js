import PeerId from "peer-id"
import { signBuffer } from '../helper'
import crypto from 'crypto'

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

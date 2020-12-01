import PeerId from "peer-id"

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
  console.log('retry error: ', error)
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
import PeerId from "peer-id"

function signBuffer(arr) {
  return Buffer.from(arr.reduce((sum, value) => sum + value))
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

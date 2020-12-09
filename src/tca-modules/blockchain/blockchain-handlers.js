const exemplo = {
  blocks: [
    exemploBlock
  ]
}
const exemploBlock = {
  index: 0,
  sender: '',
  createdAt : Date.now(),
  transactions: [
    exemploTx
  ],
  nonce: 0,
  previousHash: '',
  signature: '',
  hash: ''
}

const exemploTx = {
  type: 'PIN',
  sender: '',
  createdAt: Date.now(),
  payload: JSON.stringify({}),
  signature: '',
}

export function addTransactionCommandHandler(storage) {
  return function addTransaction(command) {
    const transaction = command?.blockchain?.transaction
    if(transaction) {
      storage.addTransaction(transaction)
    }
  }
}

export function addBlockCommandHandler(storage) {
  return function addBlock(command) {
    const block = command?.blockchain?.block
    if(block) {
      storage.addblock(transaction)
    }
  }
}
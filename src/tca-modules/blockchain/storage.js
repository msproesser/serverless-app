
import { validateBlock, validateTransaction, validateHash } from "../../helper"

export default function() {
  const chain = []
  const chainMetadata = {}
  const openBlock = {
    transactions: []
  }

  const storageInterface = {
    async addTransaction(transaction) {
      const valid = await validateTransaction(transaction)
      if (valid) {
        openBlock.transactions.push(transaction)
      }
      return valid
    },
    async addBlock(block) {
      const validBlock = await validateBlock(block)
      const validHash = await validateHash(block, 3)
      const validIndex = block.index == chain.length
      const validPreviousHash = (chain.length === 0 && block.previousHash === 0) || 
                                (chain[chain.length-1].hash === block.previousHash) 
      const isValid = validBlock && validHash && validIndex && validPreviousHash
      if (isValid) {
        const parsedTransactions = JSON.parse(block.transactions)
        openBlock.transactions = openBlock.transactions.filter(tx => 
          !parsedTransactions.find(blockTransaction => tx.signature === blockTransaction.signature)
        )
        chain.push(block)
      }
    },
    challenge(otherChain) {
      //TODO resolver problema de branching
    },
    async load(snapshot) {
      const blocks = snapshot.blockchain || []
      blocks.reduce(
        (last, block) => last.then(_ => storageInterface.addBlock(block)), 
        Promise.resolve({})
      )
    },
    snapshot() {
      return {blockchain: chain}
    }
  }
  return Object.freeze(storageInterface)
}
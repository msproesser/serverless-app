/**
 * api, handlers, load, snapshot
 */

import { validateTransaction } from "../../helper"
import { addBlockCommandHandler, addTransactionCommandHandler } from "./blockchain-handlers"
import BlockchainStorage from './storage'
function apiFactory(communicationInterface) {
  const api = {
    async sendTransaction(transaction) {
      const valid = await validateTransaction(transaction)
      if (valid) {
        communicationInterface.broadcast({blockchain: {transaction}})
      }
      return valid
    },
    closeBlock(block) {
      communicationInterface.broadcast({blockchain: {block}})
    }
  }
}

export default function(communicationInterface) {
  const api = apiFactory(communicationInterface)
  const storage = BlockchainStorage()
  const handlers = [
    addBlockCommandHandler,
    addTransactionCommandHandler
  ]

  return {
    api, handlers,
    load: storage.load,
    snapshot: storage.snapshot
  }
}
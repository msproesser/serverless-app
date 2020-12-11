import { Storage } from "./storage";
import {mergeCommandHandler, syncFeedbackCommandHandler} from './pin-handlers'
import pinApi from "./pin-api";

export default function(communicationInterface) {
  const storage = new Storage
  const handlers = [
    mergeCommandHandler(storage),
    syncFeedbackCommandHandler(storage)
  ]
  const api = pinApi(communicationInterface, storage)

  return {
    handlers, api,
    load: (backup) => storage.load(backup),
    snapshot: () => storage.snapshot(),
    sync: () => storage.snapshot()
  }
} 
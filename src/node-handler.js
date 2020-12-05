import pipe from "it-pipe"
import { streamToJSON } from "./helper"
import fs from 'fs'


export function mergeCommandHandler(storage) {
  return function merge(command) {
    storage.merge(command)
  }
}

export function syncFeedbackCommandHandler(storage) {
  return function syncFeedback(command) {
    if (command.sync) {
      return storage.snapshot()
    }
  }
}

export function doBackupCommandHandler(storage, backupFilePath) {
  return function doBackup() {
    fs.writeFile(backupFilePath, JSON.stringify(storage.snapshot(), null, 4), (err, data) => {
      if (err) { return console.log(err) }
      if (data) { console.log(data) }
    })
  }
}

export default function(handlers = []) {
  function commandHandler(command) {
    return handlers
    .map(handle => handle(command))
    .filter(response => !!response && typeof(response) === 'object')
    .map(JSON.stringify)
  }

  return commandHandler
}
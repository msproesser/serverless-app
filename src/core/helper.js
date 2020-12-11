import { readFile } from "../helper"
import fs from 'fs'

export function mergeModules(modules) {
  return modules.reduce((globalModule, module) => {
    return {
      api: Object.assign(globalModule.api, module.api),
      handlers: [...globalModule.handlers, ...module.handlers]
    }
  }, {api: {}, handlers: []})
}


export async function snapshotLoad(modules, snapshotFile) {
  const snapshot = await readFile(snapshotFile)
  modules.forEach(module => module.load(snapshot))
}

export function snapshotHandler(modules, snapshotFile) {
  return function() {
    setTimeout(() => {
      const snapshot = modules.reduce((snapshot, module) => {
        return Object.assign(snapshot, module.snapshot())
      }, {})
      fs.writeFile(snapshotFile, JSON.stringify(snapshot, null, 4), () => {})
    }, 0)
  }
}

export function nodeHandler(handlers = []) {
  function commandHandler(command) {
    return handlers
    .map(handle => handle(command))
    .filter(response => !!response && typeof(response) === 'object')
    .map(JSON.stringify)
  }
  return commandHandler
}
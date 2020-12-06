

function accountApi(communicationInterface, storage) {
  const api = {}
  api.list = function() {
    return storage.listAccounts()
  }

  api.register = function(account) {
    const patch = { accounts: [ account ] }
    communicationInterface.broadcast(patch)
  }

  return Object.freeze(api)
}

function pinApi(communicationInterface, storage) {
  const api = {}
  api.list = function(receiver) {
    return storage.listPins(receiver)
  }

  api.register = function(pin) {
    const patch = { pins: [ pin ] }
    communicationInterface.broadcast(patch)
  }

  return Object.freeze(api)
}


export default function(communicationInterface, storage) {
  const api = {}
  api.account = accountApi(communicationInterface, storage)
  api.pin = pinApi(communicationInterface, storage)

  return Object.freeze(api)
}
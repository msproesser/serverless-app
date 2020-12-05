

function accountApi(communicationInterface, storage) {
  const api = {}
  api.list = function() {
    return storage.listAccounts()
  }

  api.register = function(account) {
    const patch = { accounts: [ account ] }
    communicationInterface.send(storage.listPeers(), patch)
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
    communicationInterface.send(storage.listPeers(), patch)
  }

  return Object.freeze(api)
}

function joinNetwork(communicationInterface, storage) {
  return function(nodeAddress) {
    const p2pAddress = nodeAddress.substring(nodeAddress.indexOf('/p2p/'))
    const snapshot = storage.snapshot()
    snapshot.sync = true
    return communicationInterface.send([p2pAddress], snapshot)
  }
}

export default function(communicationInterface, storage) {
  const api = {}
  api.account = accountApi(communicationInterface, storage)
  api.pin = pinApi(communicationInterface, storage)
  api.joinNetwork = joinNetwork(communicationInterface, storage)
  api.snapshot = () => storage.snapshot()


  return Object.freeze(api)
}
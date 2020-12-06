export default function() {
  const peers = new Set()

  const storage = {
    list() {
      return [...peers]
    },
    add(peer) {
      peers.add(peer)
    },
    load({peers = []}) {
      peers.forEach(storage.add)
    },
    snapshot() {
      return { peers: storage.list()}
    }
  }
  return Object.freeze(storage)
}
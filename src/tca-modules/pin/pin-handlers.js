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
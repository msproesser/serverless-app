#!/bin/bash

entry() {
  target=$1
  shift
  case $target in
  account)
    onAccounts $@
  ;;
  pin)
    onPins $@
  ;;
  *)
    echo $target "must be account or pin"
  ;;
  esac
}

onAccounts() {
  target=$1
  shift
  case $target in
  list)
    echo "acc list"
  ;;
  register)
    echo "acc register"
  ;;
  *)
    echo $target "must be list or register"
  ;;
  esac
}

onPins() {
  target=$1
  shift
  case $target in
  list)
    echo "pin list"
  ;;
  register)
    echo "pin register"
  ;;
  *)
    echo $target "must be list or register"
  ;;
  esac
}

entry $@
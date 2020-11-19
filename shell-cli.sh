setup() {
  $(mkdir ~/.team-choice-awards)
  touch ~/.team-choice-awards/snapshot.json
  if [ ! -f ~/.team-choice-awards/peer-id.json ]; then
    docker run --rm matsproesser/team-choice-awards \
    npx peer-id --type ed25519 > ~/.team-choice-awards/peer-id.json
  fi
}

start_server() {
  setup
  docker run \
  --restart always \
  --network host \
  --name tca-core \
  -v $HOME/.team-choice-awards/peer-id.json:/app/peer-id.json \
  -v $HOME/.team-choice-awards/snapshot.json:/app/snapshot.json \
  matsproesser/team-choice-awards npm run chain
}

start_cli() {
  docker run -it --rm --network host \
  -v $HOME/.team-choice-awards/peer-id.json:/app/peer-id.json \
  matsproesser/team-choice-awards npm run cli
}

case $1 in
  setup)
    setup
  ;;
  server)
    start_server
  ;;
  cli|client)
    start_cli
  ;;
  *)
    echo "command must be 'server' or 'cli'"
  ;;
esac

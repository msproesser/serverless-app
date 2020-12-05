setup() {
  mkdir -p ~/.team-choice-awards
  touch ~/.team-choice-awards/snapshot.json
  if [ ! -f ~/.team-choice-awards/peer-id.json ]; then
    docker run --rm matsproesser/team-choice-awards \
    npx peer-id --type ed25519 > ~/.team-choice-awards/peer-id.json
  fi
}

start_server() {
  setup
  docker run --restart always --name tca-core \
  -v $HOME/.team-choice-awards/peer-id.json:/app/peer-id.json \
  -v $HOME/.team-choice-awards/snapshot.json:/app/snapshot.json \
  matsproesser/team-choice-awards npm run chain
}

start_cli() {
  docker exec -it tca-core npm run cli
}

refresh() {
  docker stop tca-core 
  docker rm tca-core
  rm $HOME/.team-choice-awards/snapshot.json
  docker pull matsproesser/team-choice-awards
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
    echo "command must be 'server', 'cli' or 'refresh'"
  ;;
esac

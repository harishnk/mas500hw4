#!/bin/bash

APP_CONF='app.conf'


die() {
  echo >&2 -e "\nERROR: $@\n";
  exit 1
}


run() {
  log "\$ $*"
  $*
  code=$?
  [ $code -ne 0 ] && log "> Error code: $code"
}


setup() {
  type pm2 >/dev/null 2>&1 || {
    log "Setting up pm2"
    sudo npm install -g pm2
  }

  if [ ! -e "${APP_ROOT}/logs" ]; then
    mkdir -p "${APP_ROOT}/logs"
    if (test $? -eq 0)
    then
      log "Created logs directory: ${APP_ROOT}/logs"
    else
      log "Error creating logs directory: ${APP_ROOT}/logs"
    fi
  fi

  npm_install
  setup_db
}


setup_db() {
  node "${APP_ROOT}/deploy/setupDb.js"
}


unload() {
  log "Unloading Server..."
  run pm2 delete "${APP_NAME}"
}


load() {
  log "Loading Server..."
  mkdir -p "${APP_ROOT}/logs"
  pm2 dump
  run pm2 start "${APP_ROOT}/app.js" \
      --name "${APP_NAME}" \
      --instances "${INSTANCES}" \
      --pid "${APP_ROOT}/logs/app.pid" \
      --error "${APP_ROOT}/logs/err.log" \
      --output "${APP_ROOT}/logs/out.log" \
      -- write
}

start() {
  node "${APP_ROOT}/app.js"
}


reload() {
  unload
  npm_install
  load
  list
}


npm_install() {
  log "Updating modules..."
  npm install
}

list() {
  log "pm2 list..."
  pm2 list
}

cmd_exists() {
  type $1 2>/dev/null | grep -q 'is a function'
}


#
# and so it begins...
#

if [ -z "$APP_ROOT" ]; then
  echo "Error: APP_ROOT not defined"
  exit 1;
else
  APP_ROOT=${APP_ROOT%/}
  echo "  ○ APP_ROOT=$APP_ROOT"

  cd "$APP_ROOT"
  if [ $? -eq 1 ]; then
    echo "Error: Invalid APP_ROOT"
    exit 1
  fi
fi


source "$APP_ROOT/deploy/conf.sh"
set_config_path "$APP_ROOT/$APP_CONF"
require_env $SECTION_ENV
load_env

if [ "$#" -eq 0 ]; then
  echo "Please specify an action: [setup|setup_db|load|unload|reload|list|env|npm_install|start]"
  exit
fi


cmd_exists "$1"
if [ $? -eq 0 ]; then
  eval "$1"
else
  echo "Error: command not found"
fi

#!/usr/bin/env bash

CONFIG="app.conf"
SECTION_ENV='env'

#
# Abort with <msg>
#

abort() {
  echo
  echo "  $@" 1>&2
  echo
  exit 1
}

#
# Log <msg>.
#

log() {
  echo "  ○ $@"
}

#
# Set configuration file <path>.
#

set_config_path() {
  test -f $1 || abort invalid --config path
  CONFIG=$1
  log "Using config: $CONFIG"
}

#
# Check if config <section> exists.
#

config_section() {
  grep "^\[$1" $CONFIG &> /dev/null
}

#
# Get config value by <key>.
#

config_get() {
    test -n $1 || abort invalid section
    test -n $2 || abort invalid key

    local section=$1
    local key=$2

    require_env $section

    local env_data=$(awk "/^\[$section\]/" RS= $CONFIG)
    echo "$env_data" \
    | grep "^$key" \
    | head -n 1 \
    | cut -d ' ' -f 2-999
}


#
# Require environment arg.
#

require_env() {
  config_section "$1" || abort "[$1] config section not defined"
  test -z "$1" && abort "<env> required"
}


trim() {
    local var=$1;
    var="${var#"${var%%[![:space:]]*}"}";   # remove leading whitespace characters
    var="${var%"${var##*[![:space:]]}"}";   # remove trailing whitespace characters
    echo -n "$var";
}


#
# export environment variables from app.conf
#

load_env() {
    local print=0
    if [[ -n "$1" ]] && [[ $1 -eq 1 ]]; then
        print=1
    fi

    local env_data=$(awk "/^\[$SECTION_ENV\]/" RS= $CONFIG)
    local old_ifs="$IFS"
    IFS=$'\n'
    for line in $env_data
    do
        if [[ "$line" =~ ^[^#]*= ]]; then
            setting_name=$(trim "${line%%=*}")
            setting_value=$(trim "${line#*=}")

            if [ "$print" -eq 1 ]; then
               log "$setting_name=$setting_value"
            else
                export $setting_name=$setting_value
            fi
        fi
    done
    IFS="$old_ifs"
}


env() {
    echo "[$SECTION_ENV]"
    load_env 1
}



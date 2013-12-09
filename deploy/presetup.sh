#!/bin/bash
echo "ENV: APP_ROOT: $APP_ROOT"
echo 'Setting up SSH'
export SSH_CONFIG=~/.ssh/config; mkdir -p ~/.ssh; touch "$SSH_CONFIG"; if !(grep -q "Host bitbucket.org" "$SSH_CONFIG"); then echo -e "Host bitbucket.org\n\tStrictHostKeyChecking no\n" >> $SSH_CONFIG; fi
rm -rf ~/.npm
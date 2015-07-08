#!/bin/bash

if [[ "$OSTYPE" == "linux-gnu" ]]; then
  npm install -g phantomjs
  sudo apt-get --assume-yes install eyeD3 rtmpdump
elif [[ "$OSTYPE" == "darwin"* ]]; then
  brew install eyeD3 phantomjs rtmpdump
else
  echo "UNKNOWN OS"
fi

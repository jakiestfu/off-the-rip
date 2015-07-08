#!/bin/bash

if [[ "$OSTYPE" == "linux-gnu" ]]; then
  sudo apt-get --assume-yes install eyeD3 rtmpdump
elif [[ "$OSTYPE" == "darwin"* ]]; then
  brew install eyeD3 rtmpdump
else
  echo "UNKNOWN OS"
fi

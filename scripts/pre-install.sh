#!/bin/bash

if [[ "$OSTYPE" == "linux-gnu" ]]; then
  sudo apt-get install eyeD3 phantomjs rtmpdump
elif [[ "$OSTYPE" == "darwin"* ]]; then
  brew install eyeD3 phantomjs rtmpdump
else
  echo "UNKNOWN OS"
fi

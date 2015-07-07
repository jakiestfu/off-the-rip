#!/bin/bash

cd /vagrant
echo "cd /vagrant" | sudo tee -a ~vagrant/.profile

apt-get update

# Core
apt-get install -y make g++ git curl vim libcairo2-dev libav-tools nfs-common portmap

# Node
apt-get update
apt-get install -y python-software-properties python g++ make
add-apt-repository -y ppa:chris-lea/node.js
apt-get update
apt-get install -y nodejs

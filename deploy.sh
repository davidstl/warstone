#!/bin/bash

echo --- Update build version
npm version patch -m "deploy.sh"

echo --- Build the web page
npm run-script build

echo --- Create and upload the docker image
cp ./Dockerfile ./build/Dockerfile
cd ./build/
docker build -t braincloud/warstone ./
docker push braincloud/warstone
cd ..

echo --- Stop, pull and restart the docker image on warstone server
ssh warstone 'sudo docker stop warstone'
ssh warstone 'sudo docker rm warstone'
ssh warstone 'sudo docker pull braincloud/warstone'
ssh warstone 'sudo docker run --name warstone -d -p 3000:80 braincloud/warstone'

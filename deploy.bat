echo --- Build the web page
call npm run-script build

echo --- Create and upload the docker image
call xcopy /Y .\Dockerfile .\build\
cd ./build/
call docker build -t braincloud/warstone ./
call docker push braincloud/warstone
cd ..

echo --- Stop, pull and restart the docker image on WarStone server
call plink -ssh -i "%userprofile%/.ssh/warstone.ppk" ec2-user@ec2-18-219-26-183.us-east-2.compute.amazonaws.com "sudo docker stop warstone"
call plink -ssh -i "%userprofile%/.ssh/warstone.ppk" ec2-user@ec2-18-219-26-183.us-east-2.compute.amazonaws.com "sudo docker rm warstone"
call plink -ssh -i "%userprofile%/.ssh/warstone.ppk" ec2-user@ec2-18-219-26-183.us-east-2.compute.amazonaws.com "sudo docker pull braincloud/warstone"
call plink -ssh -i "%userprofile%/.ssh/warstone.ppk" ec2-user@ec2-18-219-26-183.us-east-2.compute.amazonaws.com "sudo docker run --name warstone -d -p 3000:80 braincloud/warstone"

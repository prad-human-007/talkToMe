# talktome
A website where people can talk to ai agents. 

Build the docker image
> docker build -t talktome-fastapi . 

Command to run the docker server 
> docker run -d -it -p 8000:8000 -v $(pwd):/app --entrypoint=bash talktome-fastapi

Then enter the docker container in vscode
Run the uvicorn server with the command uvicorn 
> main:app --host 0.0.0.0 --port 8000 --reload

To run the uvicorn server from the docker container directly build and run the docker image
> docker build -t talktome-fastapi . 
> docker run -d -it -p 8000:8000 talktome-fastapi

Run VITE Server
Go to /frontend
> npm install
> npm run dev
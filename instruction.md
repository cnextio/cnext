# CycAI - Docker setup instructions

# Step 1: Download sample project template

[Skywalker.rar](https://drive.google.com/file/d/1oZQIwDxGoOLGrtW4BdUfv31sjXn2ES7o)

# Step 2: Use docker compose command

1. You need to setup Docker on your computer firstly
2. Create a “deploy” folder
3. Create “.env” file in your computer inside “deploy” folder
    
    IMAGE_NAME = cycai/cnext    
    IMAGE_TAG = v1.0.0 ( cyc ai image version - suggest use lastest)
    CLIENT_PORT = 3000 ( your app port on host machine)
    SERVER_PORT = 4000 (your server side port for our application)
    SOURCE_PROJECT_DIR = c:/Users/HoaTV/cnext_sample_projects ( your source code directory)
    
4. Copy all files inside Skywalker folder to SOURCE_PROJECT_DIR 
5. Create your “docker-compose.yml” inside “deploy” folder

version: '3'

services:
    web:
        image: ${IMAGE_NAME}:${IMAGE_TAG}
        container_name: web
        working_dir: /app/cyc-next-app
        ports:
            - ${CLIENT_PORT}:3000
        command: npm start

    server:
        image: ${IMAGE_NAME}:${IMAGE_TAG}
        container_name: server
        working_dir: /app/cyc-next-app/server
        volumes:
            - ${SOURCE_PROJECT_DIR}:/app/cyc-next-app/server/cnext_sample_projects/Skywalker
        ports:
            - ${SERVER_PORT}:4000
        command: npm start

6. Run command “docker-compose-up” under Command Promt from “deploy” folder
7. Web application will launch at : “http://localhost:CLIENT_PORT”

# Build a image and update version
docker tag [image-name:tag] [new-image-name:new-tag-version]
docker login -u [user] -p [password]
docker push [new-image-name:new-tag-version]
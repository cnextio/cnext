## Latest Instructions

### 1. Install and run web client
From the main folder, do
```
npm install
npm run dev
```

### 2. Install and run server
For the server you will need to install both Nodejs packages and Python packages.
1. for Python packages, you will need to:     
    1. setup the base python env using conda
        - install `conda` python environment
    2. setup our internal python package called `cycdataframe`
        - clone `cycdataframe`
        - install dependencies follow the instructions in the `cycdataframe/README.md`    
    3. setup other python dependencies with
        ```
        conda install -c conda-forge pyzmq pyyaml
        ```
2. for Nodejs packages, you will need to:
   1. Installation: enter folder `server/` and run `npm install`
   2. Configuration: open `.server.yaml`, modify the field `path_to_cycdataframe_lib` to point to the folder where you clone `cycdataframe` (see 1.2 above)

### 3. Create a working project
Think of this like a project in your VSCode env. 
1. Create a project folder. You can create a project any where in the manchine where the server is running.
2. Go to `server/.server.yaml`, modify the field `projects/open_projects/path` to point to the project folder created in step 1

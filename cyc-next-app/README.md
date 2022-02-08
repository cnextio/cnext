## Latest Instructions

### 1. Install and run web client

Go to the `cyc-next-app` folder, do

```
npm install
npm run dev
```

### 2. Install and run server

For the server you will need to install both Nodejs packages and Python packages.

1. for Python packages, you will need to:
   1. clone `cycdataframe`
   1. install `conda` and create an environment (such as `py39`)
   1. setup our internal python package for `cycdataframe`
      - clone `cycdataframe`
      - activate above invironment (`py39`) install dependencies follow the instructions in the `cycdataframe/README.md`
   1. setup other python dependencies with
      ```
      conda install -c conda-forge pyzmq pyyaml
      ```
2. for Nodejs packages, you will need to:
   1. Installation: enter folder `server/` and run `npm install`
   2. Configuration: open `.server.yaml`, modify the field `path_to_cycdataframe_lib` to point to the folder where you clone `cycdataframe` (note the parent folder which include `cycdataframe`)

### 3. Create a working project

Think of this like a project in your VSCode env.

1. Create a project folder or clone `cnext_sample_projects`. You can create a project any where in the manchine where the server is running.
2. Go to `server/.server.yaml`, modify the field `projects/open_projects/path` to point to the project folder created in step 1

### 4. Install and run LS server

1. install all packages in `requirement` file bellow `conda environment` above
2. when u run the command
   1. set `$env:PYTHONPATH = "D:\DEV\CycAI\lsp-server\pyls_jsonrpc\app"` first
   2. run `python .\pyls_server\langserver_ext.py` bellow `py39`

### 5. Setup code formater

1. install `prettier plugin for vs`
2. go to Setting in VS search `format`
   1. choice `Editor format is prettier` and enable `format on save`
   2. search another keyword `single q` and tick it for `prettier`

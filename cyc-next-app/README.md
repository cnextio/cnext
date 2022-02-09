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
    2. Configuration: create `.server.yaml`

        ```yaml
        p2n_comm:
            host: tcp://127.0.0.1
            n2p_port: 5000
            p2n_port: 5001

        path_to_cycdataframe_lib: "${{ PATH_TO_CYCDATAFRAME_LIB }}"

        projects:
            open_projects:
                - id: "1"
                  name: Skywalker
                  path: "${{ PATH_TO_SAMPLE_PROJECT }}"
            active_project: "1"
        ```

        modify the field `path_to_cycdataframe_lib` to point to the folder where you clone `cycdataframe` (see 1.2 above)

    3. Create `.env` file
        ```shell
        PYTHON_PATH= ${{ PATH_TO_EXECUTE_PYTHON }}
        ```

### 3. Create a working project

Think of this like a project in your VSCode env.

1. Create a project folder. You can create a project any where in the manchine where the server is running.

2. Go to `Sample project` repo, create `.cnext.yaml` file

```yaml
executor: ${{ PATH_TO_SAMPLE_PROJECT }}/main.py
open_files:
    - executor: true
      name: main.py
      path: ${{ PATH_TO_SAMPLE_PROJECT }}/main.py
    - executor: false
      name: data_loader.py
      path: ${{ PATH_TO_SAMPLE_PROJECT }}/data_loader.py
    - executor: false
      name: model.py
      path: ${{ PATH_TO_SAMPLE_PROJECT }}/model.py
project_dir: ${{ PATH_TO_SAMPLE_PROJECT }}
```

### 4. Code formater

1. use `prettier plugin for vs`
2. use `single quote` and `tab width = 4`
3. use `print width = 100`

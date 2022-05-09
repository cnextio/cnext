# CNext Instructions

[Website] - [Documentation] - [Docker Image] - [Overview Video]
## Setup and run the CNext workspace

​
CNext is a data-centric workspace for DS and AI. Our workspace is meant to consolidate the most common tasks performed by data scientists and ML engineers. At a high level our workspace allows for:

-   Data exploration & transformation
-   Model development / exploration
-   Production code generation
-   Dashboard & App Generation
-   Experiment Management
## Features

-   Interactive Python coding envrionment with native Python output (think Jupyter replacement)
-   Smart code suggestion (categorical values and column names)
-   Interactive data exploration
-   Automative visualizations
-   Experiment and model management
-   Instant dashboarding
    ​
## Installation via Docker

Step 1: `Download` [cnext] folder and `extract`
Step 2: `setup` [Docker] on your computer
Step 3: Run `docker login` login with your docker account
Step 4: Point destination command to `cnext` directory
Step 5: Run command `docker-compose up -d`
​

-   The web application will launch at : `http://localhost:CLIENT_PORT` or `http://127.0.0.1:CLIENT_PORT/` (CLIENT_PORT default is 3000)
-   To stop the application: `docker-compose down`
-   Note: Pay attention at `CLIENT_PORT`, and `SERVER_PORT` in `.env` file (you will have to change these ports if you already use them on your machine, by default they are 3000 and 4000 respectively)
    ​

## Installation via Pip

​
Step 1: `Download` [cnext] folder and `extract`
Step 2: Make sure `Nodejs` is available in your computer (try `npm --version` and make sure it work)
Step 3: `run` command `pip install cnext`
Step 4: `run` command `cnext-init`
Step 5: `run` command `cnext-path`
​

-   Input `Skywalker folder directory path` and hit `Enter` (Example `C:/Skywalker`)
    ​
    Step 5 `run` command `cnext-run`
    ​
-   Web application will launch at : `http://localhost:CLIENT_PORT` or `http://127.0.0.1:CLIENT_PORT/` (CLIENT_PORT default is 3000)
-   Stop application: `Ctrl + c | Command + c`
-   Note: Pay attention at `CLIENT_PORT`, and `SERVER_PORT` in `.env` file (you will have to change these ports if you already use them on your machine, by default they are 3000 and 4000 respectively)

## License

CYCAI

**Great Software, Hell Yeah!**

[website]: https://www.cnext.io/
[docker image]: https://hub.docker.com/r/cycai/cnext
[documentation]: https://internal-lace-ae4.notion.site/Product-Documentation-0dd58ea1cfe14dfab3666c5ec633ae96
[overview video]: https://youtu.be/5eWPkQIUfZw
[cnext]: https://drive.google.com/file/d/1w4MU3nr0E14PAS_5NmruuoMSfQeE5MLK
[docker]: https://www.docker.com/products/docker-desktop/

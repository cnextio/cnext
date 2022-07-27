# CNext Instructions

[Website] - [Documentation] - [Docker Image] - [Overview Video]

## Setup and run the CNext workspace

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

## Installation via Docker

Step 1: `Download` [cnext] sample project here and `extract`

Step 2: `setup` [Docker] on your computer

Step 3: Run `docker login` login with your docker account

Step 4: Point destination command to `cnext` directory

Step 5: Run command `docker-compose up -d`

-   The web application will launch at : `http://localhost:CLIENT_PORT` or `http://127.0.0.1:CLIENT_PORT/` (CLIENT_PORT default is 3000)
-   To stop the application: `docker-compose down`
-   Note: Pay attention at `CLIENT_PORT`, and `SERVER_PORT` in `.env` file (you will have to change these ports if you already use them on your machine, by default they are 3000 and 4000 respectively)

## Installation via Pip

Step 1: `Download` [cnext] sample project here. This folder will be use as an input in Step 4

Step 2: Make sure `Nodejs` is available in your computer (try `npm --version` and make sure it work)

Step 3: `run` command `pip install cnext`

Step 4: `run` command `cnext-init`

-   Input `Enter path to the cnext sample project created in Step 1` and hit `Enter` (Example `C:/Skywalker`)
    ​

Step 6 `run` command `cnext-run`

-   Web application will launch at : `http://localhost:CLIENT_PORT` or `http://127.0.0.1:CLIENT_PORT/` (CLIENT_PORT default is 3000)
-   Stop application: `Ctrl + c | Command + c`
-   Note: Pay attention at `CLIENT_PORT`, and `SERVER_PORT` in `.env` file (you will have to change these ports if you already use them on your machine, by default they are 3000 and 4000 respectively)

## Release Note

# v0.4.20 - 0.4.29

##### NEW

-   Implement add project feature
-   Add turn on/off markdown

##### IMPROVED

-   Improve setup script
-   Improve usability
-   Improve file explorer style

##### FIXED

-   Bug fixes and usability improvement
-   Fix bugs with panel resizing
-   Fix file path issues on Windows system

# v0.4.18 - 0.4.19

##### NEW

-   Show failed execution status marker

# v0.4.14 - v0.4.16

##### NEW

-   Add configs for dataframe manager.
-   Implement grouped lines folding

##### IMPROVED

-

##### FIXED

-   Fix bugs and improve stability for model visualization.

# v0.4.12 - v0.4.13

##### NEW

-   Allow code to be executed on any file.
-   Improve code suggestion behavior.
-   Load config dynamically from "config.json".

##### IMPROVED

-

##### FIXED

-

# v0.4.10

##### NEW

-   Assign result of a group to only the first line.
-   Add support for full-html-page results using iframe.
-   Add support for .sql and .json files.

##### IMPROVED

-   Improve the ability to support results with javascript. you can now run bokeh plot.

##### FIXED

-

## License

Copyright 2022 CycAI Inc.
​
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
​
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
​
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[website]: https://www.cnext.io/
[docker image]: https://hub.docker.com/r/cycai/cnext
[documentation]: https://internal-lace-ae4.notion.site/Product-Documentation-0dd58ea1cfe14dfab3666c5ec633ae96
[overview video]: https://youtu.be/5eWPkQIUfZw
[cnext]: https://drive.google.com/file/d/1ft4PmFclylOtEAQSPBqn9nUSyAkMs5R-
[docker]: https://www.docker.com/products/docker-desktop/

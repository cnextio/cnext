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

cnext is also available via pre-built Docker images. To get started, you can simply run the following command:

```bash
docker run --rm -it -p 4000:4000 -p 5000:5000 -p 5011:5011 -p 5008:5008 -p 5005:5005 cycai/cnext
```

The web application will launch at: `http://localhost:4000` or `http://127.0.0.1:4000/`

## Installation via Pip

PLEASE NOTE: CNext requires npm >= 18.4 and Python >= 3.9.7 . Please ensure your environment meets the minimum requirements before beginning the installation. 

Step 1: Make sure `Nodejs` is available in your computer (try `npm --version` and make sure it work)

Step 2: `run` command `pip install cnext`

Step 3: `run` command `cnext-init`

-   Input `Enter path to the cnext sample project created in Step 1` and hit `Enter` (Example `C:/Skywalker`)
    ​

Step 4 `run` command `cnext-run`

-   Web application will launch at : `http://localhost:CLIENT_PORT` or `http://127.0.0.1:CLIENT_PORT/` (CLIENT_PORT default is 4000)
-   Stop application: `Ctrl + c | Command + c`
-   Note: Pay attention at `CLIENT_PORT`, and `SERVER_PORT` in `.env` file (you will have to change these ports if you already use them on your machine)


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
[documentation]: https://docs.cnext.io/
[overview video]: https://youtu.be/5eWPkQIUfZw
[cnext]: https://drive.google.com/file/d/1ft4PmFclylOtEAQSPBqn9nUSyAkMs5R-
[docker]: https://www.docker.com/products/docker-desktop/

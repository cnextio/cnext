<div align="center">
  <a href="https://www.cnext.io">
    <img
      src="https://avatars.githubusercontent.com/u/105595528?s=200&v=4"
      alt="CNext Logo"
      height="64"
    />
  </a>
  <br />
  <p>
    <h3>
      <b>
        CNext
      </b>
    </h3>
  </p>
  <p>
    <b>
      Open source workspace designed for DS & AI workflows
    </b>
  </p>
  <p>
     <a href="https://pepy.tech/project/cnext">
     <img
        src="https://static.pepy.tech/personalized-badge/cnext?period=total&units=international_system&left_color=black&right_color=green&left_text=Downloads"
        alt="Cnext"
      />
      </a>
      <a href="https://docs.cnext.io/">
      <img
        src="https://img.shields.io/badge/docs-GitBook-blue"
        alt="docs"
      />
      </a>
      <a href="https://www.cnext.io/">
      <img
        src="https://img.shields.io/badge/website-CNext-brightgreen"
        alt="site"
      />
      </a>
      <a href="https://hub.docker.com/r/cycai/cnext">
      <img
        src="https://img.shields.io/badge/docker-CNext-blue"
        alt="docker"
      />
      </a>
      <a href="https://www.youtube.com/watch?v=5eWPkQIUfZw">
      <img
        src="https://img.shields.io/badge/demo-YouTube-red"
        alt="youtube"
      />
      </a>
      <a href="https://join.slack.com/t/cnextcommunity/shared_invite/zt-1ay12cvpx-M29uASHZbFfQ989tVgCHVg">
      <img
        src="https://img.shields.io/badge/chat-Slack-purple"
        alt="slack"
      />
      </a>
  </p>
  <p>
    <sub>
      Built with ❤︎ by
      <a href="https://github.com/cnextio/cnext/graphs/contributors">
        contributors
      </a>
    </sub>
  </p>
  
  <a href="https://www.cnext.io" target="_blank">
      <img
        src="https://www.cnext.io/gifs/2nd.gif"
        alt="Cnext"
        width="80%"
      />
</div>




## 🔮 Overview

CNext is a workspace for DS and AI workflows. This workspace is meant to consolidate the most common tasks performed by data scientists and ML engineers. At a high level our workspace allows for:

-   Data exploration & transformation
-   Model development / exploration
-   Production code generation
-   Dashboard & App Generation
-   Experiment Management

## 📢 Features

-   Interactive Python coding envrionment with native Python output (think Jupyter replacement)
-   Smart code suggestion (categorical values and column names)
-   Interactive data exploration
-   Automative visualizations
-   Experiment and model management
-   Instant dashboarding

🚀 **Requests:** We're actively developing features based off user feedback, if you'd like to make any suggestions please feel free to hit us up on Slack. 

## 📄 Installation via Pip

PLEASE NOTE: CNext requires npm >= 18.4 and Python >= 3.9.7 . Please ensure your environment meets the minimum requirements before beginning the installation. 

Step 1: Make sure `Nodejs` is available in your computer (try `npm --version`)

Step 2: `run` command `pip install -U cnext`

Step 3: `run` command `cnext`

-   Input `Enter path to the cnext sample project created in Step 1` and hit `Enter` (Example `C:/Skywalker`)

-   Web application will launch at : `http://localhost:CLIENT_PORT` or `http://127.0.0.1:CLIENT_PORT/` (CLIENT_PORT default is 4000)
-   Stop application: `Ctrl + c | Command + c`
-   Note: Pay attention at `CLIENT_PORT`, and `SERVER_PORT` in `.env` file (you will have to change these ports if you already use them on your machine)

## 📄 Installation via Docker

cnext is also available via pre-built Docker images. To get started, you can simply run the following command:

```bash
docker run --rm -it -p 4000:4000 -p 5000:5000 -p 5011:5011 -p 5008:5008 -p 5005:5005 cycai/cnext
```

The web application will launch at: `http://localhost:4000` or `http://127.0.0.1:4000/`

## License

Copyright 2022 CycAI Inc. Distributed under MIT License. 
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

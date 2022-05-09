# CNext Instructions
​
## Setup and run the CNext workspace
​
CNext is a data-centric workspace for DS and AI. Our workspace is meant to consolidate the most common tasks performed by data scientists and ML engineers. At a high level our workspace allows for:
​
-   Data exploration & transformation
-   Model development / exploration
-   Production code generation
-   Dashboard & App Generation
-   Experiment Management
​
## Features
​
-   Interactive Python coding envrionment with native Python output (think Jupyter replacement)
-   Smart code suggestion (categorical values and column names)
-   Interactive data exploration
-   Automative visualizations
-   Experiment and model management
-   Instant dashboarding
​
[Website] - [Documentation] - [Docker Image] - [Overview Video]
​
## Installation via Docker
​
Step 1: `Download` [cnext] folder and `extract`
​
Step 2: `setup` [Docker] on your computer
​
Step 3: Run `docker login` login with your docker account
​
Step 4: Point destination command to `cnext` directory
​
Step 5: Run command `docker-compose up -d`
​
-   The web application will launch at : `http://localhost:CLIENT_PORT` or `http://127.0.0.1:CLIENT_PORT/` (CLIENT_PORT default is 3000)
-   To stop the application: `docker-compose down`
-   Note: Pay attention at `CLIENT_PORT`, and `SERVER_PORT` in `.env` file (you will have to change these ports if you already use them on your machine, by default they are 3000 and 4000 respectively)
​
## Installation via Pip
​
Step 1: `Download` [cnext] folder and `extract`
​
Step 2: Make sure `Nodejs` is available in your computer (try `npm --version` and make sure it work)
​
Step 3: `run` command `pip install cnext`
​
Step 4: `run` command `cnext-init`
​
Step 5: `run` command `cnext-path`
​
-   Input `Skywalker folder directory path` and hit `Enter` (Example `C:/Skywalker`)
​
Step 5 `run` command `cnext-run`
​
-   Web application will launch at : `http://localhost:CLIENT_PORT` or `http://127.0.0.1:CLIENT_PORT/` (CLIENT_PORT default is 3000)
-   Stop application: `Ctrl + c | Command + c`
-   Note: Pay attention at `CLIENT_PORT`, and `SERVER_PORT` in `.env` file (you will have to change these ports if you already use them on your machine, by default they are 3000 and 4000 respectively)
​
<!-- ## Comments
​
Quoc Tran - Principal Data Scientist - Walmart Lab
​
> Save the deployment time: our sientists usually develop the model on python
> notebooks, then transfer the final model to software engineers to make the code
> ready for deployment. This step is time-comuming and sometimes a bottleneck
> when the engineers are too busy or can not replicate the same results as in the notebook.
> Cnext helps eliminate this step since the code is deployment-ready.
> We have an internal team to try to automate this step but so far the results are limited.
​
> CNext also has helped speed up the data discovery step since we can conveniently
> see all the data with different formats in the same place together with just the same
> common slice and dice techniques that our scientists are very famiilar with.
​
> Save time in parameter tuning and model output evaluation: for classification tasks,
> most of our training time is used at parameter tuning and evaluating the model
> output in underperformed classes. CNext has helped save a lot of time here since
> we can visualize the result fast after running and can reduce the time in between runs.
​
Xian Fang - Sr.Data Scientist - Roofstock
​
> Realy like the normal coding interface and the intergration with data and models as
> the first class citizen. The window layout makes it very easy to see data while working on
> transformations and building models.
​
Karim Filali - Principal Applied Scientist - Microsoft
​
> CNext addresses a crucial and, in many ways, overlooked aspect of ML development
> that requires good understanding of the data and detection of any anomalies or patterns
> indicative of biased collection or insufficient coverage of important phenomena.
​
> CNext integrated approach helps automate and guide many of the routine operations in
> a Data Scient pipeline, similar to how modern software engineering tools help with
> writing code via completion, search functionality, static analysis, common bug detection, profilling, ...
> Reducing Scientists' cognitive load in areas involving data preparation, standardized trainning/testing
> patterns, and hyperparameter search helps them focus on what is truly unique to their ML application.
​
Anh Dinh - Sr. Manager machine Learning - Zendesk
​
> CNext is particulary useful for data scientists on my team to iterate quikly on their experiments.
> Without CNext, the bottleneck in their research workflow is the ability to switch from the data
> exploration phase to model research phase and back to data exploration seamlessly. By having these two phases fully integrated into a single view, it helps scientists to keep the context and make changes more effectively. If there is VSCode for software engineers, CNext yields potentital for a much needed development environment for data scientists. -->
​
## License
​
CYCAI
​
**Great Software, Hell Yeah!**
​
[//]: # "These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax"
[website]: https://www.cnext.io/
[documentation]: https://internal-lace-ae4.notion.site/Product-Documentation-0dd58ea1cfe14dfab3666c5ec633ae96
[docker image]: https://hub.docker.com/r/cycai/cnext
[overview video]: https://youtu.be/5eWPkQIUfZw
[cnext]: https://drive.google.com/file/d/1w4MU3nr0E14PAS_5NmruuoMSfQeE5MLK
[docker]: https://www.docker.com/products/docker-desktop/
​
<!--
# Build a image and update version
docker tag [image-name:tag] [new-image-name:new-tag-version]
docker login -u [user] -p [password]
docker push [new-image-name:new-tag-version] -->
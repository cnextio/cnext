# Cycai/CNext Docker Instruction
## Setup and run CNext web application tool in docker image

Cyc AI is an application focusing on improve the AI development life cycle
- Convinient code editor like coding normal
- Combine smart UI to control the infomation
- Simple but power full
- Setup easily

## Features
- Create and get your coding easily
- Visualize your data infomation in machine learning
- Behavior follow easily
- Console output
- Customize

More about CycAI.
[Website] - [Docker Image] - [Overview Video]

## Installation
Step 1: ```Download``` [cnext] folder and ```extract```

Step 2: ```setup``` [Docker] on your computer 

Step 3: run ```docker login``` login with your docker account

Step 4: point destination command to `cnext` directory

Step 5: Specific for ```MacOS\Linux\Ubuntu``` :
- in ```MacOS\Linux\Ubuntu``` run: ```sed -i 's/%cd%/pwd/g' .env```
- in ```Windows```: next to step 6

Step 6: Run command ```docker-compose up -d```
- Web application will launch at : ```http://localhost:CLIENT_PORT``` or ```http://127.0.0.1:CLIENT_PORT/```
- Stop application: ```docker-compose down```
- Note: Pay attention at ```CLIENT_PORT```, and ```SERVER_PORT``` in ```.env``` file (you will have to change these ports if you already use them on your machine)

## Comments
Quoc Tran - Principal Data Scientist - Walmart Lab
> Save the deployment time: our sientist usually develop the model on python
 notebook, then transfer the final model to software engineers to make the code
 ready for deployment. This step is time-comuming and sometimes a bottleneck
 when the engineers are to busy or can not replicate the same results as in the notebook.
 Cnext helps eliminate this step since the code is deployment-ready.
 We have an internal team to try to automate this step but so far the results are limited.

> CNext also has helped speed up the data discovery step since we can conveniently
 see all the data with different formats in the same place together with just the same 
 common slice and dice techniques that our scientists are very famiilar with.

> Save time in parameter tuning and model output evaluation: for classification tasks,
most of our training time is used at parameter tuning and evaluating the model
output in underperformed classes. CNext has heled save a lot of time here since
we can visualize the result fast after running and can reduce the time in between runs.

Xian Fang - Sr.Data Scientist - Roofstock
> Realy like normal coding interface and the intergration with data and models as 
the firs class citizen. Window layout make it very easy to see data while working on 
transformation and building model

Karim Filali - Principal Applied Scientist - Microsoft
> CNext addresses a crucial and, in many ways, overlooked aspect of ML development
that requires good understanding of the data and detection of any anomalies or patterns 
indicative of biased collection or insufficient coverage of important phenomena.

> CNext integrated approach helps automate and guide many of the routine operations in 
a Data Scient pipeline, similar in how modern software engineering tools help with 
writing code via completion, search functionality, static analysis, common bug detection, profilling, ...
Reducing Scientists' cognitive load in areas involving data preparation, standardized trainning/testing
patterns, and hyperparameter search helps them focus on what is truly unique to their ML application.

Anh Dinh - Sr. Manager machine Learning - Zendesk
> CNext is particulary useful fordata scientist on my team to iterate quikly ontheir experiments. 
Without CNext, the bottleneck in their research workflow is the ability to switch from the data 
exploration phase to model research phase and back to data exploration seamlessly. By having these two phases fully integrated into a single view, it helps scientists to keep the context and make changes more effectively. If there is
VSCode for software engineer, CNext yield potentital for a much needed development environment for data scientists.

## License

CYCAI

**Great Software, Hell Yeah!**

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

   [Website]: <https://cyc-ai.com/>
   [Docker Image]: <https://hub.docker.com/r/cycai/cnext>
   [Overview Video]:<https://youtu.be/5eWPkQIUfZw>
   [cnext]:<https://drive.google.com/file/d/1JBSzcm_TMZisQdijw_ub1LlSMP7b0Cc6>
   [Docker]: <https://www.docker.com/products/docker-desktop/>

# Build a image and update version
docker tag [image-name:tag] [new-image-name:new-tag-version]
docker login -u [user] -p [password]
docker push [new-image-name:new-tag-version]
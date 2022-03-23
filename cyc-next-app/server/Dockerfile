# #CONDA
FROM conda as conda
ENV PORT 80
WORKDIR /home/conda
COPY . .

FROM node:16.13.1
WORKDIR /home/conda
COPY --from=conda /home/conda /home/conda
COPY . .
RUN npm install
# Run python script
CMD ["npm", "start"]
# CMD ["python", "test.py"]
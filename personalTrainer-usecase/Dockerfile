FROM node:8

RUN useradd personalTrainer-usecase

WORKDIR /home/personalTrainer-usecase

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY start.sh start.sh
COPY app.js app.js

RUN chown -R personalTrainer-usecase:personalTrainer-usecase ./
USER personalTrainer-usecase

EXPOSE 5011
CMD ["./start.sh"]

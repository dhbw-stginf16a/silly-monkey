FROM node:8

RUN useradd personaltrainer-usecase

WORKDIR /home/personaltrainer-usecase

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY start.sh start.sh
COPY app.js app.js

RUN chown -R personaltrainer-usecase:personaltrainer-usecase ./
USER personaltrainer-usecase

EXPOSE 5011
CMD ["./start.sh"]

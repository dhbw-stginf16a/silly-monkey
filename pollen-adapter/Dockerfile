FROM node:8

RUN useradd pollen-adapter

WORKDIR /home/pollen-adapter

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY start.sh start.sh
COPY app.js app.js
COPY routes routes

RUN chown -R pollen-adapter:pollen-adapter ./
USER pollen-adapter

EXPOSE 5003
CMD ["./start.sh"]

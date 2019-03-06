FROM node:8

RUN useradd wetter-adapter

WORKDIR /home/wetter-adapter

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY start.sh start.sh
COPY app.js app.js
COPY routes routes

RUN chown -R wetter-adapter:wetter-adapter ./
USER wetter-adapter

EXPOSE 5004
CMD ["./start.sh"]

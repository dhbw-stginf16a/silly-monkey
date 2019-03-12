FROM node:8

RUN useradd verkehr-adapter

WORKDIR /home/verkehr-adapter

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY start.sh start.sh
COPY app.js app.js
COPY routes routes

RUN chown -R verkehr-adapter:verkehr-adapter ./
USER verkehr-adapter

EXPOSE 5005
CMD ["./start.sh"]

FROM node:8

RUN useradd calender-adapter

WORKDIR /home/calender-adapter

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY start.sh start.sh
COPY app.js app.js

RUN chown -R calender-adapter:calender-adapter ./
USER calender-adapter

EXPOSE 5002
CMD ["./start.sh"]

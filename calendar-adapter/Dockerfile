FROM node:8

RUN useradd calendar-adapter

WORKDIR /home/calendar-adapter

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY . .

RUN chown -R calendar-adapter:calendar-adapter ./
USER calendar-adapter

EXPOSE 5002
CMD [ "npm", "start" ]

FROM node:8

RUN useradd daily-overview-usecase

WORKDIR /home/daily-overview-usecase

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY . .

RUN chown -R daily-overview-usecase:daily-overview-usecase ./
USER daily-overview-usecase

EXPOSE 5013
CMD [ "npm", "start" ]

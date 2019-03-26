FROM node:8

RUN useradd homeoffice-usecase

WORKDIR /home/homeoffice-usecase

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY . .

RUN chown -R homeoffice-usecase:homeoffice-usecase ./
USER homeoffice-usecase

EXPOSE 5013
CMD [ "npm", "start" ]

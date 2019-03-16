FROM node:8

RUN useradd vvs-adapter

WORKDIR /home/vvs-adapter

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY . .

RUN chown -R vvs-adapter:vvs-adapter ./
USER vvs-adapter

EXPOSE 5002
CMD [ "npm", "start" ]

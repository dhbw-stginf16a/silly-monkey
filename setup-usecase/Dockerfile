FROM node:8

RUN useradd setup-usecase

WORKDIR /home/setup-usecase

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY . .

RUN chown -R setup-usecase:setup-usecase ./
USER setup-usecase

EXPOSE 5012
CMD ["./start.sh"]

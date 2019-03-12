FROM node:8

RUN useradd goodmorning-usecase

WORKDIR /home/goodmorning-usecase

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY start.sh start.sh
COPY index.js index.js

RUN chown -R goodmorning-usecase:goodmorning-usecase ./
USER goodmorning-usecase

EXPOSE 5010
CMD ["./start.sh"]

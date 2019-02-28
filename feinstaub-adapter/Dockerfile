FROM node:8

RUN useradd feinstaub-adapter

WORKDIR /home/feinstaub-adapter

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY start.sh start.sh
COPY index.js index.js

RUN chown -R feinstaub-adapter:feinstaub-adapter ./
USER feinstaub-adapter

EXPOSE 5001
CMD ["./start.sh"]

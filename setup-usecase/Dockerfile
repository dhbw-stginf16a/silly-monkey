FROM python:3.6-alpine

RUN adduser -D setup-usecase

WORKDIR /home/setup-usecase

# Flask and requests dependencies
RUN apk add gcc musl-dev libffi-dev openssl-dev

COPY requirements.txt requirements.txt
RUN python -m venv venv
RUN venv/bin/pip install -r requirements.txt

COPY . .

RUN chown -R setup-usecase:setup-usecase ./
USER setup-usecase

ENV FLASK_APP setup_usecase
EXPOSE 5012
CMD ["./start.sh"]

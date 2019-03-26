FROM python:3.6-alpine

RUN adduser -D trigger-router

WORKDIR /home/trigger-router

# Flask and requests dependencies
RUN apk add gcc g++ musl-dev libffi-dev openssl-dev

COPY requirements.txt requirements.txt
RUN python -m venv venv
RUN venv/bin/pip install -r requirements.txt

COPY . .

RUN chown -R trigger-router:trigger-router ./
USER trigger-router

ENV FLASK_APP trigger_router
EXPOSE 5000
CMD ["./start.sh"]

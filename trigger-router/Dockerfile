FROM python:3.6-alpine

RUN adduser -D trigger-router

WORKDIR /home/trigger-router

RUN apk add gcc musl-dev libffi-dev openssl-dev

COPY requirements.txt requirements.txt
RUN python -m venv venv
RUN venv/bin/pip install -r requirements.txt

COPY trigger-router trigger-router
COPY start.sh ./

ENV FLASK_APP trigger-router

RUN chown -R trigger-router:trigger-router ./
USER trigger-router

EXPOSE 5000
CMD ["./start.sh"]

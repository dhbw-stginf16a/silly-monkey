FROM python:3.6-alpine

RUN adduser -D trigger-router

WORKDIR /home/trigger-router

# Flask and requests dependencies
RUN apk add gcc musl-dev libffi-dev openssl-dev
# psycopg2 dependencies
RUN apk add postgresql-dev gcc python3-dev musl-dev

COPY requirements.txt requirements.txt
RUN python -m venv venv
RUN venv/bin/pip install -r requirements.txt

COPY trigger_router trigger_router
COPY start.sh ./

ENV FLASK_APP trigger_router

RUN chown -R trigger-router:trigger-router ./
USER trigger-router

EXPOSE 5000
CMD ["./start.sh"]

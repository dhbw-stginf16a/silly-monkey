FROM python:3.6-alpine

RUN adduser -D api-test

WORKDIR /home/api-test

COPY requirements.txt requirements.txt
RUN python -m venv venv
RUN venv/bin/pip install -r requirements.txt

COPY . .

RUN chown -R api-test:api-test ./
USER api-test

#CMD [ "py.test" "test_minimal.tavern.yaml" "-v" ]
CMD ["./start.sh"]

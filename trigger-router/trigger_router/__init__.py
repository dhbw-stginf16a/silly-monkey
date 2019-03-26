import json

from flask import Flask, request, jsonify
import redis
from firebase_admin import messaging, credentials, initialize_app

from .callers import callHomeOffice, callPersonalTrainer, callGoodmorning, callDailyOverview


app = Flask(__name__)


@app.errorhandler(404)
def page_not_found(e):
    return jsonify({
            "error": "Content not found",
            "details": "Tried to access {}".format(request.path)
        }), 404


@app.before_first_request
def init_db_connection():
    cred = credentials.Certificate("/home/trigger-router/trigger_router/serviceAccountKey.json")
    initialize_app(cred)

@app.route("/proactive", methods=["POST"])
def proactive():
    try:
        jsonRequest = request.get_json()
        use_case = jsonRequest["use-case"]
        text = jsonRequest["text"]
    except TypeError:
        return jsonify({"error": "Wrong request body!"}), 400

    message = messaging.Message(
        notification=messaging.Notification(
            title="New message from {}".format(use_case),
            body=text,
        ),
        topic="proactive",
    )

    # Send a message to devices subscribed to the combination of topics
    # specified by the provided condition.
    response = messaging.send(message)
    # Response is a message ID string.
    return jsonify({ "result": 'Successfully sent message: "{}"'.format(response)})


@app.route("/trigger", methods=["POST"])
def genericTrigger():
    try:
        jsonRequest = request.get_json()
        trigger = jsonRequest["trigger"]["type"]
        parameters = jsonRequest["trigger"]["parameters"]
    except TypeError:
        return jsonify({"error": "Wrong request body!"}), 400

    if trigger == "HomeOffice":
        return callHomeOffice(parameters)
    elif trigger == "PersonalTrainer":
        return callPersonalTrainer(parameters)
    elif trigger == "GoodMorning":
        return callGoodmorning(parameters)
    elif trigger == "DailyOverview":
        return callDailyOverview(parameters)
    else:
        return "Trigger '{}' was triggered, but we don't know how to handle it!".format(trigger)


@app.route("/database/<key>", methods=["GET", "POST", "DELETE"])
def database(key):
    r = redis.Redis(host='database', port=6379, db=0)

    if request.method == "DELETE":
        r.delete(key)
        return ('', 200)

    status_code = 200
    if request.method == "POST":
        jsonRequest = request.get_json()
        value = json.dumps(jsonRequest["value"]).encode()
        r.set(key, value)
        status_code = 201

    value = r.get(key)
    if not value:
        return jsonify({"error": "Key not found"}), 404

    return jsonify({"value": {
        key: json.loads(value.decode())
    }}), status_code

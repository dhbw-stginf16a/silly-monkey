import json

from flask import Flask, request, jsonify
import redis

from .callers import callHomeOffice, callPersonalTrainer


app = Flask(__name__)


@app.errorhandler(404)
def page_not_found(e):
    return jsonify({
            "error": "Content not found",
            "details": "Tried to access {}".format(request.path)
        }), 404


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
    else:
        return "Trigger '{}' was triggered, but we don't know how to handle it!".format(trigger)


@app.route("/database/<key>", methods=["GET", "POST", "DELETE"])
def database(key):
    r = redis.Redis(host='database', port=6379, db=0)
    if request.method == "POST":
        jsonRequest = request.get_json()
        value = json.dumps(jsonRequest["value"]).encode()
        r.set(key, value)
    elif request.method == "DELETE":
        r.delete(key)

    value = r.get(key)
    if not value:
        return jsonify({"error": "Key not found"}), 404

    return jsonify({"database-entry": {
        key: json.loads(value.decode())
    }})

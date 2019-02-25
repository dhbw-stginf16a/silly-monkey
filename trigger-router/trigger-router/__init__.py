from flask import Flask, request, jsonify

from . import callers


app = Flask(__name__)


@app.errorhandler(404)
def page_not_found(e):
    return jsonify({"error": "page not found"}), 404


@app.route("/trigger")
def genericTrigger(methods=['POST']):
    try:
        jsonRequest = request.get_json()
        trigger = jsonRequest["trigger"]["type"]
        parameters = jsonRequest["trigger"]["parameters"]
    except TypeError:
        return jsonify({"error": "Wrong request body!"}), 400

    if trigger == "HomeOffice":
        return callHomeOffice()
    else:
        return "Trigger '{}' was triggered, but we don't know how to handle it!".format(trigger)

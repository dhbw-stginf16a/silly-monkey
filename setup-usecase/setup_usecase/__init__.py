import json

from flask import Flask, request, jsonify
import requests


app = Flask(__name__)


@app.errorhandler(404)
def page_not_found(e):
    return jsonify({
            "error": "Content not found",
            "details": "Tried to access {}".format(request.path)
        }), 404


@app.route("/setup", methods=["GET", "POST", "DELETE"])
def genericTrigger():
    defaultSettings = {}
    with open("database-defaults.json", "r") as f:
        defaultSettings = json.load(f)

    if request.method == "GET":
        settings = {}
        fullySetup = True
        unset = []

        for key in defaultSettings:
            r = requests.get("http://trigger-router:5000/database/{}".format(key))
            if r.status_code == 404:
                fullySetup = False
                unset.append(key)
            else:
                res = r.json()
                settings[key] = res["database-entry"][key]

        return jsonify({
            "setup": settings,
            "fullySetup": fullySetup,
            "unset": unset
        })
    elif request.method == "POST":
        requestJson = request.get_json()

        for key, val in requestJson["setup"].items():
            if not key in defaultSettings:
                return jsonify({
                    "error": "This key doesn't exist"
                }), 400
            requests.post("http://trigger-router:5000/database/{}".format(key), data={
                "value": val
            })
    elif request.method == "DELETE":
        for key in defaultSettings:
            requests.delete("http://trigger-router:5000/database/{}".format(key))
            return jsonify({
                "status": "Deleted all setttings"
            })
        pass
    else:
        pass  # Cannot happen

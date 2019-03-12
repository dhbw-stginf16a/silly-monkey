from flask import jsonify, request
import requests


def callHomeOffice(parameters):
    return jsonify({"result": "Called HomeOffice use case"})

def callPersonalTrainer(parameters):
    # Ignore parameters for know
    # Question: What training should I do today?
    res = requests.get("http://personaltrainer-usecase:5011/whatTraining", data={}).json()
    return jsonify({"answer": res["answer"]})

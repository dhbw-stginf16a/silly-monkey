from flask import jsonify, request
import requests


def callHomeOffice(parameters):
    return jsonify({"result": "Called HomeOffice use case"})

def callPersonalTrainer(parameters):
    # Ignore parameters for know
    # Question: What training should I do today?
    res = requests.get("http://personaltrainer-usecase:5011/whatTraining", json={}).json()
    return jsonify({"answer": res["answer"]})

def callGoodmorning(parameters):
    res = requests.get("http://goodmorning-usecase:5010/userGreeting", json={}).json()
    return jsonify({"answer": res["answer"]})

def callDailyOverview(parameters):
    res = requests.get("http://daily-overview-usecase:5013/getOverviw", json={}).json()
    return jsonify({"answer": res["answer"]})

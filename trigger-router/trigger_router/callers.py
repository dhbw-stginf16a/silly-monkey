from flask import jsonify
import requests


def callHomeOffice():
    return jsonify({"result": "Called HomeOffice use case"})

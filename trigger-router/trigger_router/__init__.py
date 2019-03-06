from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

from .callers import callHomeOffice
from .models import db, Allergy
from .schemas import AllergySchema, PersonalDetailsSchema


db_config = {
    "user": "postgres",
    "password": "chei1eixoo5Bohku",
    "host": "database",
    "database": "preferences",
}


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://{user}:{password}@{host}/{database}".format(**db_config)
db.init_app(app)


@app.before_first_request
def create_database():
    db.create_all()


@app.errorhandler(404)
def page_not_found(e):
    return jsonify({
            "error": "Page not found",
            "details": "Tried to access {}".format(request.path)
        }),404


@app.route("/trigger")
def genericTrigger(methods=["POST"]):
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

@app.route("/allergies", methods=["GET", "POST"])
def allergies():
    if request.method == "POST":
        data = request.get_json()
        for allergy in data["allergies"]:
            exists = Allergy.query.filter_by(name=allergy).first()
            if not exists:
                db.session.add(Allergy(name=allergy))
        db.session.commit()

    allergies = Allergy.query.all()
    schema = AllergySchema()
    return jsonify({ "allergies": [str(x) for x in allergies]})

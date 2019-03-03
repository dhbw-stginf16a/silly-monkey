from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class Allergy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)

    def __repr__(self):
        return self.name


class PersonalDetails(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    lastLocation = db.Column(db.String(80), unique=True, nullable=False)

    def __repr__(self):
        return "{}@{}".format(self.name, self.lastLocaiton)

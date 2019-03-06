from marshmallow import Schema, fields

from .models import Allergy, PersonalDetails

class AllergySchema(Schema):
    name = fields.Str()

class PersonalDetailsSchema(Schema):
    name = fields.Str()

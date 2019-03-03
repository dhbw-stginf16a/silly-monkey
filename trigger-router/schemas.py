from marshmallow import Schema, fields, ValidationError, pre_load

from .models import *

class AllergySchema(Schema):
    id = filds.Int(load_only=True)
    name = fields.Str()

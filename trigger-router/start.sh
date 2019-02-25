#! /bin/sh
if [ -z "$FLASK_APP" ]
then
    export FLASK_APP=trigger-router
else
    source venv/bin/activate
fi
flask run --host=0.0.0.0

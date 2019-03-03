#! /bin/sh
if [ -z "$FLASK_APP" ]
then
    export FLASK_APP=trigger_router
else
    source venv/bin/activate
fi
flask run --host=0.0.0.0 --port=5000

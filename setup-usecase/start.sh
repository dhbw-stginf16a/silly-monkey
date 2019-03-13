#! /bin/sh
if [ -z "$FLASK_APP" ]
then
    export FLASK_APP=setup_usecase
else
    source venv/bin/activate
fi
flask run --host=0.0.0.0 --port=5012

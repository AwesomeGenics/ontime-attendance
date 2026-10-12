from flask import Flask, session
from flask_session import Session
from app.routes import tracker
from app.auth import auth
from app.acc_db import acc_db_init
from app.track_db import track_db_init
from dotenv import load_dotenv
import os

app = Flask(__name__)

acc_db_init()
track_db_init()
app.config['SESSION_TYPE'] = 'filesystem'   # needed for Flask-Session
load_dotenv()
app.secret_key = os.environ['SECRET_KEY']

Session(app)

app.register_blueprint(tracker)
app.register_blueprint(auth)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
# flask_app.py
from flask import Flask, render_template
import requests

app = Flask(__name__)

@app.route("/")
def home():
    res = requests.get("http://127.0.0.1:8000/api")
    data = res.json()
    return render_template("index.html", message=data["message"])

if __name__ == "__main__":
    app.run(debug=True)
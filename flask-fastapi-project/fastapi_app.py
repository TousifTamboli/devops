# fastapi_app.py
from fastapi import FastAPI

api = FastAPI()

@api.get("/api")
def get_message():
    return {"message": "Hi from FastAPI 🚀"}
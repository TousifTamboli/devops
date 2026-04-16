from fastapi import FastAPI

api = FastAPI()

@api.get("/")
def root():
    return {"message": "Hi from root 🚀"}

@api.get("/api")
def get_message():
    return {"message": "Hi from API"}
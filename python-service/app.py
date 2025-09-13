from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "PassGuardian Python service running 🚀"}

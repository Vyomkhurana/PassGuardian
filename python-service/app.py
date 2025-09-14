from fastapi import FastAPI, Body
import math

app = FastAPI()

@app.post("/analyze-password/")
def analyze_password(password: str = Body(..., embed=True)):
    length = len(password)
    entropy = math.log2(len(set(password)) ** length) if length > 0 else 0

    return {
        "length": length,
        "entropy": entropy,
        "strength": "strong" if length >= 12 and entropy > 50 else "weak"
    }

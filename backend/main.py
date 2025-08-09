from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.football_api import get_typy

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # w produkcji lepiej ustawić tylko domenę frontendu
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/typy")
def read_typy():
    return get_typy()

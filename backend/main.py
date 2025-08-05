from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from typy_analityczne import generuj_typy_na_jutro

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Backend działa!"}

@app.get("/api/typy")
def typy_na_jutro():
    return generuj_typy_na_jutro()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.typy_analityczne import generuj_typy_na_jutro

app = FastAPI()

# Middleware do obsługi CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # W produkcji wpisz konkretny frontend (np. https://typy-app.vercel.app)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/typy")
def get_typy():
    return generuj_typy_na_jutro()

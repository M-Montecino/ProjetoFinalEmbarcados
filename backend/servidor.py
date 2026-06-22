from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import json

app = FastAPI()

ARQUIVO = "cartoes_dados.json"

class CardData(BaseModel):
    uid: str

def carregar_cartoes():
    with open(ARQUIVO, "r") as arquivo:
        return json.load(arquivo)

def salvar_cartoes(lista):
    with open(ARQUIVO, "w") as arquivo:
        json.dump(lista, arquivo, indent=4)

@app.post("/check")
def check_card(card: CardData):
    cartoes = carregar_cartoes()

    return {"authorized": card.uid in cartoes}

@app.post("/register")
def register_card(card: CardData):
    cartoes = carregar_cartoes()

    if card.uid in cartoes:
        return {"status": "already_exists"}

    cartoes.append(card.uid)
    salvar_cartoes(cartoes)

    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5000
    )
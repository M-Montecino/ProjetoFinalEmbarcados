from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import time
import sys
import os
import requests

app = FastAPI(title="Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CARTOES_API = "http://127.0.0.1:5001"
LOGGER_API = "http://127.0.0.1:5002"

class CardData(BaseModel):
    uid: str

class LogData(BaseModel):
    uid: str
    status: str
    name: str | None = None

class CardNameData(BaseModel):
    name: str

# --- ROTAS ORIGINAIS (SEM PREFIXO, PERFEITAMENTE COMPATÍVEL COM O ANTIGO) ---

@app.post("/check")
def check_card(card: CardData):
    res = requests.post(f"{CARTOES_API}/check", json=card.model_dump())
    
    try:
        auth_data = res.json()
        status = "Acesso Concedido" if auth_data.get("authorized") else "Acesso Negado"
        name_res = requests.get(f"{CARTOES_API}/cards/{card.uid}/name")
        name_data = name_res.json() if name_res.ok else {}
        requests.post(
            f"{LOGGER_API}/log",
            json={"uid": card.uid, "status": status, "name": name_data.get("name", "")},
        )
    except Exception as e:
        print("Erro ao orquestrar log de check:", e)
        
    return Response(content=res.content, status_code=res.status_code, media_type="application/json")

@app.post("/register")
def register_card(card: CardData):
    res = requests.post(f"{CARTOES_API}/register", json=card.model_dump())
    
    try:
        reg_data = res.json()
        status_msg = reg_data.get("status")
        status_log = "Cadastrado" if status_msg == "ok" else "Cadastro Falhou (Ja Existe)"
        name_res = requests.get(f"{CARTOES_API}/cards/{card.uid}/name")
        name_data = name_res.json() if name_res.ok else {}
        requests.post(
            f"{LOGGER_API}/log",
            json={"uid": card.uid, "status": status_log, "name": name_data.get("name", "")},
        )
    except Exception as e:
        print("Erro ao orquestrar log de register:", e)
        
    return Response(content=res.content, status_code=res.status_code, media_type="application/json")

@app.get("/cards")
def get_cards():
    res = requests.get(f"{CARTOES_API}/cards")
    return Response(content=res.content, status_code=res.status_code, media_type="application/json")

@app.patch("/cards/{uid}")
def update_card_name(uid: str, payload: CardNameData):
    res = requests.patch(f"{CARTOES_API}/cards/{uid}", json=payload.model_dump())
    return Response(content=res.content, status_code=res.status_code, media_type="application/json")

@app.delete("/cards/{uid}")
def delete_card(uid: str):
    res = requests.delete(f"{CARTOES_API}/cards/{uid}")
    return Response(content=res.content, status_code=res.status_code, media_type="application/json")

@app.post("/log")
def post_log(entry: LogData):
    res = requests.post(f"{LOGGER_API}/log", json=entry.model_dump())
    return Response(content=res.content, status_code=res.status_code, media_type="application/json")

@app.get("/history")
def get_history(limit: int = 100):
    res = requests.get(f"{LOGGER_API}/history?limit={limit}")
    return Response(content=res.content, status_code=res.status_code, media_type="application/json")

if __name__ == "__main__":
    import uvicorn
    print("Iniciando microsserviços via subprocess...")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    p_cartoes = subprocess.Popen([sys.executable, "main.py"], cwd=os.path.join(current_dir, "cartoes"))
    p_logger = subprocess.Popen([sys.executable, "main.py"], cwd=os.path.join(current_dir, "logger"))
    
    time.sleep(2)
    
    try:
        print("Iniciando API Gateway (porta 5000)... As rotas originais voltaram!")
        uvicorn.run(app, host="0.0.0.0", port=5000)
    finally:
        p_cartoes.terminate()
        p_logger.terminate()

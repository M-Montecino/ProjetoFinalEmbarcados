from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

import cartoes
import logger

cadastro_ativo = False

# --- LIFESPAN (Substituto moderno do on_event) ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializa as tabelas nos respectivos módulos
    cartoes.init_db_cartoes()
    logger.init_db_logger()
    yield

# Inicializa o FastAPI passando o lifespan
app = FastAPI(lifespan=lifespan)

# --- MODELOS PYDANTIC ---

class CardData(BaseModel):
    uid: str

class LogData(BaseModel):
    uid: str
    status: str

# --- ROTAS / ENDPOINTS ---

@app.post("/check")
def check_card(card: CardData):
    autorizado = cartoes.verificar_uid(card.uid)
    return {"authorized": autorizado}

@app.post("/register")
def register_card(card: CardData):
    sucesso = cartoes.salvar_uid(card.uid)
    
    if not sucesso:
        return {"status": "already_exists"}

    return {"status": "ok"}


@app.post("/log")
def post_log(entry: LogData):
    logger.salvar_log(entry.uid, entry.status)
    return {"status": "ok"}


@app.get("/history")
def get_history(limit: int = 100):
    rows = logger.listar_history(limit)
    return [{"id": r[0], "uid": r[1], "status": r[2], "timestamp": r[3]} for r in rows]


@app.get("/cards")
def get_cards():
    cards = cartoes.listar_cartoes()
    return {"cards": cards}


@app.delete("/cards/{uid}")
def delete_card(uid: str):
    sucesso = cartoes.deletar_cartao(uid)
    if not sucesso:
        return {"status": "not_found"}
    return {"status": "ok"}


@app.get("/cadastro/status")
def get_cadastro_status():
    global cadastro_ativo
    return {"cadastro_ativo": cadastro_ativo}


@app.post("/cadastro/toggle")
def toggle_cadastro():
    global cadastro_ativo
    cadastro_ativo = not cadastro_ativo
    return {"cadastro_ativo": cadastro_ativo}

# --- EXECUÇÃO ---

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5000
    )

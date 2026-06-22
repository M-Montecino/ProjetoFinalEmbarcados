from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel
import sqlite3
import uvicorn

DB_NAME = "cartoes_dados.db"

# --- CONFIGURAÇÃO E FUNÇÕES DO BANCO DE DADOS ---

def init_db():
    """Inicializa o banco de dados e cria a tabela se não existir."""
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS cartoes (
                uid TEXT PRIMARY KEY
            )
            """
        )
        conn.commit()

def verificar_uid(uid: str) -> bool:
    """Retorna True se o UID existir no banco, False caso contrário."""
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM cartoes WHERE uid = ?", (uid,))
        return cursor.fetchone() is not None

def salvar_uid(uid: str) -> bool:
    """Insere um novo UID. Retorna False se já existir."""
    try:
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO cartoes (uid) VALUES (?)", (uid,))
            conn.commit()
            return True
    except sqlite3.IntegrityError:
        return False

# --- LIFESPAN (Substituto moderno do on_event) ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

# Inicializa o FastAPI passando o lifespan
app = FastAPI(lifespan=lifespan)

# --- MODELOS PYDANTIC ---

class CardData(BaseModel):
    uid: str

# --- ROTAS / ENDPOINTS ---

@app.post("/check")
def check_card(card: CardData):
    autorizado = verificar_uid(card.uid)
    return {"authorized": autorizado}

@app.post("/register")
def register_card(card: CardData):
    sucesso = salvar_uid(card.uid)
    
    if not sucesso:
        return {"status": "already_exists"}

    return {"status": "ok"}

# --- EXECUÇÃO ---

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5000
    )
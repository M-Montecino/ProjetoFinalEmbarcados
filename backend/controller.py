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
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uid TEXT,
                status TEXT,
                timestamp TEXT DEFAULT (datetime('now','localtime'))
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

def salvar_log(uid: str, status: str) -> bool:
    """Salva um registro de histórico."""
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO history (uid, status) VALUES (?, ?)", (uid, status))
        conn.commit()
        return True

def listar_history(limit: int = 100):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, uid, status, timestamp FROM history ORDER BY id DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        return rows

def listar_cartoes():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT uid FROM cartoes")
        rows = [r[0] for r in cursor.fetchall()]
        return rows

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

class LogData(BaseModel):
    uid: str
    status: str

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


@app.post("/log")
def post_log(entry: LogData):
    salvar_log(entry.uid, entry.status)
    return {"status": "ok"}


@app.get("/history")
def get_history(limit: int = 100):
    rows = listar_history(limit)
    return [{"id": r[0], "uid": r[1], "status": r[2], "timestamp": r[3]} for r in rows]


@app.get("/cards")
def get_cards():
    cards = listar_cartoes()
    return {"cards": cards}

# --- EXECUÇÃO ---

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5000
    )
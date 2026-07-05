import sqlite3
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

DB_NAME = os.path.join(os.path.dirname(__file__), "cartoes_dados.db")


def init_db_cartoes():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS cartoes (
                uid TEXT PRIMARY KEY,
                name TEXT DEFAULT ''
            )
            """
        )
        conn.commit()


init_db_cartoes()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CardData(BaseModel):
    uid: str


class CardNameData(BaseModel):
    name: str


@app.post("/check")
def check_card(card: CardData):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM cartoes WHERE uid = ?", (card.uid,))
        autorizado = cursor.fetchone() is not None
    return {"authorized": autorizado}


@app.post("/register")
def register_card(card: CardData):
    try:
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO cartoes (uid, name) VALUES (?, ?)", (card.uid, card.uid))
            conn.commit()
            return {"status": "ok"}
    except sqlite3.IntegrityError:
        return {"status": "already_exists"}


@app.get("/cards")
def get_cards():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT uid, name FROM cartoes")
        rows = [{"uid": r[0], "name": r[1] or r[0]} for r in cursor.fetchall()]
        return {"cards": rows}


@app.get("/cards/{uid}/name")
def get_card_name(uid: str):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM cartoes WHERE uid = ?", (uid,))
        row = cursor.fetchone()
        if row is None:
            return {"uid": uid, "name": ""}
        return {"uid": uid, "name": row[0] or uid}


@app.patch("/cards/{uid}")
def update_card_name(uid: str, payload: CardNameData):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE cartoes SET name = ? WHERE uid = ?", (payload.name or "", uid))
        conn.commit()
        if cursor.rowcount > 0:
            return {"status": "ok"}
        return {"status": "not_found"}


@app.delete("/cards/{uid}")
def delete_card(uid: str):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM cartoes WHERE uid = ?", (uid,))
        conn.commit()
        if cursor.rowcount > 0:
            return {"status": "ok"}
        return {"status": "not_found"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)

import sqlite3
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

import os
DB_NAME = os.path.join(os.path.dirname(__file__), "history_dados.db")


def init_db_logger():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uid TEXT,
                status TEXT,
                name TEXT DEFAULT '',
                timestamp TEXT DEFAULT (datetime('now','localtime'))
            )
            """
        )
        conn.commit()

init_db_logger()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LogData(BaseModel):
    uid: str
    status: str
    name: str | None = None


@app.post("/log")
def post_log(entry: LogData):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO history (uid, status, name) VALUES (?, ?, ?)",
            (entry.uid, entry.status, entry.name or ""),
        )
        conn.commit()
    return {"status": "ok"}


@app.get("/history")
def get_history(limit: int = 100):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, uid, status, name, timestamp FROM history ORDER BY id DESC LIMIT ?",
            (limit,),
        )
        rows = cursor.fetchall()
        return [
            {
                "id": r[0],
                "uid": r[1],
                "status": r[2],
                "name": r[3] or "",
                "timestamp": r[4],
            }
            for r in rows
        ]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5002)

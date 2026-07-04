import sqlite3

DB_NAME = "cartoes_dados.db"

def init_db_logger():
    """Inicializa a tabela de histórico se não existir."""
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
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

def salvar_log(uid: str, status: str) -> bool:
    """Salva um registro de histórico."""
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO history (uid, status) VALUES (?, ?)", (uid, status))
        conn.commit()
        return True

def listar_history(limit: int = 100):
    """Retorna a lista de logs do histórico."""
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, uid, status, timestamp FROM history ORDER BY id DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        return rows

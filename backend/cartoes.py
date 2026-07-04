import sqlite3

DB_NAME = "cartoes_dados.db"

def init_db_cartoes():
    """Inicializa a tabela de cartões se não existir."""
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

def listar_cartoes():
    """Retorna uma lista com todos os UIDs de cartões cadastrados."""
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT uid FROM cartoes")
        rows = [r[0] for r in cursor.fetchall()]
        return rows

def deletar_cartao(uid: str) -> bool:
    """Deleta um UID. Retorna True se foi deletado, False caso contrário."""
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM cartoes WHERE uid = ?", (uid,))
        conn.commit()
        return cursor.rowcount > 0

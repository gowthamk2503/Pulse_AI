import os
import sqlite3
import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

DB_PATH = os.environ.get("PULSEAI_DB_PATH", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "pulseai.db"))

def get_db_connection() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)
    
    # Auth tokens table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS auth_tokens (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)
    
    # Analyses table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        source_type TEXT NOT NULL DEFAULT 'single',
        text_content TEXT NOT NULL,
        predicted_label TEXT NOT NULL,
        confidence_score REAL NOT NULL,
        all_scores TEXT NOT NULL,
        model_name TEXT NOT NULL,
        batch_id TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    """)
    
    # Batch jobs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS batch_jobs (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        filename TEXT NOT NULL,
        total_rows INTEGER NOT NULL,
        processed_rows INTEGER NOT NULL,
        dominant_emotion TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    """)
    
    conn.commit()
    conn.close()

# Analysis DAO functions
def insert_analysis(
    text_content: str,
    predicted_label: str,
    confidence_score: float,
    all_scores: List[Dict[str, Any]],
    model_name: str,
    user_id: Optional[int] = None,
    source_type: str = "single",
    batch_id: Optional[str] = None
) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
        INSERT INTO analyses (user_id, source_type, text_content, predicted_label, confidence_score, all_scores, model_name, batch_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        source_type,
        text_content,
        predicted_label,
        confidence_score,
        json.dumps(all_scores),
        model_name,
        batch_id,
        now
    ))
    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return record_id

def insert_batch_analyses(records: List[Dict[str, Any]], batch_job: Dict[str, Any]) -> None:
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    
    cursor.execute("""
        INSERT INTO batch_jobs (id, user_id, filename, total_rows, processed_rows, dominant_emotion, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        batch_job["id"],
        batch_job.get("user_id"),
        batch_job["filename"],
        batch_job["total_rows"],
        batch_job["processed_rows"],
        batch_job.get("dominant_emotion"),
        now
    ))
    
    for rec in records:
        cursor.execute("""
            INSERT INTO analyses (user_id, source_type, text_content, predicted_label, confidence_score, all_scores, model_name, batch_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            rec.get("user_id"),
            "batch",
            rec["text"],
            rec["predicted_label"],
            rec["confidence_score"],
            json.dumps(rec["all_scores"]),
            rec["model_name"],
            batch_job["id"],
            now
        ))
    
    conn.commit()
    conn.close()

def get_analyses(
    user_id: Optional[int] = None,
    search: Optional[str] = None,
    emotion: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM analyses WHERE 1=1"
    params = []
    
    if user_id is not None:
        query += " AND (user_id = ? OR user_id IS NULL)"
        params.append(user_id)
        
    if search:
        query += " AND text_content LIKE ?"
        params.append(f"%{search}%")
        
    if emotion and emotion.lower() != "all":
        query += " AND LOWER(predicted_label) = LOWER(?)"
        params.append(emotion)
        
    query += " ORDER BY id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for r in rows:
        result.append({
            "id": r["id"],
            "user_id": r["user_id"],
            "source_type": r["source_type"],
            "text": r["text_content"],
            "predicted_label": r["predicted_label"],
            "confidence_score": r["confidence_score"],
            "all_scores": json.loads(r["all_scores"]) if r["all_scores"] else [],
            "model_name": r["model_name"],
            "batch_id": r["batch_id"],
            "created_at": r["created_at"]
        })
    return result

def get_analysis_by_id(analysis_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analyses WHERE id = ?", (analysis_id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        return None
    return {
        "id": r["id"],
        "user_id": r["user_id"],
        "source_type": r["source_type"],
        "text": r["text_content"],
        "predicted_label": r["predicted_label"],
        "confidence_score": r["confidence_score"],
        "all_scores": json.loads(r["all_scores"]) if r["all_scores"] else [],
        "model_name": r["model_name"],
        "batch_id": r["batch_id"],
        "created_at": r["created_at"]
    }

def delete_analysis(analysis_id: int, user_id: Optional[int] = None) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    if user_id is not None:
        cursor.execute("DELETE FROM analyses WHERE id = ? AND (user_id = ? OR user_id IS NULL)", (analysis_id, user_id))
    else:
        cursor.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
    affected = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return affected

def clear_all_history(user_id: Optional[int] = None) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    if user_id is not None:
        cursor.execute("DELETE FROM analyses WHERE user_id = ? OR user_id IS NULL", (user_id,))
    else:
        cursor.execute("DELETE FROM analyses")
    count = cursor.rowcount
    conn.commit()
    conn.close()
    return count

def get_analyses_count(user_id: Optional[int] = None, emotion: Optional[str] = None, search: Optional[str] = None) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT COUNT(*) as cnt FROM analyses WHERE 1=1"
    params = []
    if user_id is not None:
        query += " AND (user_id = ? OR user_id IS NULL)"
        params.append(user_id)
    if search:
        query += " AND text_content LIKE ?"
        params.append(f"%{search}%")
    if emotion and emotion.lower() != "all":
        query += " AND LOWER(predicted_label) = LOWER(?)"
        params.append(emotion)
    cursor.execute(query, params)
    cnt = cursor.fetchone()["cnt"]
    conn.close()
    return cnt

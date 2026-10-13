import os
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
from app.database.db import get_db_connection

TOKEN_EXPIRE_DAYS = 30

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}:{key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt, key_hex = hashed_password.split(":")
        check_key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100000)
        return secrets.compare_digest(check_key.hex(), key_hex)
    except Exception:
        return False

def create_user(email: str, full_name: str, password: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", (email,))
    if cursor.fetchone():
        conn.close()
        return None  # already exists
    
    pwd_hash = hash_password(password)
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
        INSERT INTO users (email, full_name, password_hash, created_at)
        VALUES (?, ?, ?, ?)
    """, (email.lower().strip(), full_name.strip(), pwd_hash, now))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {
        "id": user_id,
        "email": email.lower().strip(),
        "full_name": full_name.strip(),
        "created_at": now
    }

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
    if not verify_password(password, row["password_hash"]):
        return None
        
    return {
        "id": row["id"],
        "email": row["email"],
        "full_name": row["full_name"],
        "created_at": row["created_at"]
    }

def create_access_token(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    expires_at = (now + timedelta(days=TOKEN_EXPIRE_DAYS)).isoformat()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO auth_tokens (token, user_id, created_at, expires_at)
        VALUES (?, ?, ?, ?)
    """, (token, user_id, now.isoformat(), expires_at))
    conn.commit()
    conn.close()
    return token

def get_user_by_token(token: str) -> Optional[Dict[str, Any]]:
    if not token:
        return None
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.id, u.email, u.full_name, u.created_at, t.expires_at
        FROM auth_tokens t
        JOIN users u ON t.user_id = u.id
        WHERE t.token = ?
    """, (token,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    # Check expiry
    expires_at = datetime.fromisoformat(row["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        return None
        
    return {
        "id": row["id"],
        "email": row["email"],
        "full_name": row["full_name"],
        "created_at": row["created_at"]
    }

def update_user_profile(user_id: int, full_name: Optional[str] = None, password: Optional[str] = None) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    updates = []
    params = []
    if full_name:
        updates.append("full_name = ?")
        params.append(full_name.strip())
    if password:
        updates.append("password_hash = ?")
        params.append(hash_password(password))
        
    if not updates:
        conn.close()
        return None
        
    params.append(user_id)
    cursor.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", params)
    conn.commit()
    
    cursor.execute("SELECT id, email, full_name, created_at FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)

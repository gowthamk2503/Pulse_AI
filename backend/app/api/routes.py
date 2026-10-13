import io
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Header, UploadFile, File, Form, Query, Response
from fastapi.responses import StreamingResponse
import pandas as pd

from app.schemas.emotion import TextAnalysisRequest, TextAnalysisResponse, ModelInfoResponse, EmotionScore
from app.schemas.batch import BatchAnalysisResponse, CSVPreviewResponse, BatchRowResult
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, UserProfileUpdate, AuthTokenResponse, UserResponse
from app.services.emotion_service import EmotionService
from app.services.csv_service import CSVService
from app.services.analytics_service import AnalyticsService
from app.services.auth_service import (
    create_user, authenticate_user, create_access_token,
    get_user_by_token, update_user_profile
)
from app.database.db import (
    insert_analysis, insert_batch_analyses, get_analyses,
    get_analysis_by_id, delete_analysis, clear_all_history,
    get_analyses_count
)

router = APIRouter(prefix="/api")

def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1]
        return get_user_by_token(token)
    return None

def get_current_user_required(authorization: Optional[str] = Header(None)) -> dict:
    user = get_current_user_optional(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required. Please sign in.")
    return user

# --- HEALTH & MODEL ---
@router.get("/health")
def health_check():
    emotion_svc = EmotionService.get_instance()
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "model_status": emotion_svc.status,
        "model_name": emotion_svc.model_name,
        "device": emotion_svc.device
    }

@router.get("/model/info", response_model=ModelInfoResponse)
def get_model_info():
    emotion_svc = EmotionService.get_instance()
    return emotion_svc.get_info()

# --- AUTHENTICATION ---
@router.post("/auth/register", response_model=AuthTokenResponse)
def register(req: UserRegisterRequest):
    user = create_user(email=req.email, full_name=req.full_name, password=req.password)
    if not user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    token = create_access_token(user["id"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/auth/login", response_model=AuthTokenResponse)
def login(req: UserLoginRequest):
    user = authenticate_user(email=req.email, password=req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_access_token(user["id"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/auth/me", response_model=UserResponse)
def get_me(user: dict = Depends(get_current_user_required)):
    return user

@router.put("/auth/profile", response_model=UserResponse)
def update_profile(req: UserProfileUpdate, user: dict = Depends(get_current_user_required)):
    updated = update_user_profile(user_id=user["id"], full_name=req.full_name, password=req.password)
    if not updated:
        raise HTTPException(status_code=400, detail="No profile updates provided or update failed.")
    return updated

# --- SINGLE TEXT ANALYSIS ---
@router.post("/analyze", response_model=TextAnalysisResponse)
def analyze_text(
    req: TextAnalysisRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    cleaned = req.text.strip()
    if not cleaned:
        raise HTTPException(status_code=422, detail="Text cannot be empty.")
        
    emotion_svc = EmotionService.get_instance()
    result = emotion_svc.analyze_text(cleaned)
    
    user_id = current_user["id"] if current_user else None
    saved_id = None
    
    if req.save_to_history:
        saved_id = insert_analysis(
            text_content=cleaned,
            predicted_label=result["dominant_emotion"],
            confidence_score=result["confidence"],
            all_scores=result["predictions"],
            model_name=result["model"],
            user_id=user_id,
            source_type="single"
        )
        
    return {
        "id": saved_id,
        "text": cleaned,
        "dominant_emotion": result["dominant_emotion"],
        "confidence": result["confidence"],
        "predictions": [EmotionScore(**p) for p in result["predictions"]],
        "model": result["model"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "disclaimer": "This classification represents emotional expressions detected in text by a machine learning model, not a definitive psychological state."
    }

# --- BATCH CSV ANALYSIS ---
@router.post("/analyze/preview-csv", response_model=CSVPreviewResponse)
async def preview_csv(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a CSV (.csv).")
        
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded CSV file is empty.")
    if len(contents) > 20 * 1024 * 1024:  # 20MB limit
        raise HTTPException(status_code=400, detail="CSV file size exceeds maximum limit of 20MB.")
        
    try:
        preview = CSVService.inspect_csv(contents, file.filename)
        return preview
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/analyze/batch", response_model=BatchAnalysisResponse)
async def process_batch_csv(
    file: UploadFile = File(...),
    text_column: str = Form(...),
    save_to_history: bool = Form(True),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a CSV (.csv).")
        
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded CSV file is empty.")
        
    emotion_svc = EmotionService.get_instance()
    
    try:
        summary, enriched_df = CSVService.process_csv(
            file_bytes=contents,
            text_column=text_column,
            emotion_service=emotion_svc,
            max_rows=1000
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    batch_id = str(uuid.uuid4())
    now_str = datetime.now(timezone.utc).isoformat()
    user_id = current_user["id"] if current_user else None
    
    if save_to_history:
        # Prepare records for insertion
        db_records = []
        for r in summary["results"]:
            db_records.append({
                "user_id": user_id,
                "text": r["text"],
                "predicted_label": r["predicted_emotion"],
                "confidence_score": r["confidence"],
                "all_scores": r["scores"],
                "model_name": summary["model_name"]
            })
            
        insert_batch_analyses(
            records=db_records,
            batch_job={
                "id": batch_id,
                "user_id": user_id,
                "filename": file.filename,
                "total_rows": summary["total_rows"],
                "processed_rows": summary["processed_rows"],
                "dominant_emotion": summary["dominant_emotion"]
            }
        )
        
    return {
        "batch_id": batch_id,
        "filename": file.filename,
        "text_column": text_column,
        "total_rows": summary["total_rows"],
        "processed_rows": summary["processed_rows"],
        "failed_rows": summary["failed_rows"],
        "dominant_emotion": summary["dominant_emotion"],
        "emotion_distribution": summary["emotion_distribution"],
        "average_confidence": summary["average_confidence"],
        "results": [BatchRowResult(**r) for r in summary["results"]],
        "model_name": summary["model_name"],
        "created_at": now_str
    }

# --- ANALYTICS ---
@router.get("/analytics/summary")
def get_analytics_summary(current_user: Optional[dict] = Depends(get_current_user_optional)):
    user_id = current_user["id"] if current_user else None
    return AnalyticsService.get_summary_metrics(user_id=user_id)

# --- HISTORY ---
@router.get("/history")
def get_history(
    search: Optional[str] = Query(None),
    emotion: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    user_id = current_user["id"] if current_user else None
    records = get_analyses(
        user_id=user_id,
        search=search,
        emotion=emotion,
        limit=limit,
        offset=offset
    )
    total_count = get_analyses_count(user_id=user_id, emotion=emotion, search=search)
    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "items": records
    }

@router.delete("/history/{analysis_id}")
def delete_history_item(
    analysis_id: int,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    user_id = current_user["id"] if current_user else None
    success = delete_analysis(analysis_id, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Analysis record not found or already deleted.")
    return {"status": "deleted", "id": analysis_id}

@router.delete("/history")
def clear_history(current_user: Optional[dict] = Depends(get_current_user_optional)):
    user_id = current_user["id"] if current_user else None
    count = clear_all_history(user_id=user_id)
    return {"status": "cleared", "records_removed": count}

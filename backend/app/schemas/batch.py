from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.schemas.emotion import EmotionScore

class BatchRowResult(BaseModel):
    row_index: int
    text: str
    predicted_emotion: str
    confidence: float
    scores: List[EmotionScore]
    metadata: Optional[Dict[str, Any]] = None

class BatchAnalysisResponse(BaseModel):
    batch_id: str
    filename: str
    text_column: str
    total_rows: int
    processed_rows: int
    failed_rows: int
    dominant_emotion: str
    emotion_distribution: Dict[str, int]
    average_confidence: float
    results: List[BatchRowResult]
    model_name: str
    created_at: str

class CSVPreviewResponse(BaseModel):
    filename: str
    columns: List[str]
    suggested_text_columns: List[str]
    sample_rows: List[Dict[str, Any]]
    total_rows: int

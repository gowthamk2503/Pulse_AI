from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class EmotionScore(BaseModel):
    label: str
    score: float

class TextAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="The text to analyze for emotional expressions")
    save_to_history: bool = Field(default=True, description="Whether to persist this analysis in user history")

class TextAnalysisResponse(BaseModel):
    id: Optional[int] = None
    text: str
    dominant_emotion: str
    confidence: float
    predictions: List[EmotionScore]
    model: str
    model_type: str = "Transformer Emotion Classifier"
    created_at: Optional[str] = None
    disclaimer: str = "This classification represents emotional expressions detected in text by a machine learning model, not a definitive psychological state."

class BatchTextItem(BaseModel):
    text: str
    row_index: int
    predicted_label: str
    confidence_score: float
    all_scores: List[EmotionScore]

class ModelInfoResponse(BaseModel):
    model_identifier: str
    architecture: str
    labels: List[str]
    device: str
    status: str
    license: str
    max_tokens: int
    description: str

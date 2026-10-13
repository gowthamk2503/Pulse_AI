import io
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class CSVService:
    @staticmethod
    def inspect_csv(file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Preview uploaded CSV, list column names and identify likely text columns.
        """
        encodings = ["utf-8", "utf-8-sig", "latin1", "cp1252"]
        df = None
        used_encoding = None
        
        for enc in encodings:
            try:
                df = pd.read_csv(io.BytesIO(file_bytes), encoding=enc, nrows=50)
                used_encoding = enc
                break
            except Exception:
                continue
                
        if df is None:
            raise ValueError(f"Unable to parse CSV file '{filename}'. Ensure it is a valid comma-separated text file.")
            
        columns = [str(c) for c in df.columns]
        
        # Heuristic to detect candidate text columns
        text_keywords = ["text", "review", "comment", "feedback", "content", "message", "body", "tweet", "post", "sentence", "description"]
        suggested = []
        for col in columns:
            lower = col.lower()
            if any(k in lower for k in text_keywords):
                suggested.append(col)
                
        # If no keywords matched, pick object/string columns with longer average text
        if not suggested:
            for col in columns:
                if df[col].dtype == object:
                    sample_lens = df[col].dropna().astype(str).str.len()
                    if not sample_lens.empty and sample_lens.mean() > 10:
                        suggested.append(col)
                        
        if not suggested and columns:
            suggested = [columns[0]]
            
        sample_rows = df.head(5).fillna("").to_dict(orient="records")
        
        # Count total rows roughly
        try:
            full_df = pd.read_csv(io.BytesIO(file_bytes), encoding=used_encoding)
            total_rows = len(full_df)
        except Exception:
            total_rows = len(df)
            
        return {
            "filename": filename,
            "columns": columns,
            "suggested_text_columns": suggested,
            "sample_rows": sample_rows,
            "total_rows": total_rows
        }

    @staticmethod
    def process_csv(
        file_bytes: bytes,
        text_column: str,
        emotion_service,
        max_rows: int = 1000
    ) -> Tuple[Dict[str, Any], pd.DataFrame]:
        """
        Load CSV, extract text from text_column, run batch emotion analysis,
        and generate enriched results and downloadable dataset.
        """
        encodings = ["utf-8", "utf-8-sig", "latin1", "cp1252"]
        df = None
        
        for enc in encodings:
            try:
                df = pd.read_csv(io.BytesIO(file_bytes), encoding=enc)
                break
            except Exception:
                continue
                
        if df is None:
            raise ValueError("Could not decode CSV file. Please upload a standard UTF-8 CSV.")
            
        if text_column not in df.columns:
            raise ValueError(f"Selected column '{text_column}' not found in CSV. Available columns: {list(df.columns)}")
            
        if len(df) == 0:
            raise ValueError("The uploaded CSV file contains no data rows.")
            
        # Limit rows for interactive latency if needed
        original_count = len(df)
        if len(df) > max_rows:
            df = df.head(max_rows).copy()
            
        # Clean text
        raw_texts = df[text_column].fillna("").astype(str).tolist()
        
        # Batch analysis
        batch_results = emotion_service.analyze_batch(raw_texts, batch_size=32)
        
        # Enrich DataFrame
        predicted_emotions = []
        confidences = []
        emotion_distribution: Dict[str, int] = {}
        row_results: List[Dict[str, Any]] = []
        valid_confidences = []
        
        for idx, res in enumerate(batch_results):
            pred_label = res["dominant_emotion"]
            conf = res["confidence"]
            
            predicted_emotions.append(pred_label)
            confidences.append(round(conf, 4))
            valid_confidences.append(conf)
            
            emotion_distribution[pred_label] = emotion_distribution.get(pred_label, 0) + 1
            
            row_dict = {
                "row_index": idx + 1,
                "text": raw_texts[idx],
                "predicted_emotion": pred_label,
                "confidence": round(conf, 4),
                "scores": res["predictions"],
                "metadata": {k: str(v) for k, v in df.iloc[idx].to_dict().items() if k != text_column}
            }
            row_results.append(row_dict)
            
        df["predicted_emotion"] = predicted_emotions
        df["emotion_confidence"] = confidences
        
        # Dominant overall emotion
        dominant_overall = "neutral"
        if emotion_distribution:
            dominant_overall = max(emotion_distribution, key=emotion_distribution.get)
            
        avg_confidence = round(sum(valid_confidences) / len(valid_confidences), 4) if valid_confidences else 0.0
        
        summary = {
            "total_rows": original_count,
            "processed_rows": len(df),
            "failed_rows": original_count - len(df) if original_count > max_rows else 0,
            "text_column": text_column,
            "dominant_emotion": dominant_overall,
            "emotion_distribution": emotion_distribution,
            "average_confidence": avg_confidence,
            "results": row_results,
            "model_name": emotion_service.model_name
        }
        
        return summary, df

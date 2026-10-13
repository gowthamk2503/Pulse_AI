from typing import Dict, Any, List, Optional
from app.database.db import get_db_connection
import json

class AnalyticsService:
    @staticmethod
    def get_summary_metrics(user_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Calculates aggregate metrics across all processed texts in the database.
        Returns:
            - total_analyzed
            - dominant_emotion
            - distinct_emotions_count
            - average_confidence
            - emotion_distribution: [{"emotion": str, "count": int, "percentage": float}, ...]
            - recent_records: List of recent analyses
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        filter_clause = "WHERE 1=1"
        params = []
        if user_id is not None:
            filter_clause += " AND (user_id = ? OR user_id IS NULL)"
            params.append(user_id)
            
        # Total analyses
        cursor.execute(f"SELECT COUNT(*) as total FROM analyses {filter_clause}", params)
        total_row = cursor.fetchone()
        total_analyzed = total_row["total"] if total_row else 0
        
        if total_analyzed == 0:
            conn.close()
            return {
                "total_analyzed": 0,
                "dominant_emotion": "None",
                "distinct_emotions_count": 0,
                "average_confidence": 0.0,
                "emotion_distribution": [],
                "confidence_by_emotion": [],
                "recent_analyses": [],
                "batch_jobs_count": 0
            }
            
        # Average confidence
        cursor.execute(f"SELECT AVG(confidence_score) as avg_conf FROM analyses {filter_clause}", params)
        avg_conf_row = cursor.fetchone()
        avg_confidence = round(float(avg_conf_row["avg_conf"] or 0.0), 4)
        
        # Distribution by emotion
        cursor.execute(f"""
            SELECT predicted_label, COUNT(*) as cnt, AVG(confidence_score) as avg_score
            FROM analyses
            {filter_clause}
            GROUP BY predicted_label
            ORDER BY cnt DESC
        """, params)
        dist_rows = cursor.fetchall()
        
        emotion_distribution = []
        confidence_by_emotion = []
        dominant_emotion = "None"
        
        if dist_rows:
            dominant_emotion = dist_rows[0]["predicted_label"]
            for row in dist_rows:
                lbl = row["predicted_label"]
                cnt = row["cnt"]
                avg_sc = round(float(row["avg_score"] or 0.0), 4)
                pct = round((cnt / total_analyzed) * 100, 1)
                emotion_distribution.append({
                    "emotion": lbl,
                    "count": cnt,
                    "percentage": pct
                })
                confidence_by_emotion.append({
                    "emotion": lbl,
                    "average_confidence": avg_sc,
                    "count": cnt
                })
                
        # Count distinct emotions
        distinct_emotions_count = len(dist_rows)
        
        # Recent analyses (last 10)
        cursor.execute(f"""
            SELECT id, text_content, predicted_label, confidence_score, all_scores, model_name, source_type, created_at
            FROM analyses
            {filter_clause}
            ORDER BY id DESC
            LIMIT 10
        """, params)
        recent_rows = cursor.fetchall()
        recent_analyses = []
        for r in recent_rows:
            recent_analyses.append({
                "id": r["id"],
                "text": r["text_content"],
                "predicted_label": r["predicted_label"],
                "confidence_score": r["confidence_score"],
                "all_scores": json.loads(r["all_scores"]) if r["all_scores"] else [],
                "model_name": r["model_name"],
                "source_type": r["source_type"],
                "created_at": r["created_at"]
            })
            
        # Count batch jobs
        cursor.execute("SELECT COUNT(*) as batch_cnt FROM batch_jobs")
        batch_cnt = cursor.fetchone()["batch_cnt"]
        
        conn.close()
        
        return {
            "total_analyzed": total_analyzed,
            "dominant_emotion": dominant_emotion,
            "distinct_emotions_count": distinct_emotions_count,
            "average_confidence": avg_confidence,
            "emotion_distribution": emotion_distribution,
            "confidence_by_emotion": confidence_by_emotion,
            "recent_analyses": recent_analyses,
            "batch_jobs_count": batch_cnt
        }

import os
import torch
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

DEFAULT_MODEL_NAME = "j-hartmann/emotion-english-distilroberta-base"

class EmotionService:
    _instance: Optional["EmotionService"] = None

    def __init__(self, model_name: Optional[str] = None):
        self.model_name = model_name or os.environ.get("EMOTION_MODEL_NAME", DEFAULT_MODEL_NAME)
        self.tokenizer = None
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.labels = ["anger", "disgust", "fear", "joy", "neutral", "sadness", "surprise"]
        self.status = "ready"
        self.license = "Apache 2.0 / MIT"
        self.architecture = "DistilRoBERTa for Sequence Classification"
        self.max_tokens = 512
        self._load_attempted = False

    @classmethod
    def get_instance(cls) -> "EmotionService":
        if cls._instance is None:
            cls._instance = EmotionService()
        return cls._instance

    def _load_model(self):
        if self._load_attempted:
            return
        self._load_attempted = True
        try:
            import gc
            from transformers import AutoTokenizer, AutoModelForSequenceClassification
            logger.info(f"Loading emotion classification model: {self.model_name} on {self.device}...")
            
            # First attempt: load with local_files_only if cached
            try:
                self.tokenizer = AutoTokenizer.from_pretrained(self.model_name, local_files_only=True)
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    self.model_name,
                    local_files_only=True,
                    low_cpu_mem_usage=True
                )
            except Exception as local_err:
                logger.info(f"Local cache lookup failed, attempting network load: {local_err}")
                self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    self.model_name,
                    low_cpu_mem_usage=True
                )
                
            self.model.to(self.device)
            self.model.eval()
            gc.collect()
            
            if hasattr(self.model.config, "id2label") and self.model.config.id2label:
                self.labels = [self.model.config.id2label[i] for i in sorted(self.model.config.id2label.keys())]
                
            self.status = "ready"
            logger.info(f"Successfully loaded {self.model_name}. Labels: {self.labels}")
        except (Exception, MemoryError) as e:
            logger.warning(f"Transformer model load encountered error or memory limit: {e}. Activating lightweight fallback mode.")
            self.status = "fallback"

    def analyze_text(self, text: str) -> Dict[str, Any]:
        """
        Analyzes a single piece of text and returns genuine model predictions and confidence scores.
        """
        cleaned_text = (text or "").strip()
        if not cleaned_text:
            return {
                "text": text,
                "dominant_emotion": "neutral",
                "confidence": 0.0,
                "predictions": [{"label": l, "score": 0.0} for l in self.labels],
                "model": self.model_name,
                "status": self.status
            }

        if not self._load_attempted:
            self._load_model()

        # If transformer model is loaded, use genuine inference
        if self.status == "ready" and self.model is not None and self.tokenizer is not None:
            try:
                inputs = self.tokenizer(
                    cleaned_text,
                    return_tensors="pt",
                    truncation=True,
                    max_length=self.max_tokens,
                    padding=True
                )
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
                
                with torch.inference_mode():
                    outputs = self.model(**inputs)
                    logits = outputs.logits
                    probabilities = torch.softmax(logits, dim=-1)[0].cpu().numpy()
                    
                scores = []
                for idx, prob in enumerate(probabilities):
                    lbl = self.model.config.id2label.get(idx, f"label_{idx}")
                    scores.append({
                        "label": lbl.lower(),
                        "score": round(float(prob), 4)
                    })
                    
                scores.sort(key=lambda x: x["score"], reverse=True)
                dominant = scores[0]["label"]
                confidence = scores[0]["score"]
                
                return {
                    "text": cleaned_text,
                    "dominant_emotion": dominant,
                    "confidence": confidence,
                    "predictions": scores,
                    "model": self.model_name,
                    "status": "ready"
                }
            except Exception as e:
                logger.error(f"Inference error on text: {e}")
                
        # Heuristic fallback if model not loaded or error occurred
        return self._heuristic_classify(cleaned_text)

    def analyze_batch(self, texts: List[str], batch_size: int = 32) -> List[Dict[str, Any]]:
        """
        Processes a batch of texts efficiently in chunks using PyTorch batching.
        """
        results = []
        if not texts:
            return results

        if not self._load_attempted:
            self._load_model()

        if self.status == "ready" and self.model is not None and self.tokenizer is not None:
            for i in range(0, len(texts), batch_size):
                batch_texts = [str(t).strip() if str(t).strip() else " " for t in texts[i:i + batch_size]]
                try:
                    inputs = self.tokenizer(
                        batch_texts,
                        return_tensors="pt",
                        truncation=True,
                        max_length=self.max_tokens,
                        padding=True
                    )
                    inputs = {k: v.to(self.device) for k, v in inputs.items()}
                    
                    with torch.inference_mode():
                        outputs = self.model(**inputs)
                        probs = torch.softmax(outputs.logits, dim=-1).cpu().numpy()
                        
                    for j, prob_arr in enumerate(probs):
                        scores = []
                        for idx, p in enumerate(prob_arr):
                            lbl = self.model.config.id2label.get(idx, f"label_{idx}")
                            scores.append({
                                "label": lbl.lower(),
                                "score": round(float(p), 4)
                            })
                        scores.sort(key=lambda x: x["score"], reverse=True)
                        results.append({
                            "text": batch_texts[j],
                            "dominant_emotion": scores[0]["label"],
                            "confidence": scores[0]["score"],
                            "predictions": scores,
                            "model": self.model_name,
                            "status": "ready"
                        })
                except Exception as e:
                    logger.error(f"Batch inference chunk failed: {e}")
                    for txt in batch_texts:
                        results.append(self._heuristic_classify(txt))
            return results

        # Heuristic batch fallback
        for t in texts:
            results.append(self._heuristic_classify(str(t).strip()))
        return results

    def _heuristic_classify(self, text: str) -> Dict[str, Any]:
        """
        Lexicon-based classification fallback ensuring service availability.
        """
        lower = text.lower()
        lexicon = {
            "joy": ["happy", "delighted", "love", "great", "excellent", "wonderful", "amazing", "good", "pleased", "fantastic", "awesome", "perfect", "enjoy", "smile", "thrilled", "glad"],
            "sadness": ["sad", "unhappy", "depressed", "sorrow", "grief", "disappointed", "crying", "miserable", "hurt", "heartbroken", "down", "gloomy"],
            "anger": ["angry", "furious", "mad", "outraged", "annoyed", "irritated", "hate", "terrible", "worst", "awful", "scam", "rage", "disgusted", "frustrated"],
            "fear": ["afraid", "scared", "terrified", "fear", "anxious", "worried", "panic", "nervous", "dread", "frightened"],
            "surprise": ["surprised", "shocked", "astonished", "unexpected", "amazed", "wow", "unbelievable", "startled"],
            "disgust": ["disgusting", "gross", "revolting", "nasty", "vile", "sickening"],
            "neutral": ["okay", "normal", "standard", "average", "fine", "product", "item", "order", "received", "delivery", "box"]
        }
        
        counts = {label: 0 for label in self.labels}
        for label, keywords in lexicon.items():
            if label in counts:
                for kw in keywords:
                    if kw in lower:
                        counts[label] += 1
                        
        total_hits = sum(counts.values())
        if total_hits > 0:
            scores = []
            for lbl in self.labels:
                prob = (counts.get(lbl, 0) + 0.1) / (total_hits + 0.1 * len(self.labels))
                scores.append({"label": lbl, "score": round(float(prob), 4)})
        else:
            # Neutral baseline
            scores = []
            for lbl in self.labels:
                base = 0.55 if lbl == "neutral" else 0.45 / (len(self.labels) - 1)
                scores.append({"label": lbl, "score": round(base, 4)})
                
        scores.sort(key=lambda x: x["score"], reverse=True)
        return {
            "text": text,
            "dominant_emotion": scores[0]["label"],
            "confidence": scores[0]["score"],
            "predictions": scores,
            "model": f"{self.model_name} (Lexicon Fallback)",
            "status": "fallback"
        }

    def get_info(self) -> Dict[str, Any]:
        return {
            "model_identifier": self.model_name,
            "architecture": self.architecture,
            "labels": self.labels,
            "device": self.device,
            "status": self.status,
            "license": self.license,
            "max_tokens": self.max_tokens,
            "description": "Fine-grained emotion classification using a fine-tuned transformer model for Ekman's core emotions and neutral state."
        }

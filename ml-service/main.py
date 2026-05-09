"""
Smart Campus Helpdesk UNSAP - ML Service
FastAPI server untuk klasifikasi prioritas dan FAQ similarity
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
import joblib
import os
import sys
import logging
from datetime import datetime
from contextlib import asynccontextmanager

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add utils to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.preprocessing import TextPreprocessor
from utils.model_loader import ModelLoader

# ============================================
# GLOBAL VARIABLES
# ============================================
model_loader = ModelLoader()
preprocessor = TextPreprocessor()

# Model components
classifier = None
vectorizer = None
label_encoder = None

# FAQ Data (loaded on startup)
faq_df = None
faq_vectors = None

# Model info
model_info = {
    "status": "not_loaded",
    "loaded_at": None,
    "classifier_type": None,
    "feature_count": 0,
    "labels": [],
}


# ============================================
# PYDANTIC MODELS
# ============================================

class ClassifyRequest(BaseModel):
    """Request untuk klasifikasi prioritas"""
    text: str = Field(..., min_length=10, max_length=5000, description="Teks keluhan/laporan")
    category: Optional[str] = Field(None, description="Kategori tiket")


class ClassifyResponse(BaseModel):
    """Response hasil klasifikasi"""
    priority: str
    confidence_score: float
    probabilities: Dict[str, float]
    model_version: str
    processed_at: str
    processing_time_ms: float

    model_config = {
        "protected_namespaces": ()
    }


class SimilarityRequest(BaseModel):
    """Request untuk FAQ similarity"""
    query: str = Field(..., min_length=5, max_length=500, description="Query pencarian FAQ")


class FAQMatch(BaseModel):
    """FAQ match result"""
    id: int
    title: str
    content: str
    category: str
    similarity_score: float


class SimilarityResponse(BaseModel):
    """Response FAQ similarity"""
    matches: List[FAQMatch]
    query: str
    threshold_used: float


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    models_loaded: bool
    faq_count: int
    uptime_seconds: float
    timestamp: str


class TrainRequest(BaseModel):
    """Request untuk training ulang"""
    dataset_url: Optional[str] = None
    force_retrain: bool = False


# ============================================
# LIFESPAN EVENTS
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load models on startup
    """
    global classifier, vectorizer, label_encoder, faq_df, faq_vectors, model_info
    
    logger.info("🚀 Starting ML Service for Smart Campus Helpdesk UNSAP...")
    
    try:
        # Load ML models
        if model_loader.models_exist():
            classifier, vectorizer, label_encoder = model_loader.load_models()
            
            model_info["status"] = "loaded"
            model_info["loaded_at"] = datetime.now().isoformat()
            model_info["classifier_type"] = type(classifier).__name__
            model_info["feature_count"] = vectorizer.get_feature_names_out().shape[0]
            model_info["labels"] = list(label_encoder.classes_) if label_encoder else []
            
            logger.info(f"✅ Models loaded successfully")
            logger.info(f"   - Classifier: {model_info['classifier_type']}")
            logger.info(f"   - Features: {model_info['feature_count']}")
            logger.info(f"   - Labels: {model_info['labels']}")
        else:
            logger.warning("⚠️ Models not found. Service will use fallback mode.")
            model_info["status"] = "fallback_mode"
        
        # Load FAQ data
        faq_path = 'datasets/dataset.csv'
        if os.path.exists(faq_path):
            faq_df = pd.read_csv(faq_path)
            faq_df['processed'] = faq_df['text'].apply(preprocessor.preprocess)
            
            # Create TF-IDF vectors for FAQ
            if vectorizer is not None:
                faq_vectors = vectorizer.transform(faq_df['processed'])
                logger.info(f"✅ FAQ data loaded: {len(faq_df)} items")
            else:
                logger.warning("⚠️ Cannot create FAQ vectors: vectorizer not loaded")
                faq_vectors = None
        else:
            logger.warning(f"⚠️ FAQ dataset not found at {faq_path}")
            
    except Exception as e:
        logger.error(f"❌ Error during startup: {str(e)}")
        model_info["status"] = "error"
    
    logger.info("🎯 ML Service ready!")
    
    yield
    
    logger.info("🛑 Shutting down ML Service...")

# ============================================
# FASTAPI APP
# ============================================

app = FastAPI(
    title="Smart Campus Helpdesk UNSAP - ML Service",
    description="Machine Learning service untuk klasifikasi prioritas tiket dan FAQ similarity",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# API ENDPOINTS
# ============================================

@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint - Health check"""
    return {
        "status": model_info["status"],
        "version": "1.0.0",
        "models_loaded": classifier is not None,
        "faq_count": len(faq_df) if faq_df is not None else 0,
        "uptime_seconds": 0,  # Will be calculated
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return await root()


@app.post("/api/classify", response_model=ClassifyResponse)
async def classify_priority(request: ClassifyRequest):
    """
    Klasifikasi prioritas tiket (Low, Normal, Urgent)
    """
    start_time = datetime.now()
    
    try:
        # Check if models are loaded
        if classifier is None or vectorizer is None:
            logger.error("Models not loaded, returning fallback")
            return ClassifyResponse(
                priority="normal",
                confidence_score=0.0,
                probabilities={"low": 0.0, "normal": 1.0, "urgent": 0.0},
                model_version="fallback",
                processed_at=datetime.now().isoformat(),
                processing_time_ms=0,
            )
        
        # Preprocess text
        processed_text = preprocessor.preprocess(request.text)
        
        if not processed_text:
            return ClassifyResponse(
                priority="normal",
                confidence_score=0.0,
                probabilities={"low": 0.33, "normal": 0.34, "urgent": 0.33},
                model_version="empty_text",
                processed_at=datetime.now().isoformat(),
                processing_time_ms=0,
            )
        
        # Vectorize
        text_vector = vectorizer.transform([processed_text])
        
        # Predict
        prediction = classifier.predict(text_vector)[0]
        prediction_label = label_encoder.inverse_transform([prediction])[0] if label_encoder else prediction
        
        # Get probabilities
        if hasattr(classifier, 'predict_proba'):
            probabilities = classifier.predict_proba(text_vector)[0]
            confidence_score = float(max(probabilities))
            
            prob_dict = {}
            for i, label in enumerate(label_encoder.classes_ if label_encoder else ['low', 'normal', 'urgent']):
                prob_dict[label] = float(probabilities[i]) if i < len(probabilities) else 0.0
        else:
            confidence_score = 0.8  # Default confidence
            prob_dict = {"low": 0.1, "normal": 0.1, "urgent": 0.8}
            prob_dict[prediction_label] = 0.8
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        logger.info(f"📊 Classified: '{request.text[:50]}...' -> {prediction_label} (confidence: {confidence_score:.3f})")
        
        return ClassifyResponse(
            priority=prediction_label,
            confidence_score=confidence_score,
            probabilities=prob_dict,
            model_version=f"v1.0-{model_info['classifier_type']}",
            processed_at=datetime.now().isoformat(),
            processing_time_ms=round(processing_time, 2),
        )
        
    except Exception as e:
        logger.error(f"❌ Classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")


@app.post("/api/similarity", response_model=SimilarityResponse)
async def faq_similarity(request: SimilarityRequest):
    """
    Mencari FAQ yang mirip dengan query (Cosine Similarity)
    """
    try:
        if faq_df is None or faq_vectors is None:
            logger.warning("FAQ data not loaded, returning empty")
            return SimilarityResponse(
                matches=[],
                query=request.query,
                threshold_used=0.3,
            )
        
        # Preprocess query
        processed_query = preprocessor.preprocess(request.query)
        
        if not processed_query:
            return SimilarityResponse(
                matches=[],
                query=request.query,
                threshold_used=0.3,
            )
        
        # Vectorize query
        query_vector = vectorizer.transform([processed_query])
        
        # Calculate cosine similarity
        from sklearn.metrics.pairwise import cosine_similarity
        similarities = cosine_similarity(query_vector, faq_vectors)[0]
        
        # Get top matches above threshold
        threshold = 0.1  # Lower threshold for more matches
        top_indices = np.argsort(similarities)[::-1][:5]  # Top 5
        
        matches = []
        for idx in top_indices:
            score = float(similarities[idx])
            if score >= threshold:
                faq_row = faq_df.iloc[idx]
                matches.append(FAQMatch(
                    id=int(idx),
                    title=faq_row.get('text', f"FAQ #{idx}")[:100],
                    content=faq_row.get('text', ''),
                    category=faq_row.get('category', 'lainnya'),
                    similarity_score=round(score, 4),
                ))
        
        logger.info(f"🔍 FAQ search: '{request.query[:50]}...' -> {len(matches)} matches found")
        
        return SimilarityResponse(
            matches=matches,
            query=request.query,
            threshold_used=threshold,
        )
        
    except Exception as e:
        logger.error(f"❌ Similarity error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Similarity check failed: {str(e)}")


@app.post("/api/retrain")
async def retrain_model(request: TrainRequest, background_tasks: BackgroundTasks):
    """
    Retrain model dengan data terbaru (Active Learning)
    """
    try:
        # Import train module
        from train import PriorityClassifier
        
        dataset_path = request.dataset_url or 'datasets/dataset.csv'
        
        if request.force_retrain or not model_loader.models_exist():
            # Run training
            trainer = PriorityClassifier()
            results = trainer.run(dataset_path)
            
            # Reload models
            global classifier, vectorizer, label_encoder
            classifier, vectorizer, label_encoder = model_loader.load_models()
            
            return {
                "success": True,
                "message": "Model retrained successfully",
                "results": results,
            }
        else:
            return {
                "success": False,
                "message": "Models already exist. Use force_retrain=true to force retraining",
            }
            
    except Exception as e:
        logger.error(f"❌ Retrain error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Retrain failed: {str(e)}")


@app.get("/api/model-info")
async def get_model_info():
    """Get model information"""
    return model_info


# ============================================
# MAIN
# ============================================

if __name__ == "__main__":
    import uvicorn
    
    logger.info("🚀 Starting ML Service...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5000,
        log_level="info",
        reload=True,
    )
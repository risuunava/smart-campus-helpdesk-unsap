import os
import joblib
from typing import Tuple, Any
import logging

logger = logging.getLogger(__name__)

class ModelLoader:
    """
    Load dan manage ML models
    """
    
    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        self.classifier = None
        self.vectorizer = None
        self.label_encoder = None
        
    def load_models(self) -> Tuple[Any, Any, Any]:
        """
        Load semua model dari disk
        """
        try:
            # Load TF-IDF Vectorizer
            vectorizer_path = os.path.join(self.models_dir, 'tfidf_vectorizer.pkl')
            if os.path.exists(vectorizer_path):
                self.vectorizer = joblib.load(vectorizer_path)
                logger.info(f"✅ Vectorizer loaded from {vectorizer_path}")
            else:
                logger.error(f"❌ Vectorizer not found at {vectorizer_path}")
                raise FileNotFoundError(f"Vectorizer not found: {vectorizer_path}")
            
            # Load Classifier
            classifier_path = os.path.join(self.models_dir, 'priority_classifier.pkl')
            if os.path.exists(classifier_path):
                self.classifier = joblib.load(classifier_path)
                logger.info(f"✅ Classifier loaded from {classifier_path}")
            else:
                logger.error(f"❌ Classifier not found at {classifier_path}")
                raise FileNotFoundError(f"Classifier not found: {classifier_path}")
            
            # Load Label Encoder
            encoder_path = os.path.join(self.models_dir, 'label_encoder.pkl')
            if os.path.exists(encoder_path):
                self.label_encoder = joblib.load(encoder_path)
                logger.info(f"✅ Label encoder loaded from {encoder_path}")
            else:
                logger.warning(f"⚠️ Label encoder not found, using default")
                self.label_encoder = None
            
            return self.classifier, self.vectorizer, self.label_encoder
            
        except Exception as e:
            logger.error(f"❌ Error loading models: {str(e)}")
            raise
    
    def save_models(self, classifier, vectorizer, label_encoder=None):
        """
        Save models ke disk
        """
        os.makedirs(self.models_dir, exist_ok=True)
        
        # Save vectorizer
        joblib.dump(vectorizer, os.path.join(self.models_dir, 'tfidf_vectorizer.pkl'))
        logger.info(f"💾 Vectorizer saved")
        
        # Save classifier
        joblib.dump(classifier, os.path.join(self.models_dir, 'priority_classifier.pkl'))
        logger.info(f"💾 Classifier saved")
        
        # Save label encoder
        if label_encoder:
            joblib.dump(label_encoder, os.path.join(self.models_dir, 'label_encoder.pkl'))
            logger.info(f"💾 Label encoder saved")
    
    def models_exist(self) -> bool:
        """
        Check if models already exist
        """
        return (
            os.path.exists(os.path.join(self.models_dir, 'tfidf_vectorizer.pkl')) and
            os.path.exists(os.path.join(self.models_dir, 'priority_classifier.pkl'))
        )
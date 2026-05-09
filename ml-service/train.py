"""
Script untuk melatih model ML untuk Smart Campus Helpdesk UNSAP
Melatih classifier prioritas tiket (Low, Normal, Urgent)
"""

import pandas as pd
import numpy as np
import joblib
import os
import sys
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import LabelEncoder
from sklearn.pipeline import Pipeline
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.preprocessing import TextPreprocessor

class PriorityClassifier:
    """
    Classifier untuk klasifikasi prioritas tiket helpdesk
    """
    
    def __init__(self):
        self.preprocessor = TextPreprocessor()
        self.vectorizer = None
        self.classifier = None
        self.label_encoder = None
        self.models_dir = 'models'
        
    def load_data(self, filepath: str) -> pd.DataFrame:
        """
        Load dataset dari CSV
        """
        logger.info(f"📂 Loading data from {filepath}")
        
        if not os.path.exists(filepath):
            logger.error(f"❌ File not found: {filepath}")
            raise FileNotFoundError(f"Dataset not found: {filepath}")
        
        df = pd.read_csv(filepath)
        logger.info(f"✅ Loaded {len(df)} records")
        logger.info(f"📊 Priority distribution:\n{df['priority'].value_counts()}")
        
        return df
    
    def preprocess_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Preprocessing data teks
        """
        logger.info("🔧 Preprocessing text data...")
        
        # Combine text and category for better context
        df['processed_text'] = df.apply(
            lambda row: f"{row['text']} {row['category']}", 
            axis=1
        )
        
        # Apply text preprocessing
        df['processed_text'] = df['processed_text'].apply(self.preprocessor.preprocess)
        
        # Remove empty texts
        df = df[df['processed_text'].str.strip() != '']
        
        logger.info(f"✅ Preprocessed {len(df)} records")
        
        return df
    
    def train_model(self, df: pd.DataFrame):
        """
        Train model klasifikasi
        """
        logger.info("🤖 Training classification model...")
        
        # Prepare features and labels
        X = df['processed_text'].values
        y = df['priority'].values
        
        # Encode labels
        self.label_encoder = LabelEncoder()
        y_encoded = self.label_encoder.fit_transform(y)
        
        logger.info(f"📊 Label mapping: {dict(zip(self.label_encoder.classes_, range(len(self.label_encoder.classes_))))}")
        
        # Split data (80% train, 20% test)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        logger.info(f"📊 Training set: {len(X_train)} samples")
        logger.info(f"📊 Test set: {len(X_test)} samples")
        
        # TF-IDF Vectorization
        logger.info("📝 Vectorizing text with TF-IDF...")
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.9,
            sublinear_tf=True
        )
        
        X_train_vec = self.vectorizer.fit_transform(X_train)
        X_test_vec = self.vectorizer.transform(X_test)
        
        logger.info(f"📊 TF-IDF features: {X_train_vec.shape[1]}")
        
        # Try multiple classifiers and select the best one
        classifiers = {
            'Naive Bayes': MultinomialNB(alpha=0.1),
            'Logistic Regression': LogisticRegression(
                C=1.0, 
                max_iter=1000, 
                class_weight='balanced',
                multi_class='multinomial'
            ),
            'SVM': SVC(kernel='linear', probability=True, class_weight='balanced'),
            'Random Forest': RandomForestClassifier(
                n_estimators=200,
                max_depth=10,
                class_weight='balanced',
                random_state=42
            ),
        }
        
        best_model = None
        best_score = 0
        best_name = ""
        
        logger.info("\n📊 Model Comparison:")
        logger.info("-" * 60)
        
        for name, clf in classifiers.items():
            # Cross-validation
            cv_scores = cross_val_score(clf, X_train_vec, y_train, cv=5, scoring='f1_weighted')
            
            # Train on full training set
            clf.fit(X_train_vec, y_train)
            
            # Evaluate on test set
            y_pred = clf.predict(X_test_vec)
            accuracy = accuracy_score(y_test, y_pred)
            
            logger.info(f"{name:20s} | CV F1: {cv_scores.mean():.3f} (+/- {cv_scores.std()*2:.3f}) | Test Acc: {accuracy:.3f}")
            
            if cv_scores.mean() > best_score:
                best_score = cv_scores.mean()
                best_model = clf
                best_name = name
        
        logger.info("-" * 60)
        logger.info(f"🏆 Best model: {best_name} (CV F1: {best_score:.3f})")
        
        self.classifier = best_model
        
        # Detailed evaluation
        y_pred = self.classifier.predict(X_test_vec)
        y_pred_labels = self.label_encoder.inverse_transform(y_pred)
        y_test_labels = self.label_encoder.inverse_transform(y_test)
        
        logger.info("\n📊 Classification Report:")
        logger.info(classification_report(y_test_labels, y_pred_labels))
        
        logger.info("\n📊 Confusion Matrix:")
        cm = confusion_matrix(y_test_labels, y_pred_labels, labels=['low', 'normal', 'urgent'])
        logger.info(f"           low  normal  urgent")
        for i, label in enumerate(['low', 'normal', 'urgent']):
            logger.info(f"{label:10s} {cm[i]}")
        
        return {
            'model_name': best_name,
            'cv_f1_score': best_score,
            'test_accuracy': accuracy_score(y_test, y_pred),
        }
    
    def save_models(self):
        """
        Save trained models ke disk
        """
        logger.info("💾 Saving models...")
        
        os.makedirs(self.models_dir, exist_ok=True)
        
        # Save TF-IDF Vectorizer
        vectorizer_path = os.path.join(self.models_dir, 'tfidf_vectorizer.pkl')
        joblib.dump(self.vectorizer, vectorizer_path)
        logger.info(f"✅ Vectorizer saved to {vectorizer_path}")
        
        # Save Classifier
        classifier_path = os.path.join(self.models_dir, 'priority_classifier.pkl')
        joblib.dump(self.classifier, classifier_path)
        logger.info(f"✅ Classifier saved to {classifier_path}")
        
        # Save Label Encoder
        encoder_path = os.path.join(self.models_dir, 'label_encoder.pkl')
        joblib.dump(self.label_encoder, encoder_path)
        logger.info(f"✅ Label encoder saved to {encoder_path}")
        
        # Save model info
        info_path = os.path.join(self.models_dir, 'model_info.txt')
        with open(info_path, 'w') as f:
            f.write(f"Model trained on: {pd.Timestamp.now()}\n")
            f.write(f"Vectorizer features: {self.vectorizer.get_feature_names_out().shape[0]}\n")
            f.write(f"Classifier: {type(self.classifier).__name__}\n")
            f.write(f"Labels: {list(self.label_encoder.classes_)}\n")
        
        logger.info(f"✅ Model info saved to {info_path}")
    
    def run(self, dataset_path: str):
        """
        Run full training pipeline
        """
        logger.info("=" * 60)
        logger.info("🎓 SMART CAMPUS HELPDESK UNSAP - MODEL TRAINING")
        logger.info("=" * 60)
        
        # Load data
        df = self.load_data(dataset_path)
        
        # Preprocess data
        df = self.preprocess_data(df)
        
        # Train model
        results = self.train_model(df)
        
        # Save models
        self.save_models()
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ TRAINING COMPLETE!")
        logger.info(f"🏆 Best Model: {results['model_name']}")
        logger.info(f"📊 CV F1 Score: {results['cv_f1_score']:.3f}")
        logger.info(f"📊 Test Accuracy: {results['test_accuracy']:.3f}")
        logger.info("=" * 60)
        
        return results


def main():
    """
    Main function untuk training
    """
    # Path dataset
    dataset_path = 'datasets/dataset.csv'
    
    # Jika ada argumen, gunakan sebagai path
    if len(sys.argv) > 1:
        dataset_path = sys.argv[1]
    
    # Run training
    trainer = PriorityClassifier()
    results = trainer.run(dataset_path)


if __name__ == "__main__":
    main()
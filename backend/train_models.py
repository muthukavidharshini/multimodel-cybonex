"""
Model Training Script
======================
Trains all three detection models and saves them to trained_models/

USAGE:
  python train_models.py --all
  python train_models.py --fake-news
  python train_models.py --phishing
  python train_models.py --fraud

DATASETS REQUIRED:
  datasets/fake_news.csv    - columns: text, label  (0=Fake, 1=Real)
  datasets/phishing_urls.csv - columns: url, label  (0=Legitimate, 1=Phishing)
  datasets/fraud_sms.csv    - columns: text, label  (0=Ham, 1=Spam/Fraud)

Download suggestions:
  Fake News: https://www.kaggle.com/datasets/saurabhshahane/fake-news-classification
  Phishing URLs: https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset
  SMS Fraud: https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset

NOTE: This script trains real models on real data.
      Do NOT replace datasets with fabricated data.
"""

import os
import sys
import argparse
import logging
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                              f1_score, classification_report, confusion_matrix)
import nltk
import re

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

DATASET_DIR = Path(__file__).parent / 'datasets'
MODEL_DIR = Path(__file__).parent / 'trained_models'
MODEL_DIR.mkdir(exist_ok=True)

# ─── NLP Utilities ───────────────────────────────────────────────────────────

def download_nltk():
    for pkg in ['stopwords', 'punkt', 'wordnet']:
        try:
            nltk.download(pkg, quiet=True)
        except Exception:
            pass


def preprocess_text(text: str) -> str:
    if not isinstance(text, str):
        return ''
    text = text.lower()
    text = re.sub(r'https?://\S+|www\.\S+', ' url ', text)
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


# ─── Fake News Model ─────────────────────────────────────────────────────────

def train_fake_news():
    logger.info("=== Training Fake News Detection Model ===")
    csv_path = DATASET_DIR / 'fake_news.csv'
    if not csv_path.exists():
        logger.error(f"Dataset not found: {csv_path}")
        logger.error("Download from: https://www.kaggle.com/datasets/saurabhshahane/fake-news-classification")
        logger.error("Expected columns: text, label (0=Fake, 1=Real)")
        return False

    df = pd.read_csv(csv_path)
    logger.info(f"Loaded {len(df)} rows")

    # Flexible column detection
    text_col = next((c for c in df.columns if 'text' in c.lower() or 'content' in c.lower()), None)
    label_col = next((c for c in df.columns if 'label' in c.lower() or 'class' in c.lower()), None)
    if not text_col or not label_col:
        logger.error(f"Could not identify text/label columns. Found: {list(df.columns)}")
        return False

    df = df[[text_col, label_col]].dropna()
    df.columns = ['text', 'label']
    df['text'] = df['text'].apply(preprocess_text)
    df = df[df['text'].str.len() > 20]

    logger.info(f"Class distribution:\n{df['label'].value_counts()}")

    X_train, X_test, y_train, y_test = train_test_split(
        df['text'], df['label'], test_size=0.2, random_state=42, stratify=df['label'])

    vectorizer = TfidfVectorizer(max_features=50000, ngram_range=(1, 2),
                                  min_df=3, max_df=0.95, sublinear_tf=True)
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    clf = LogisticRegression(max_iter=1000, C=1.0, random_state=42, class_weight='balanced')
    clf.fit(X_train_tfidf, y_train)

    y_pred = clf.predict(X_test_tfidf)
    _print_metrics('Fake News', y_test, y_pred)

    joblib.dump(clf, MODEL_DIR / 'fake_news_classifier.joblib')
    joblib.dump(vectorizer, MODEL_DIR / 'fake_news_vectorizer.joblib')
    logger.info("✓ Saved: trained_models/fake_news_classifier.joblib")
    return True


# ─── Phishing URL Model ──────────────────────────────────────────────────────

def train_phishing():
    logger.info("=== Training Phishing URL Detection Model ===")
    csv_path = DATASET_DIR / 'phishing_urls.csv'
    if not csv_path.exists():
        logger.error(f"Dataset not found: {csv_path}")
        logger.error("Download from: https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset")
        logger.error("Expected columns: url, label (0=Legitimate, 1=Phishing)")
        return False

    sys.path.insert(0, str(Path(__file__).parent))
    from app.ai_models.phishing_model import extract_url_features

    df = pd.read_csv(csv_path)
    logger.info(f"Loaded {len(df)} rows")

    url_col = next((c for c in df.columns if 'url' in c.lower()), None)
    label_col = next((c for c in df.columns if 'label' in c.lower() or 'class' in c.lower()), None)
    if not url_col or not label_col:
        logger.error(f"Could not identify url/label columns. Found: {list(df.columns)}")
        return False

    df = df[[url_col, label_col]].dropna()
    df.columns = ['url', 'label']

    logger.info("Extracting URL features (this may take a few minutes)...")
    feature_dicts = df['url'].apply(extract_url_features).tolist()
    X = pd.DataFrame(feature_dicts).fillna(0)
    y = df['label'].values

    logger.info(f"Class distribution: {pd.Series(y).value_counts().to_dict()}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    clf = RandomForestClassifier(n_estimators=100, random_state=42,
                                  class_weight='balanced', n_jobs=-1)
    clf.fit(X_train_scaled, y_train)

    y_pred = clf.predict(X_test_scaled)
    _print_metrics('Phishing URL', y_test, y_pred)

    joblib.dump(clf, MODEL_DIR / 'phishing_url_classifier.joblib')
    joblib.dump(scaler, MODEL_DIR / 'phishing_url_scaler.joblib')
    logger.info("✓ Saved: trained_models/phishing_url_classifier.joblib")
    return True


# ─── Fraud Detection Model ───────────────────────────────────────────────────

def train_fraud():
    logger.info("=== Training Digital Fraud Detection Model ===")
    csv_path = DATASET_DIR / 'fraud_sms.csv'
    if not csv_path.exists():
        logger.error(f"Dataset not found: {csv_path}")
        logger.error("Download from: https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset")
        logger.error("Expected columns: text, label (ham or spam / 0 or 1)")
        return False

    df = pd.read_csv(csv_path, encoding='latin-1')
    logger.info(f"Loaded {len(df)} rows")

    text_col = next((c for c in df.columns if 'text' in c.lower() or 'message' in c.lower() or 'sms' in c.lower()), None)
    label_col = next((c for c in df.columns if 'label' in c.lower() or 'class' in c.lower() or 'v1' in c.lower()), None)
    if not text_col or not label_col:
        logger.error(f"Could not identify columns. Found: {list(df.columns)}")
        return False

    df = df[[text_col, label_col]].dropna()
    df.columns = ['text', 'label']

    # Normalise labels
    if df['label'].dtype == object:
        df['label'] = df['label'].map({'ham': 0, 'spam': 1, 'legitimate': 0, 'fraud': 1}).fillna(df['label'])
    df['label'] = df['label'].astype(int)
    df['text'] = df['text'].apply(preprocess_text)

    logger.info(f"Class distribution: {df['label'].value_counts().to_dict()}")

    X_train, X_test, y_train, y_test = train_test_split(
        df['text'], df['label'], test_size=0.2, random_state=42, stratify=df['label'])

    vectorizer = TfidfVectorizer(max_features=20000, ngram_range=(1, 2),
                                  min_df=2, sublinear_tf=True)
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    clf = RandomForestClassifier(n_estimators=100, random_state=42,
                                  class_weight='balanced', n_jobs=-1)
    clf.fit(X_train_tfidf, y_train)

    y_pred = clf.predict(X_test_tfidf)
    _print_metrics('Digital Fraud', y_test, y_pred)

    joblib.dump(clf, MODEL_DIR / 'fraud_classifier.joblib')
    joblib.dump(vectorizer, MODEL_DIR / 'fraud_vectorizer.joblib')
    logger.info("✓ Saved: trained_models/fraud_classifier.joblib")
    return True


def _print_metrics(name, y_true, y_pred):
    print(f"\n{'='*50}")
    print(f"  {name} Model Evaluation")
    print(f"{'='*50}")
    print(f"  Accuracy:  {accuracy_score(y_true, y_pred):.4f}")
    print(f"  Precision: {precision_score(y_true, y_pred, average='weighted', zero_division=0):.4f}")
    print(f"  Recall:    {recall_score(y_true, y_pred, average='weighted', zero_division=0):.4f}")
    print(f"  F1 Score:  {f1_score(y_true, y_pred, average='weighted', zero_division=0):.4f}")
    print(f"\n  Classification Report:\n{classification_report(y_true, y_pred, zero_division=0)}")
    print(f"  Confusion Matrix:\n{confusion_matrix(y_true, y_pred)}")
    print(f"{'='*50}\n")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Train Cross-Modal Intelligence detection models')
    parser.add_argument('--all', action='store_true', help='Train all models')
    parser.add_argument('--fake-news', action='store_true', help='Train fake news model')
    parser.add_argument('--phishing', action='store_true', help='Train phishing model')
    parser.add_argument('--fraud', action='store_true', help='Train fraud model')
    args = parser.parse_args()

    if not any([args.all, args.fake_news, args.phishing, args.fraud]):
        parser.print_help()
        sys.exit(0)

    download_nltk()

    if args.all or args.fake_news:
        train_fake_news()
    if args.all or args.phishing:
        train_phishing()
    if args.all or args.fraud:
        train_fraud()

    logger.info("\n✓ Training complete. Models saved to trained_models/")

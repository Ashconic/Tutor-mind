import sys
import io
import json
import os

# Ensure UTF-8 output even on Windows console
if sys.platform.startswith('win'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, roc_auc_score, f1_score, confusion_matrix, classification_report
import joblib

def generate_synthetic_telemetry(n_samples=3500, random_state=42):
    np.random.seed(random_state)
    
    # 1. accuracy_rate (0.0 to 1.0)
    accuracy_rate = np.clip(np.random.beta(a=3.0, b=2.0, size=n_samples), 0.0, 1.0)
    
    # 2. consecutive_errors (0 to 5)
    error_lambda = np.clip(3.5 * (1.0 - accuracy_rate), 0.1, 4.5)
    consecutive_errors = np.random.poisson(lam=error_lambda)
    consecutive_errors = np.clip(consecutive_errors, 0, 5)
    
    # 3. solving_latency (0.3 to 3.5 ratio vs expected time)
    latency_base = 1.0 + 0.8 * (1.0 - accuracy_rate) + 0.25 * consecutive_errors
    solving_latency = np.clip(np.random.normal(loc=latency_base, scale=0.4), 0.2, 4.0)
    
    # 4. tutor_inquiries (0 to 10)
    inquiry_lambda = np.clip(1.5 + 2.0 * consecutive_errors - 1.5 * accuracy_rate, 0.2, 8.0)
    tutor_inquiries = np.random.poisson(lam=inquiry_lambda)
    tutor_inquiries = np.clip(tutor_inquiries, 0, 10)
    
    # 5. streak_days (0 to 30)
    streak_days = np.random.exponential(scale=6.0, size=n_samples).astype(int)
    streak_days = np.clip(streak_days, 0, 30)
    
    # 6. topic_difficulty (1: Foundational, 2: Intermediate, 3: Advanced)
    topic_difficulty = np.random.choice([1, 2, 3], size=n_samples, p=[0.35, 0.45, 0.20])
    
    # Ground truth latent struggle risk score
    logit = (
        - 3.8 * accuracy_rate
        + 1.1 * consecutive_errors
        + 0.7 * (solving_latency - 1.0)
        + 0.45 * tutor_inquiries
        - 0.06 * streak_days
        + 0.5 * topic_difficulty
        + np.random.normal(0, 0.4, size=n_samples)
    )
    
    prob = 1.0 / (1.0 + np.exp(-logit))
    struggle_label = (prob > 0.50).astype(int)
    
    df = pd.DataFrame({
        'accuracy_rate': np.round(accuracy_rate, 3),
        'consecutive_errors': consecutive_errors,
        'solving_latency': np.round(solving_latency, 2),
        'tutor_inquiries': tutor_inquiries,
        'streak_days': streak_days,
        'topic_difficulty': topic_difficulty,
        'struggle_risk': struggle_label
    })
    return df

def train_and_evaluate():
    print("=" * 60)
    print("TutorMind Student Cognitive Mastery & Struggle Predictor")
    print("Training Scikit-Learn Supervised ML Model Pipeline")
    print("=" * 60)
    
    df = generate_synthetic_telemetry(n_samples=4000, random_state=42)
    print(f"[+] Generated {len(df)} student learning telemetry observations.")
    print(f"    Distribution: {np.sum(df['struggle_risk'] == 0)} On-Track (0), {np.sum(df['struggle_risk'] == 1)} At-Risk (1)")
    
    feature_names = [
        'accuracy_rate',
        'consecutive_errors',
        'solving_latency',
        'tutor_inquiries',
        'streak_days',
        'topic_difficulty'
    ]
    
    X = df[feature_names]
    y = df['struggle_risk']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    # Train Random Forest Classifier
    rf_model = RandomForestClassifier(
        n_estimators=120,
        max_depth=6,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    
    rf_model.fit(X_train, y_train)
    
    # Predictions & Probabilities
    y_pred = rf_model.predict(X_test)
    y_prob = rf_model.predict_proba(X_test)[:, 1]
    
    # Metrics
    acc = accuracy_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_prob)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred).tolist()
    cv_scores = cross_val_score(rf_model, X, y, cv=5, scoring='accuracy').tolist()
    
    print("\nModel Performance Evaluation:")
    print(f"   Accuracy:        {acc * 100:.2f}%")
    print(f"   ROC-AUC Score:   {roc_auc:.4f}")
    print(f"   F1-Score:        {f1:.4f}")
    print(f"   5-Fold CV Mean:  {np.mean(cv_scores) * 100:.2f}% (+/- {np.std(cv_scores)*100:.2f}%)")
    print("\nConfusion Matrix [TN, FP], [FN, TP]:")
    print(np.array(cm))
    
    # Feature Importances
    importances = rf_model.feature_importances_
    feature_imp_map = {
        name: float(np.round(imp * 100, 2))
        for name, imp in zip(feature_names, importances)
    }
    
    sorted_features = sorted(feature_imp_map.items(), key=lambda item: item[1], reverse=True)
    print("\nExplainable AI (XAI) - Feature Importance Weights:")
    for feat, val in sorted_features:
        bar = "#" * int(val // 2)
        print(f"   {feat:<20} {val:>5.2f}% | {bar}")
        
    model_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(model_dir, 'struggle_model.joblib')
    metrics_path = os.path.join(model_dir, 'model_metrics.json')
    dataset_csv_path = os.path.join(model_dir, 'student_telemetry_dataset.csv')
    
    df.to_csv(dataset_csv_path, index=False)
    print(f"\n[+] Complete dataset CSV saved to: {dataset_csv_path}")
    
    joblib.dump(rf_model, model_path)
    print(f"[+] Model artifact saved to: {model_path}")
    
    metrics_data = {
        'model_name': 'RandomForestClassifier',
        'framework': 'scikit-learn 1.8.0',
        'algorithm': 'Ensemble Decision Trees (120 Estimators, Max Depth: 6)',
        'accuracy': float(np.round(acc, 4)),
        'roc_auc': float(np.round(roc_auc, 4)),
        'f1_score': float(np.round(f1, 4)),
        'cv_mean_accuracy': float(np.round(np.mean(cv_scores), 4)),
        'confusion_matrix': cm,
        'feature_importances': dict(sorted_features),
        'features_metadata': {
            'accuracy_rate': {'label': 'Recent Assessment Accuracy', 'weight': feature_imp_map['accuracy_rate'], 'unit': '%'},
            'consecutive_errors': {'label': 'Consecutive Error Velocity', 'weight': feature_imp_map['consecutive_errors'], 'unit': 'attempts'},
            'solving_latency': {'label': 'Solving Latency / Pacing Ratio', 'weight': feature_imp_map['solving_latency'], 'unit': 'x benchmark'},
            'tutor_inquiries': {'label': 'AI Tutor Inquiries on Topic', 'weight': feature_imp_map['tutor_inquiries'], 'unit': 'queries'},
            'streak_days': {'label': 'Engagement & Retention Streak', 'weight': feature_imp_map['streak_days'], 'unit': 'days'},
            'topic_difficulty': {'label': 'Curriculum Topic Complexity Tier', 'weight': feature_imp_map['topic_difficulty'], 'unit': 'tier 1-3'}
        },
        'training_samples': len(df),
        'test_samples': len(X_test)
    }
    
    with open(metrics_path, 'w', encoding='utf-8') as f:
        json.dump(metrics_data, f, indent=2)
    print(f"[+] Evaluation metrics saved to: {metrics_path}")
    print("\n[+] ML Training Pipeline Completed Successfully!")

if __name__ == '__main__':
    train_and_evaluate()

import sys
import io
import json
import os
import numpy as np
import pandas as pd
import joblib

if sys.platform.startswith('win'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

model_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(model_dir, 'struggle_model.joblib')
metrics_path = os.path.join(model_dir, 'model_metrics.json')

_cached_model = None
_cached_metrics = None

def get_model():
    global _cached_model, _cached_metrics
    if _cached_model is None:
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model artifact not found at {model_path}. Run train_model.py first.")
        _cached_model = joblib.load(model_path)
    if _cached_metrics is None and os.path.exists(metrics_path):
        with open(metrics_path, 'r', encoding='utf-8') as f:
            _cached_metrics = json.load(f)
    return _cached_model, _cached_metrics

def predict_single(telemetry):
    model, metrics = get_model()
    
    # Feature extraction with defaults
    accuracy_rate = float(telemetry.get('accuracy_rate', telemetry.get('accuracyRate', 0.75)))
    consecutive_errors = int(telemetry.get('consecutive_errors', telemetry.get('consecutiveErrors', 0)))
    solving_latency = float(telemetry.get('solving_latency', telemetry.get('solvingLatency', 1.0)))
    tutor_inquiries = int(telemetry.get('tutor_inquiries', telemetry.get('tutorInquiries', 0)))
    streak_days = int(telemetry.get('streak_days', telemetry.get('streakDays', telemetry.get('streak', 1))))
    topic_difficulty = int(telemetry.get('topic_difficulty', telemetry.get('topicDifficulty', telemetry.get('difficulty', 1))))
    
    # Bound inputs
    accuracy_rate = float(np.clip(accuracy_rate, 0.0, 1.0))
    consecutive_errors = int(np.clip(consecutive_errors, 0, 10))
    solving_latency = float(np.clip(solving_latency, 0.1, 5.0))
    tutor_inquiries = int(np.clip(tutor_inquiries, 0, 20))
    streak_days = int(np.clip(streak_days, 0, 100))
    topic_difficulty = int(np.clip(topic_difficulty, 1, 3))
    
    feature_df = pd.DataFrame([{
        'accuracy_rate': accuracy_rate,
        'consecutive_errors': consecutive_errors,
        'solving_latency': solving_latency,
        'tutor_inquiries': tutor_inquiries,
        'streak_days': streak_days,
        'topic_difficulty': topic_difficulty
    }])
    
    # ML Model Inference
    probs = model.predict_proba(feature_df)[0]
    struggle_prob = float(probs[1])
    risk_score_pct = float(round(struggle_prob * 100, 1))
    
    # Cognitive State Classification
    if risk_score_pct < 35.0:
        cognitive_state = "Mastery Flow"
        action = "Pace acceleration: Student is confident. Introduce advanced extension problem."
        severity = "low"
    elif risk_score_pct < 65.0:
        cognitive_state = "Steady Progress"
        action = "Monitor pacing: Normal conceptual acquisition. Reinforce with worked examples."
        severity = "moderate"
    else:
        cognitive_state = "High Struggle Risk"
        action = "Pedagogical intervention recommended: Send guided hint or assign targeted practice."
        severity = "high"
        
    # Explainable AI Factor Ranking
    feature_importances = metrics.get('feature_importances', {}) if metrics else {}
    contributing_factors = [
        {
            'feature': 'consecutive_errors',
            'label': 'Consecutive Error Velocity',
            'value': int(consecutive_errors),
            'unit': 'attempts',
            'importance_weight': float(feature_importances.get('consecutive_errors', 40.15)),
            'impact': 'High' if consecutive_errors >= 2 else 'Normal'
        },
        {
            'feature': 'tutor_inquiries',
            'label': 'AI Tutor Inquiries on Topic',
            'value': int(tutor_inquiries),
            'unit': 'queries',
            'importance_weight': float(feature_importances.get('tutor_inquiries', 31.74)),
            'impact': 'High' if tutor_inquiries >= 3 else 'Normal'
        },
        {
            'feature': 'accuracy_rate',
            'label': 'Recent Assessment Accuracy',
            'value': f"{int(accuracy_rate * 100)}%",
            'unit': '%',
            'importance_weight': float(feature_importances.get('accuracy_rate', 13.12)),
            'impact': 'Critical' if accuracy_rate < 0.50 else 'Normal'
        },
        {
            'feature': 'solving_latency',
            'label': 'Solving Latency / Pacing',
            'value': f"{solving_latency:.1f}x",
            'unit': 'ratio',
            'importance_weight': float(feature_importances.get('solving_latency', 11.92)),
            'impact': 'Elevated' if solving_latency > 1.8 else 'Normal'
        }
    ]
    
    contributing_factors.sort(key=lambda x: (1 if x['impact'] in ['High', 'Critical'] else 0, x['importance_weight']), reverse=True)
    
    return {
        'success': True,
        'struggleRiskScore': risk_score_pct,
        'isAtRisk': bool(risk_score_pct >= 50.0),
        'cognitiveState': cognitive_state,
        'severity': severity,
        'confidence': float(round(float(np.max(probs)), 3)),
        'contributingFactors': contributing_factors,
        'recommendedAction': action,
        'modelInfo': {
            'modelName': str(metrics.get('model_name', 'RandomForestClassifier') if metrics else 'RandomForestClassifier'),
            'framework': str(metrics.get('framework', 'scikit-learn 1.8.0') if metrics else 'scikit-learn'),
            'accuracy': float(metrics.get('accuracy', 0.9538) if metrics else 0.9538),
            'rocAuc': float(metrics.get('roc_auc', 0.9942) if metrics else 0.9942)
        }
    }

def main():
    if len(sys.argv) > 1 and sys.argv[1].strip().startswith('{'):
        try:
            telemetry = json.loads(sys.argv[1].strip())
        except Exception as e:
            print(json.dumps({'success': False, 'error': f"Invalid JSON input: {str(e)}"}))
            sys.exit(1)
    elif len(sys.argv) > 1 and any(arg.startswith('-') for arg in sys.argv[1:]):
        import argparse
        parser = argparse.ArgumentParser(description="TutorMind Cognitive Struggle Predictor")
        parser.add_argument('--accuracy', type=float, default=0.75, help='Recent assessment accuracy (0.0 to 1.0)')
        parser.add_argument('--errors', type=int, default=0, help='Consecutive errors on topic')
        parser.add_argument('--latency', type=float, default=1.0, help='Solving latency / pacing ratio')
        parser.add_argument('--inquiries', type=int, default=0, help='AI tutor inquiries count')
        parser.add_argument('--streak', type=int, default=1, help='Learning streak days')
        parser.add_argument('--difficulty', type=int, default=2, help='Topic difficulty tier (1-3)')
        args, _ = parser.parse_known_args()
        telemetry = {
            'accuracy_rate': args.accuracy,
            'consecutive_errors': args.errors,
            'solving_latency': args.latency,
            'tutor_inquiries': args.inquiries,
            'streak_days': args.streak,
            'topic_difficulty': args.difficulty
        }
    elif len(sys.argv) > 1:
        try:
            telemetry = json.loads(sys.argv[1])
        except Exception as e:
            print(json.dumps({'success': False, 'error': f"Invalid JSON input: {str(e)}"}))
            sys.exit(1)
    else:
        telemetry = {
            'accuracy_rate': 0.33,
            'consecutive_errors': 2,
            'solving_latency': 2.2,
            'tutor_inquiries': 3,
            'streak_days': 2,
            'topic_difficulty': 2
        }
            
    try:
        result = predict_single(telemetry)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()

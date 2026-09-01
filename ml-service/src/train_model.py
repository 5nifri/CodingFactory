"""
Trains a Decision Tree classifier that predicts a recommended formation
category from a student's selected interests (checkbox flags collected
at registration).

Input features: 7 binary interest flags (see generate_dataset.py)
Output label:   one of the 7 formation categories

Run:
    python src/train_model.py

Produces:
    models/formation_recommender.pkl
"""

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib

FEATURES = [
    "interest_development",
    "interest_mobile",
    "interest_data_science",
    "interest_ai",
    "interest_devops",
    "interest_cybersecurity",
    "interest_erp",
]
LABEL = "recommended_category"

DATA_PATH = "data/students.csv"
MODEL_PATH = "models/formation_recommender.pkl"


def main():
    df = pd.read_csv(DATA_PATH)

    X = df[FEATURES]
    y = df[LABEL]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = DecisionTreeClassifier(max_depth=7, random_state=42)
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)
    print(f"Test accuracy: {accuracy:.3f}")
    print()
    print("Classification report:")
    print(classification_report(y_test, predictions, zero_division=0))
    print()
    print("Confusion matrix (rows=actual, cols=predicted):")
    labels = sorted(y.unique())
    cm = confusion_matrix(y_test, predictions, labels=labels)
    header = "".ljust(16) + "".join(l[:6].ljust(8) for l in labels)
    print(header)
    for label, row in zip(labels, cm):
        print(label.ljust(16) + "".join(str(v).ljust(8) for v in row))

    # feature importances — useful for the report/presentation
    print()
    print("Feature importances:")
    for feature, importance in sorted(
        zip(FEATURES, model.feature_importances_), key=lambda x: -x[1]
    ):
        print(f"  {feature:25s} {importance:.3f}")

    joblib.dump(model, MODEL_PATH)
    print()
    print(f"Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    main()

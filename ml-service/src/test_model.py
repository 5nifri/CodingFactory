"""
Manual sanity check: feed hand-picked interest profiles to the trained
model and inspect predictions + probabilities before wiring up FastAPI.
"""

import joblib
import pandas as pd

FEATURES = [
    "interest_development",
    "interest_mobile",
    "interest_data_science",
    "interest_ai",
    "interest_devops",
    "interest_cybersecurity",
    "interest_erp",
]

model = joblib.load("models/formation_recommender.pkl")


def predict(selected_interests: set):
    row = {f: (1 if f in selected_interests else 0) for f in FEATURES}
    X = pd.DataFrame([row])[FEATURES]

    proba = model.predict_proba(X)[0]
    classes = model.classes_

    ranked = sorted(zip(classes, proba), key=lambda x: -x[1])
    top = ranked[0]

    print(f"Interests: {sorted(selected_interests) if selected_interests else '(none)'}")
    print(f"  -> {top[0]}  ({top[1]:.2f})")
    print("  full distribution:", ", ".join(f"{c}={p:.2f}" for c, p in ranked if p > 0.01))
    print()


test_profiles = [
    {"interest_ai"},
    {"interest_data_science"},
    {"interest_devops"},
    {"interest_cybersecurity"},
    {"interest_mobile"},
    {"interest_development"},
    {"interest_erp"},
    {"interest_ai", "interest_data_science"},
    {"interest_devops", "interest_cybersecurity"},
    {"interest_development", "interest_mobile"},
    set(),  # cold start: no interests selected
]

for profile in test_profiles:
    predict(profile)

# FINDING: the empty-interest profile above returns a confident-looking
# prediction (~80%) that is meaningless — the tree has no real signal and
# is just following its default path for an all-zero input. This must be
# handled explicitly in FastAPI/Spring Boot: if a student has selected
# zero interests, do NOT call predict_proba and present the result as a
# real recommendation. Return "no recommendation available" instead.
# See STEP 12/16 in the project plan (cold-start handling).

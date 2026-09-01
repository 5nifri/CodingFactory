"""
Generates a synthetic training dataset for the formation-category
recommendation model.

IMPORTANT: This data is synthetic, not derived from real student behavior.
It encodes reasonable domain assumptions about which interests correlate
with which formation categories, with randomized noise so the model
must generalize rather than memorize a lookup table. This must be
disclosed as synthetic/bootstrap data in any report or presentation
until it is replaced by real usage data (see STEP 20 / Phase 5 of the
project plan).
"""

import random
import csv

random.seed(42)

CATEGORIES = [
    "DEVELOPMENT",
    "MOBILE",
    "DATA_SCIENCE",
    "AI",
    "DEVOPS",
    "CYBERSECURITY",
    "ERP",
]

INTERESTS = [
    "interest_development",
    "interest_mobile",
    "interest_data_science",
    "interest_ai",
    "interest_devops",
    "interest_cybersecurity",
    "interest_erp",
]

# How strongly each interest "pulls" toward each category.
# Rows = interest flags, columns = categories, values = relative weight.
# Diagonal-dominant (an interest mostly predicts its own category) with
# some deliberate overlap (e.g. AI interest also pulls toward Data Science,
# DevOps pulls slightly toward Development) to mimic real-world correlation
# between adjacent skill domains.
PULL_TABLE = {
    "interest_development":  {"DEVELOPMENT": 20, "MOBILE": 3, "DATA_SCIENCE": 0.3, "AI": 0.3, "DEVOPS": 2, "CYBERSECURITY": 0.3, "ERP": 1},
    "interest_mobile":       {"DEVELOPMENT": 3, "MOBILE": 20, "DATA_SCIENCE": 0.2, "AI": 0.2, "DEVOPS": 0.5, "CYBERSECURITY": 0.2, "ERP": 0.2},
    "interest_data_science": {"DEVELOPMENT": 0.3, "MOBILE": 0.2, "DATA_SCIENCE": 22, "AI": 2, "DEVOPS": 0.3, "CYBERSECURITY": 0.2, "ERP": 1},
    "interest_ai":           {"DEVELOPMENT": 0.3, "MOBILE": 0.2, "DATA_SCIENCE": 2, "AI": 22, "DEVOPS": 0.2, "CYBERSECURITY": 0.3, "ERP": 0.2},
    "interest_devops":       {"DEVELOPMENT": 1.5, "MOBILE": 0.3, "DATA_SCIENCE": 0.2, "AI": 0.2, "DEVOPS": 25, "CYBERSECURITY": 2, "ERP": 0.5},
    "interest_cybersecurity":{"DEVELOPMENT": 0.3, "MOBILE": 0.2, "DATA_SCIENCE": 0.2, "AI": 0.3, "DEVOPS": 2, "CYBERSECURITY": 25, "ERP": 0.5},
    "interest_erp":          {"DEVELOPMENT": 1, "MOBILE": 0.2, "DATA_SCIENCE": 1, "AI": 0.2, "DEVOPS": 0.5, "CYBERSECURITY": 0.5, "ERP": 20},
}


def random_interest_set():
    """A student checks 1 to 3 interests, weighted toward fewer."""
    k = random.choices([1, 2, 3], weights=[0.5, 0.35, 0.15])[0]
    return set(random.sample(INTERESTS, k))


def pick_label(selected_interests):
    """Combine pull weights from all selected interests, then sample
    a label from the resulting distribution (not argmax) so the
    dataset has soft edges instead of hard deterministic rules."""
    scores = {cat: 0.0 for cat in CATEGORIES}
    for interest in selected_interests:
        for cat, weight in PULL_TABLE[interest].items():
            scores[cat] += weight

    # small uniform noise so no combination is ever 100% deterministic,
    # kept low relative to signal strength so the dominant category still
    # wins the large majority of the time
    for cat in scores:
        scores[cat] += random.uniform(0, 0.5)

    categories = list(scores.keys())
    weights = list(scores.values())
    return random.choices(categories, weights=weights, k=1)[0]


def generate_rows(n):
    rows = []
    for _ in range(n):
        selected = random_interest_set()
        row = {interest: (1 if interest in selected else 0) for interest in INTERESTS}
        row["recommended_category"] = pick_label(selected)
        rows.append(row)
    return rows


def main():
    rows = generate_rows(1000)

    out_path = "data/students.csv"
    with open(out_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=INTERESTS + ["recommended_category"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows to {out_path}")

    # quick sanity check: label distribution
    from collections import Counter
    counts = Counter(r["recommended_category"] for r in rows)
    print("Label distribution:")
    for cat in CATEGORIES:
        print(f"  {cat:15s} {counts.get(cat, 0)}")


if __name__ == "__main__":
    main()

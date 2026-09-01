import pandas as pd

df = pd.read_csv("data/students.csv")

print("Shape:", df.shape)
print()
print("For students with EXACTLY ONE interest checked, how often does the")
print("label match that interest's 'obvious' category? (sanity check that")
print("noise isn't overwhelming signal)\n")

interest_to_category = {
    "interest_development": "DEVELOPMENT",
    "interest_mobile": "MOBILE",
    "interest_data_science": "DATA_SCIENCE",
    "interest_ai": "AI",
    "interest_devops": "DEVOPS",
    "interest_cybersecurity": "CYBERSECURITY",
    "interest_erp": "ERP",
}

interest_cols = list(interest_to_category.keys())
single_interest = df[df[interest_cols].sum(axis=1) == 1]

matches = 0
for _, row in single_interest.iterrows():
    checked = [c for c in interest_cols if row[c] == 1][0]
    expected = interest_to_category[checked]
    if row["recommended_category"] == expected:
        matches += 1

print(f"Single-interest rows: {len(single_interest)}")
print(f"Label matches the obvious category: {matches} ({100*matches/len(single_interest):.1f}%)")

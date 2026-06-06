import spacy
import re

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Sample Resume Text
resume_text = """
Akash Kumar is a Software Engineer based in Bangalore.
He is currently working at Google.
He has experience in Python, Machine Learning, TensorFlow, AWS, SQL and Java.
"""

doc = nlp(resume_text)

# -------- Name Extraction --------
name = None
for ent in doc.ents:
    if ent.label_ == "PERSON":
        name = ent.text
        break

# -------- Location Extraction --------
location = None
for ent in doc.ents:
    if ent.label_ == "GPE":
        location = ent.text
        break

# -------- Organization Extraction --------
organization = None
pattern = r"working at ([A-Za-z0-9& ]+)"
match = re.search(pattern, resume_text)
if match:
    organization = match.group(1)

# -------- Skill Extraction --------
skills_list = [
    "python", "java", "machine learning",
    "tensorflow", "aws", "sql"
]

detected_skills = []
for skill in skills_list:
    if skill in resume_text.lower():
        detected_skills.append(skill.title())

# -------- Output --------
print("Name:", name)
print("Location:", location)
print("Organization:", organization)
print("Detected Skills:", detected_skills)
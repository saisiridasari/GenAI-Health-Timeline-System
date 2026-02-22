import pdfplumber
import spacy
import dateparser
import re

nlp = spacy.load("en_core_web_sm")  # Use stable model for clean extraction


def extract_text_from_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def extract_entities(text):
    doc = nlp(text)

    entities = {
        "conditions": [],
        "medications": [],
        "dates": [],
        "lab_values": []
    }

    # 🔹 Medical condition keywords (expand later)
    medical_conditions_keywords = [
        "diabetes",
        "hypertension",
        "bronchopneumonia",
        "infection",
        "fever",
        "asthma",
        "cough",
        "leukocytosis"
    ]

    # 🔹 Medication pattern (detect mg, tablet, etc.)
    medication_pattern = r"([A-Z][a-zA-Z\-]+(?:\s[A-Z][a-zA-Z\-]+)*)\s\d+\s?mg"

    # 🔹 Lab pattern
    lab_pattern = r"(HbA1c|Glucose|Creatinine|Hemoglobin|Platelets|C-Reactive Protein)\s*[:\-]?\s*(\d+\.?\d*)"

    text_lower = text.lower()

    # Condition detection
    for keyword in medical_conditions_keywords:
        if keyword in text_lower:
            entities["conditions"].append(keyword.title())

    # Medication detection
    med_matches = re.findall(medication_pattern, text)
    for med in med_matches:
        entities["medications"].append(med)

    # Date detection
    for ent in doc.ents:
        if ent.label_ == "DATE":
            parsed_date = dateparser.parse(ent.text)
            if parsed_date:
                entities["dates"].append(str(parsed_date.date()))

    # Lab values
    lab_matches = re.findall(lab_pattern, text, re.IGNORECASE)
    for match in lab_matches:
        entities["lab_values"].append({
            "test": match[0],
            "value": match[1]
        })

    # Remove duplicates
    entities["conditions"] = list(set(entities["conditions"]))
    entities["medications"] = list(set(entities["medications"]))
    entities["dates"] = list(set(entities["dates"]))

    return entities


def generate_timeline(entities):
    timeline = []

    # Filter realistic medical event dates (exclude very old dates like DOB)
    valid_dates = []

    for date in entities["dates"]:
        year = int(date.split("-")[0])
        if year > 2000:  # simple filter for modern records
            valid_dates.append(date)

    if not valid_dates:
        return []

    # Use most recent date as report date
    report_date = sorted(valid_dates)[-1]

    # Add condition events
    for condition in entities["conditions"]:
        timeline.append({
            "date": report_date,
            "event": f"Diagnosed with {condition}"
        })

    # Add medication events
    for medication in entities["medications"]:
        timeline.append({
            "date": report_date,
            "event": f"Prescribed {medication}"
        })

    # Add lab events
    for lab in entities["lab_values"]:
        timeline.append({
            "date": report_date,
            "event": f"{lab['test']} recorded: {lab['value']}"
        })

    return timeline
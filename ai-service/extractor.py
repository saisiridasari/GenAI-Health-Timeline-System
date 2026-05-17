import pdfplumber
import spacy
import dateparser
import re
from spacy.matcher import PhraseMatcher

# =========================================
# LOAD NLP MODEL
# =========================================
nlp = spacy.load("en_core_web_sm")

# =========================================
# MEDICAL CONDITION NORMALIZATION
# =========================================
condition_map = {
    "htn": "Hypertension",
    "high blood pressure": "Hypertension",
    "hypertension": "Hypertension",

    "dm": "Diabetes",
    "diabetes mellitus": "Diabetes",
    "diabetes": "Diabetes",

    "infection": "Infection",
    "fever": "Fever",
    "asthma": "Asthma",
    "cough": "Cough",
    "bronchopneumonia": "Bronchopneumonia",
    "leukocytosis": "Leukocytosis"
}

# =========================================
# SPACY PHRASE MATCHER
# =========================================
matcher = PhraseMatcher(nlp.vocab)

condition_patterns = [
    nlp.make_doc(text)
    for text in condition_map.keys()
]

matcher.add("MEDICAL_CONDITIONS", condition_patterns)

# =========================================
# PDF TEXT EXTRACTION
# =========================================
def extract_text_from_pdf(file_path):

    text = ""

    with pdfplumber.open(file_path) as pdf:

        for page in pdf.pages:

            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

    return text


# =========================================
# ENTITY EXTRACTION
# =========================================
def extract_entities(text):

    doc = nlp(text)

    entities = {
        "conditions": [],
        "medications": [],
        "dates": [],
        "lab_values": []
    }

    # =====================================
    # CONDITION EXTRACTION
    # =====================================
    matches = matcher(doc)

    for match_id, start, end in matches:

        matched_text = doc[start:end].text.lower()

        normalized_condition = condition_map.get(
            matched_text,
            matched_text.title()
        )

        entities["conditions"].append(
            normalized_condition
        )

    # =====================================
    # MEDICATION EXTRACTION
    # =====================================
    medication_pattern = r"""
    ([A-Za-z][A-Za-z0-9\-]+(?:\s[A-Za-z0-9\-]+)*)
    \s*
    (\d+\s?(?:mg|ml|mcg|g))
    """

    medication_matches = re.findall(
        medication_pattern,
        text,
        re.IGNORECASE | re.VERBOSE
    )

    for med in medication_matches:

        medicine_name = med[0].strip()
        dosage = med[1].strip()

        entities["medications"].append(
            f"{medicine_name} {dosage}"
        )

    # =====================================
    # DATE EXTRACTION
    # =====================================
    valid_dates = []

    for ent in doc.ents:

        if ent.label_ == "DATE":

            parsed_date = dateparser.parse(ent.text)

            if parsed_date:

                year = parsed_date.year

                # Ignore unrealistic dates
                if year > 2000:

                    valid_dates.append(
                        str(parsed_date.date())
                    )

    entities["dates"] = list(set(valid_dates))

    # =====================================
    # LAB VALUE EXTRACTION
    # =====================================
    lab_pattern = r"""
    (HbA1c|Glucose|Creatinine|Hemoglobin|Platelets|C-Reactive\ Protein)
    \s*[:\-]?\s*
    (\d+\.?\d*)
    \s*
    ([A-Za-z\/%]+)?
    """

    lab_matches = re.findall(
        lab_pattern,
        text,
        re.IGNORECASE | re.VERBOSE
    )

    for match in lab_matches:

        test_name = match[0]
        value = match[1]
        unit = match[2] if match[2] else ""

        entities["lab_values"].append({

            "test": test_name,
            "value": value,
            "unit": unit

        })

    # =====================================
    # REMOVE DUPLICATES
    # =====================================
    entities["conditions"] = list(
        set(entities["conditions"])
    )

    entities["medications"] = list(
        set(entities["medications"])
    )

    return entities


# =========================================
# TIMELINE GENERATION
# =========================================
def generate_timeline(entities):

    timeline = []

    if not entities["dates"]:
        return []

    # Use latest clinical date
    report_date = sorted(
        entities["dates"]
    )[-1]

    # =====================================
    # CONDITION EVENTS
    # =====================================
    for condition in entities["conditions"]:

        timeline.append({

            "date": report_date,
            "type": "condition",

            "event":
                f"Diagnosed with {condition}"

        })

    # =====================================
    # MEDICATION EVENTS
    # =====================================
    for medication in entities["medications"]:

        timeline.append({

            "date": report_date,
            "type": "medication",

            "event":
                f"Prescribed {medication}"

        })

    # =====================================
    # LAB EVENTS
    # =====================================
    for lab in entities["lab_values"]:

        unit_text = (
            f" {lab['unit']}"
            if lab["unit"]
            else ""
        )

        timeline.append({

            "date": report_date,
            "type": "lab",

            "event":
                f"{lab['test']} recorded: "
                f"{lab['value']}{unit_text}"

        })

        # =========================================
# ACTIVE RISK FLAG GENERATION
# =========================================
def generate_risk_flags(entities, trend_analysis=None):

    risk_flags = []

    # =====================================
    # CONDITION-BASED RISKS
    # =====================================
    conditions = [
        c.lower()
        for c in entities.get("conditions", [])
    ]

    if "diabetes" in conditions:
        risk_flags.append(
            "Elevated metabolic risk associated with diabetes."
        )

    if "hypertension" in conditions:
        risk_flags.append(
            "Cardiovascular risk indicators detected."
        )

    if "infection" in conditions:
        risk_flags.append(
            "Active infectious condition detected."
        )

    if "bronchopneumonia" in conditions:
        risk_flags.append(
            "Respiratory complication risk identified."
        )

    if "asthma" in conditions:
        risk_flags.append(
            "Airway inflammation risk present."
        )

    # =====================================
    # LAB-BASED RISKS
    # =====================================
    for lab in entities.get("lab_values", []):

        test = lab["test"].lower()

        try:
            value = float(lab["value"])
        except:
            continue

        # Hemoglobin
        if test == "hemoglobin":

            if value < 12:
                risk_flags.append(
                    "Low hemoglobin levels may indicate anemia."
                )

        # Platelets
        elif test == "platelets":

            if value < 2:
                risk_flags.append(
                    "Low platelet count may increase bleeding risk."
                )

        # Glucose
        elif test == "glucose":

            if value > 140:
                risk_flags.append(
                    "Elevated glucose levels detected."
                )

        # Creatinine
        elif test == "creatinine":

            if value > 1.3:
                risk_flags.append(
                    "Possible renal function impairment detected."
                )

        # CRP
        elif test == "c-reactive protein":

            if value > 10:
                risk_flags.append(
                    "Inflammatory markers significantly elevated."
                )

    # =====================================
    # TREND-BASED RISKS
    # =====================================
    if trend_analysis:

        for test, trend in trend_analysis.items():

            if (
                test.lower() == "c-reactive protein"
                and trend == "Increasing Trend"
            ):

                risk_flags.append(
                    "Inflammatory progression trend observed."
                )

            if (
                test.lower() == "hemoglobin"
                and trend == "Decreasing Trend"
            ):

                risk_flags.append(
                    "Progressive decline in hemoglobin observed."
                )

    # Remove duplicates
    risk_flags = list(set(risk_flags))

    return risk_flags


# =========================================
# AI CLINICAL SUMMARY GENERATION
# =========================================
def generate_clinical_summary(
    entities,
    risk_flags,
    trend_analysis=None
):

    summary_parts = []

    conditions = entities.get("conditions", [])
    medications = entities.get("medications", [])
    labs = entities.get("lab_values", [])

    # =====================================
    # CONDITIONS SUMMARY
    # =====================================
    if conditions:

        summary_parts.append(

            "Patient history indicates " +
            ", ".join(conditions[:-1]) +
            (
                f" and {conditions[-1]}"
                if len(conditions) > 1
                else conditions[0]
            ) +
            "."

        )

    # =====================================
    # MEDICATION SUMMARY
    # =====================================
    if medications:

        summary_parts.append(

            "Current therapeutic management includes " +
            ", ".join(medications) +
            "."

        )

    # =====================================
    # LAB SUMMARY
    # =====================================
    abnormal_labs = []

    for lab in labs:

        test = lab["test"].lower()

        try:
            value = float(lab["value"])
        except:
            continue

        if test == "hemoglobin" and value < 12:
            abnormal_labs.append(
                "reduced hemoglobin levels"
            )

        elif test == "glucose" and value > 140:
            abnormal_labs.append(
                "elevated glucose levels"
            )

        elif test == "creatinine" and value > 1.3:
            abnormal_labs.append(
                "abnormal creatinine levels"
            )

        elif (
            test == "c-reactive protein"
            and value > 10
        ):
            abnormal_labs.append(
                "elevated inflammatory markers"
            )

    if abnormal_labs:

        summary_parts.append(

            "Laboratory analysis demonstrates " +
            ", ".join(abnormal_labs) +
            "."

        )

    # =====================================
    # TREND SUMMARY
    # =====================================
    if trend_analysis:

        trend_observations = []

        for test, trend in trend_analysis.items():

            if trend != "Stable":

                trend_observations.append(
                    f"{test} shows a {trend.lower()}"
                )

        if trend_observations:

            summary_parts.append(

                "Longitudinal trend analysis indicates that " +
                ", ".join(trend_observations) +
                "."

            )

    # =====================================
    # RISK SUMMARY
    # =====================================
    if risk_flags:

        summary_parts.append(

            "Clinical risk assessment identified " +
            f"{len(risk_flags)} active risk indicators."

        )

    # =====================================
    # FINAL RECOMMENDATION
    # =====================================
    summary_parts.append(

        "Continued longitudinal monitoring and clinical follow-up are recommended."

    )

    return " ".join(summary_parts)

    return timeline
from fastapi import FastAPI, UploadFile, File
from extractor import extract_text_from_pdf, extract_entities, generate_timeline
import shutil
import os

app = FastAPI()


@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    temp_file_path = f"temp_{file.filename}"

    # Save uploaded file temporarily
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text
    text = extract_text_from_pdf(temp_file_path)

    # Extract entities
    entities = extract_entities(text)

    # Generate timeline
    timeline = generate_timeline(entities)

    # Remove temp file
    os.remove(temp_file_path)

    return {
        "message": "Extraction successful",
        "entities": entities,
        "timeline": timeline
    }

import os
from google import genai
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

app = FastAPI(
    title="Gemini File Analysis API",
    description="Backend API for the Gemini File Analysis Web Application",
    version="1.0.0",
)

# React development server
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload configuration
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".csv"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


@app.get("/")
async def root():
    return {
        "message": "Gemini File Analysis API is running."
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY")),
    }


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was selected."
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Upload PDF, DOCX, TXT, or CSV files."
        )

    # Read at most 20 MB + 1 byte to detect oversized files
    contents = await file.read(MAX_FILE_SIZE + 1)

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File is too large. Maximum allowed size is 20 MB."
        )

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty."
        )

    return {
        "message": "File received successfully.",
        "filename": file.filename,
        "file_type": extension.lstrip(".").upper(),
        "size_bytes": len(contents),
        "size_kb": round(len(contents) / 1024, 2),
    }


import tempfile

from fastapi import Form


SYSTEM_INSTRUCTIONS = """
You are an AI research assistant that helps users understand documents.

Your responsibilities:
- Base your answers on the contents of the uploaded document.
- Do not invent facts or information that the document does not contain.
- Clearly distinguish facts from interpretations or inferences.
- Explain technical concepts in accessible language.
- Use clear headings and structured responses where appropriate.
- If information is missing, explicitly say so.
"""


ANALYSIS_PROMPTS = {
    "summarize": """
    Summarize the uploaded document.

    Include:
    - The main subject and purpose.
    - The most important points and findings.
    - Important conclusions.
    - Key figures or statistics where relevant.

    Organize the summary using clear headings.
    """,

    "explain": """
    Explain the uploaded document in clear, accessible language.

    Identify its main concepts, explain important terminology,
    and walk through complicated sections step by step.

    Use examples where they help clarify the document.
    """,

    "analyze": """
    Provide a detailed analysis of the uploaded document.

    Examine:
    - Main arguments and ideas.
    - Important findings and supporting evidence.
    - Strengths and weaknesses.
    - Patterns, trends, or relationships.
    - Conclusions and possible implications.

    Clearly distinguish the document's claims from your own
    interpretation.
    """,

    "question": """
    Study the uploaded document and answer the user's question.

    Base your answer on the document's contents.
    Do not invent facts or introduce unsupported information.
    If the document does not contain enough information to answer,
    clearly explain that.
    """,
    }


@app.post("/api/analyze")
async def analyze_document(
    file: UploadFile = File(...),
    mode: str = Form(...),
    question: str = Form(default="")
):
    if client is None:
        raise HTTPException(
            status_code=503,
            detail="Gemini API key is not configured."
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was selected."
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format."
        )

    if mode not in ANALYSIS_PROMPTS:
        raise HTTPException(
            status_code=400,
            detail="Invalid analysis mode."
        )

    contents = await file.read(MAX_FILE_SIZE + 1)

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File is too large. Maximum allowed size is 20 MB."
        )

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty."
        )

    uploaded_file = None

    try:
        # Gemini's Files API accepts a file path.
        # Use a temporary file so we don't permanently store uploads.
        with tempfile.NamedTemporaryFile(
            suffix=extension,
            delete=False
        ) as temp_file:
            temp_file.write(contents)
            temp_path = temp_file.name

        try:
            uploaded_file = client.files.upload(file=temp_path)

            prompt = ANALYSIS_PROMPTS[mode]

            if mode == "question":
                if question.strip():
                    prompt += f"\n\nUser's question:\n{question.strip()}"
                else:
                    prompt = """
                    Generate a useful set of questions and answers based on
                    the uploaded document.

                    Include factual questions, conceptual questions, and
                    questions requiring deeper understanding.

                    Base all answers on the document.
                    """

            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=[
                    uploaded_file,
                    prompt
                ],
                config={
                    "system_instruction": SYSTEM_INSTRUCTIONS
                }
            )

            return {
                "filename": file.filename,
                "mode": mode,
                "analysis": response.text
            }

        finally:
            # Remove the local temporary file.
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except HTTPException:
        raise

    except Exception as error:
        print(f"Gemini analysis error: {error}")

        raise HTTPException(
            status_code=500,
            detail="Document analysis failed. Please try again."
        )

    finally:
        # Delete the uploaded file from Gemini after processing.
        if uploaded_file is not None:
            try:
                client.files.delete(name=uploaded_file.name)
            except Exception as cleanup_error:
                print(f"Gemini file cleanup error: {cleanup_error}")

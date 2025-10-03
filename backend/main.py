from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy
import pdfplumber
from PyPDF2 import PdfReader
import io
from typing import List, Dict, Optional

# Load spaCy models
nlp_en = spacy.load('en_core_web_lg')
nlp_de = spacy.load('de_core_news_lg')

app = FastAPI()

class PDFExtractResponse(BaseModel):
    text: str
    error: Optional[str] = None
    method_used: str

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextRequest(BaseModel):
    text: str

class Entity(BaseModel):
    text: str
    label: str
    start: int
    end: int

class AnalysisResponse(BaseModel):
    entities: List[Entity]
    language: str
    tokens: List[str]
    noun_chunks: List[str]

def detect_language(text: str) -> str:
    # Use spaCy's language detection
    doc_en = nlp_en(text[:1000])  # Limit text for performance
    doc_de = nlp_de(text[:1000])
    
    # Compare confidence scores
    en_score = sum(token.prob for token in doc_en if token.prob != 0)
    de_score = sum(token.prob for token in doc_de if token.prob != 0)
    
    return "en" if en_score > de_score else "de"

@app.post("/analyze")
async def analyze_text(request: TextRequest) -> Dict:
    try:
        # Detect language and use appropriate model
        language = detect_language(request.text)
        nlp = nlp_en if language == "en" else nlp_de
        
        # Process text with spaCy
        doc = nlp(request.text)
        
        # Extract entities
        entities = [
            {
                "text": ent.text,
                "label": ent.label_,
                "start": ent.start_char,
                "end": ent.end_char
            }
            for ent in doc.ents
        ]
        
        # Extract tokens and noun chunks
        tokens = [token.text for token in doc]
        noun_chunks = [chunk.text for chunk in doc.noun_chunks]
        
        return {
            "entities": entities,
            "language": language,
            "tokens": tokens,
            "noun_chunks": noun_chunks
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-language")
async def detect_language_endpoint(request: TextRequest) -> Dict:
    try:
        language = detect_language(request.text)
        return {"language": language}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract-pdf", response_model=PDFExtractResponse)
async def extract_pdf(file: UploadFile = File(...)) -> Dict:
    try:
        content = await file.read()
        text = ""
        method_used = ""
        error = None

        # Try PyPDF2 first
        try:
            pdf = PdfReader(io.BytesIO(content))
            text = ""
            for page in pdf.pages:
                text += page.extract_text() + "\n"
            if text.strip():
                method_used = "PyPDF2"
                return {"text": text, "method_used": method_used, "error": None}
        except Exception as e:
            print(f"PyPDF2 extraction failed: {str(e)}")
            error = f"PyPDF2 error: {str(e)}"

        # Try pdfplumber if PyPDF2 fails
        if not text:
            try:
                with pdfplumber.open(io.BytesIO(content)) as pdf:
                    text = ""
                    for page in pdf.pages:
                        text += page.extract_text() + "\n"
                    if text.strip():
                        method_used = "pdfplumber"
                        return {"text": text, "method_used": method_used, "error": None}
            except Exception as e:
                print(f"pdfplumber extraction failed: {str(e)}")
                error = f"{error}\npdfplumber error: {str(e)}"

        if not text:
            raise HTTPException(
                status_code=422,
                detail=f"Failed to extract text from PDF using both methods. {error}"
            )

        return {"text": text, "method_used": method_used, "error": error}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

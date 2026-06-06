from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import parser

app = FastAPI(title="Resume Parser & Creator API")

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure the temp directory exists
TEMP_DIR = os.path.join(os.path.dirname(__file__), "temp")
os.makedirs(TEMP_DIR, exist_ok=True)

@app.post("/api/parse")
async def parse_resume(file: UploadFile = File(...)):
    """Upload a resume file (PDF, DOCX, TXT) and parse details using NLP."""
    filename = file.filename
    file_ext = os.path.splitext(filename)[1].lower()
    
    if file_ext not in [".pdf", ".docx", ".txt"]:
        raise HTTPException(
            status_code=400, 
            detail="Unsupported file extension. Only .pdf, .docx, and .txt files are allowed."
        )
        
    temp_file_path = os.path.join(TEMP_DIR, filename)
    
    # Save the file temporarily
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
    # Parse based on file type
    try:
        text = ""
        if file_ext == ".pdf":
            text = parser.extract_text_from_pdf(temp_file_path)
        elif file_ext == ".docx":
            text = parser.extract_text_from_docx(temp_file_path)
        elif file_ext == ".txt":
            with open(temp_file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
                
        if not text.strip():
            raise HTTPException(
                status_code=400, 
                detail="The file appears to be empty or text extraction failed."
            )
            
        parsed_data = parser.parse_resume_text(text)
        return parsed_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")
    finally:
        # Clean up temp file
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass

@app.get("/api/health")
def health_check():
    """Simple API health check endpoint."""
    return {"status": "healthy", "model": "en_core_web_sm"}

# Serve Frontend static files
# Place static folder check to prevent crash if running before folder creation
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(STATIC_DIR, exist_ok=True)

@app.get("/")
def read_root():
    """Serve the index.html landing page."""
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Welcome to Resume Parser API! Frontend static assets are not yet created."}

# Mount static files to serve style.css, app.js, images, etc.
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

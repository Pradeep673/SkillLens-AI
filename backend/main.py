import os
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi import Form
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from textcleaner import clean_text
from pdf_utils import extract_text_from_pdf
from skill_extractor import extract_skills
#from ner_model import extract_entities
from llm_model import (extract_resume_info , extract_jd_skills, analyze_match)
from skill_matching import calculate_match
import uuid
import shutil

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_SECRET_KEY
)


@app.get("/")
def home():
    return {"message": "ResumeMatch AI Backend"}


@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile,
    job_description : str = Form()
    ):
    
    print("JD received:", repr(job_description))
    print("JD length:", len(job_description))
    
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )
    
    resume_id = str(uuid.uuid4())
    
    file_path = f"{resume_id}/resume.pdf"
    
    file_data = await file.read()
    
    response = (
        supabase.storage
        .from_("resumes")
        .upload(
            path = file_path,
            file = file_data,
            file_options = {
                "content_type" : "application/pdf"
            }
        )
    )
    
    supabase.table("resumes").insert({
        "id" : resume_id,
        "file_name" : file.filename,
        "storage_path" : file_path,
    }).execute()
    
    print("Filename:", file.filename)
    print("Content type:", file.content_type)

    await file.seek(0)

    file_data = await file.read()

    print("File size:", len(file_data))

    if not file_data:
        raise HTTPException(
            status_code=400,
            detail="File data is empty"
        )

    resume_text = extract_text_from_pdf(file_data)
    
    cleaned_text = clean_text(resume_text)
    
    resume_info = extract_resume_info(cleaned_text)
    
    jd_info = extract_jd_skills(job_description)
    
    match_result = calculate_match(
        resume_info.skills,
        jd_info.skills
    )
    
    match_analysis = analyze_match(
    resume_skills=resume_info.skills,
    jd_skills=jd_info.skills,
    exact_matches=match_result["exact_matches"],
    related_matches=match_result["related_matches"],
    missing_skills=match_result["missing_skills"],
    match_percentage=match_result["match_percentage"],
    expertise=resume_info.expertise
    )
    
    return {
    "resume_id": resume_id,
    "file_name": file.filename,
    "storage_path": file_path,

    "raw_text_length": len(resume_text),
    "cleaned_text_length": len(cleaned_text),

    "resume_skills": resume_info.skills,
    "jd_skills": jd_info.skills,

    "expertise": resume_info.expertise,

    "exact_matches": match_result["exact_matches"],
    "related_matches": match_result["related_matches"],
    "missing_skills": match_result["missing_skills"],
    "match_percentage": match_result["match_percentage"],

    "analysis": match_analysis.model_dump(),

    "message": "Resume analyzed successfully"
}
    

    # if file.content_type != "application/pdf":
    #     raise HTTPException(
    #         status_code=400,
    #         detail="Only PDF files are allowed"
    #     )
        
    # shutil.copyfileobj(
    #     file.file,
    #     open(f"uploads/{file.filename}", "wb")
    # )

    # return {
    #     "filename": file.filename,
    #     "content_type": file.content_type
    # }
    
@app.get("/test-supabase")
def test_supabase():
    return {
        "supabase_url_loaded" : bool(SUPABASE_URL),
        "supabase_secret_key_loaded" : bool(SUPABASE_SECRET_KEY),
        "message" : "Supabase client created successfully"
    }
    
@app.post("/test-upload-resume")
async def upload_resume(file: UploadFile):

    print("Filename:", file.filename)
    print("Content type:", file.content_type)

    await file.seek(0)

    file_data = await file.read()

    print("File size:", len(file_data))

    if not file_data:
        raise HTTPException(
            status_code=400,
            detail="File data is empty"
        )

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "file_size": len(file_data),
        "message": "File received successfully"
    }
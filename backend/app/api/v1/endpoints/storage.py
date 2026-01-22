from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.storage import minio_handler

router = APIRouter()

@router.post("/upload", response_model=dict)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a file to object storage and get the public URL.
    allowed mime types: image/*, video/*, application/pdf
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file sent")
        
    # Basic validation (optional)
    if not (file.content_type.startswith("image/") or 
            file.content_type.startswith("video/") or 
            file.content_type == "application/pdf"):
         raise HTTPException(status_code=400, detail="Invalid file type")

    try:
        url = minio_handler.upload_file(file.file, file.filename, file.content_type)
        return {"url": url, "filename": file.filename}
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Could not upload file: {str(e)}")

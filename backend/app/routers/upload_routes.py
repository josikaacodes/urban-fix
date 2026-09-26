import os
import uuid
import aiofiles
from fastapi import APIRouter, UploadFile, File, HTTPException
from ..config import UPLOAD_DIR

router = APIRouter()

ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.webm', '.mov'}
ALLOWED_AUDIO_EXTENSIONS = {'.mp3', '.wav', '.webm', '.ogg', '.m4a'}

@router.post("/media")
async def upload_media(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    all_allowed = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS | ALLOWED_AUDIO_EXTENSIONS
    if ext not in all_allowed:
        raise HTTPException(status_code=400, detail=f"File extension {ext} not allowed.")
        
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
        
    # Return local accessible URL
    return {
        "url": f"/uploads/{filename}",
        "filename": file.filename,
        "size": len(content)
    }

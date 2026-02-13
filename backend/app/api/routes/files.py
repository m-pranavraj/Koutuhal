from typing import Any, Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.api import deps
from app.services.storage import storage_service
from app.models.file import UploadedFile
from app.models.user import User
from app.schemas.file import UploadedFileOut
from app.core.database import get_db
import uuid

router = APIRouter()

@router.get("/", response_model=List[UploadedFileOut])
async def list_files(
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    List user's uploaded files.
    """
    result = await db.execute(
        select(UploadedFile)
        .where(UploadedFile.user_id == current_user.id)
        .order_by(desc(UploadedFile.created_at))
        .offset(skip)
        .limit(limit)
    )
    files = result.scalars().all()
    
    # Generate signed URLs
    file_responses = []
    for file in files:
        # Create a copy or dict to populate signed_url
        # Since we are returning Pydantic models, we can construct them
        url = storage_service.generate_signed_url(file.bucket_path)
        
        file_responses.append(UploadedFileOut(
            id=file.id,
            original_filename=file.original_filename,
            content_type=file.content_type,
            size_bytes=file.size_bytes,
            signed_url=url,
            created_at=file.created_at
        ))
        
    return file_responses

@router.get("/{id}", response_model=UploadedFileOut)
async def get_file(
    id: uuid.UUID,
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """
    Get file metadata.
    """
    result = await db.execute(select(UploadedFile).where(UploadedFile.id == id))
    file = result.scalars().first()
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
        
    if file.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Generate signed URL
    url = storage_service.generate_signed_url(file.bucket_path)
    
    return UploadedFileOut(
        id=file.id,
        original_filename=file.original_filename,
        content_type=file.content_type,
        size_bytes=file.size_bytes,
        signed_url=url,
        created_at=file.created_at
    )

@router.delete("/{id}", response_model=UploadedFileOut)
async def delete_file(
    id: uuid.UUID,
    current_user: Annotated[User, Depends(deps.get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Any:
    """
    Delete file from storage and database.
    """
    result = await db.execute(select(UploadedFile).where(UploadedFile.id == id))
    file = result.scalars().first()
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
        
    if file.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Delete from GCS
    success = await storage_service.delete_file(file.bucket_path)
    if not success:
         # Depending on strictness, we might still delete DB record or raise error. 
         # For now, we'll log (print) and proceed to delete DB record to avoid orphans.
         print(f"Failed to delete file from GCS: {file.bucket_path}")

    # Delete from DB
    await db.delete(file)
    await db.commit()
    
    # For delete response, we can return null signed_url
    return UploadedFileOut(
        id=file.id,
        original_filename=file.original_filename,
        content_type=file.content_type,
        size_bytes=file.size_bytes,
        signed_url=None,
        created_at=file.created_at
    )

@router.get("/download/{bucket_path}")
async def download_file_locally(
    bucket_path: str,
    # In a real app, we might want auth here, but for demonstration we'll make it simple
    # current_user: Annotated[User, Depends(deps.get_current_user)],
):
    """
    Serve local files from storage.
    """
    from app.core.config import settings
    import os
    
    file_path = os.path.join(settings.LOCAL_STORAGE_PATH, bucket_path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(file_path)

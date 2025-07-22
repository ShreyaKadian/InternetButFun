# news.py
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional
from app import get_current_user, db

router = APIRouter()

# Pydantic Schemas
class NewsModel(BaseModel):
    title: str
    content: str
    url: Optional[str] = None
    author: str

# Create news (admin-only, manual entry)
@router.post("/news")
async def create_news(news: NewsModel, user=Depends(get_current_user)):
    try:
        # Optionally, add admin check here if only specific users can create news
        news_data = {
            "title": news.title,
            "content": news.content,
            "url": news.url or "",
            "author": news.author,
            "date": datetime.utcnow()
        }
        
        result = await db.News.insert_one(news_data)
        return {"message": "News created", "news_id": str(result.inserted_id)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create news: {str(e)}")

# Get all news with pagination
@router.get("/news")
async def get_all_news(page: int = 1, limit: int = 10, user=Depends(get_current_user)):
    try:
        skip = (page - 1) * limit
        news = await db.News.find().sort("date", -1).skip(skip).limit(limit).to_list(limit)
        
        for item in news:
            item["_id"] = str(item["_id"])
            
        return news
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch news: {str(e)}")

# Delete news (admin-only, optional)
@router.delete("/news/{news_id}")
async def delete_news(news_id: str, user=Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(news_id):
            raise HTTPException(status_code=400, detail="Invalid news ID")
            
        # Optionally, add admin check here
        news = await db.News.find_one({"_id": ObjectId(news_id)})
        if not news:
            raise HTTPException(status_code=404, detail="News not found")
            
        await db.News.delete_one({"_id": ObjectId(news_id)})
        return {"message": "News deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete news: {str(e)}")
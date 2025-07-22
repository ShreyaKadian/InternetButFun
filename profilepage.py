from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
from app import get_current_user, db

router = APIRouter()

# Pydantic Schemas
class SocialLinks(BaseModel):
    spotify: Optional[str] = ""
    letterboxd: Optional[str] = ""
    discord: Optional[str] = ""
    instagram: Optional[str] = ""
    twitter: Optional[str] = ""
    website: Optional[str] = ""

class YapTopic(BaseModel):
    name: Optional[str] = ""
    description: Optional[str] = ""

class ProfileData(BaseModel):
    username: str
    aboutyou: str
    likes: List[str]
    imageUrl: Optional[str] = None
    mood: Optional[str] = ""
    status: Optional[str] = ""
    socialLinks: Optional[SocialLinks] = None
    age: Optional[str] = ""
    title: Optional[str] = ""
    location: Optional[str] = ""
    yapTopics: Optional[Dict[str, YapTopic]] = None

@router.get("/profile/{username}")
async def get_user_profile_by_username(username: str, user=Depends(get_current_user)):
    try:
        user_data = await db.Users.find_one({"username": username})
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Determine if the logged-in user can edit this profile
        can_edit = user_data.get("firebase_uid") == user["uid"] if user else False
        
        # Remove sensitive fields
        user_data.pop("_id", None)
        user_data.pop("firebase_uid", None)
        
        # Add canEdit flag
        user_data["canEdit"] = can_edit
        
        return user_data
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}")

@router.get("/profile/{username}/posts")
async def get_user_posts(username: str):
    try:
        user_data = await db.Users.find_one({"username": username})
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        posts = await db.Posts.find({"user_id": user_data["firebase_uid"]}).sort("created_at", -1).to_list(100)
        
        for post in posts:
            post["_id"] = str(post["_id"])
            post["like_count"] = len(post.get("likes", []))
            post["save_count"] = len(post.get("saves", []))
            post["comment_count"] = len(post.get("comments", []))
        
        return posts
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user posts: {str(e)}")

@router.put("/profile/{username}")
async def update_user_profile(username: str, profile_data: ProfileData, user=Depends(get_current_user)):
    try:
        existing_user = await db.Users.find_one({"username": username})
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if existing_user["firebase_uid"] != user["uid"]:
            raise HTTPException(status_code=403, detail="You can only edit your own profile")
        
        if profile_data.username != username:
            username_taken = await db.Users.find_one({
                "username": profile_data.username,
                "firebase_uid": {"$ne": user["uid"]}
            })
            if username_taken:
                raise HTTPException(status_code=400, detail="Username already taken")
        
        update_data = {
            "username": profile_data.username,
            "aboutyou": profile_data.aboutyou,
            "likes": profile_data.likes,
            "mood": profile_data.mood,
            "status": profile_data.status,
            "socialLinks": profile_data.socialLinks.dict() if profile_data.socialLinks else {},
            "age": profile_data.age,
            "title": profile_data.title,
            "location": profile_data.location,
            "yapTopics": {k: v.dict() for k, v in profile_data.yapTopics.items()} if profile_data.yapTopics else {},
            "updatedAt": datetime.utcnow()
        }
        
        if profile_data.imageUrl and profile_data.imageUrl != 'https://via.placeholder.com/300x200?text=Click+to+Upload+Image':
            update_data["imageUrl"] = profile_data.imageUrl
        
        await db.Users.update_one(
            {"firebase_uid": user["uid"]},
            {"$set": update_data}
        )
        
        return {"message": "Profile updated successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")
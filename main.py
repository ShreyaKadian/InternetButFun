from fastapi import Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app import app, get_current_user, db
from posts import router as post_router
from chat import create_chat_router
from updates import router as update_router
from profilepage import router as profile_router  
from news import router as news_router 
app.include_router(news_router)  
app.include_router(post_router)
app.include_router(create_chat_router(db))
app.include_router(update_router)
app.include_router(profile_router)  

class ProfileData(BaseModel):
    username: str
    aboutyou: str
    likes: List[str]
    imageUrl: Optional[str] = None

@app.get("/ping")
def ping():
    return {"message": "pong"}


@app.post("/Auth")
async def register_user(user=Depends(get_current_user)):
    try:
        firebase_uid = user["uid"]
        email = user["email"]
        print(f"Attempting to register user: {email} with UID: {firebase_uid}")

        existing = await db.Users.find_one({"firebase_uid": firebase_uid})
        if existing:
            print(f"User already exists: {email}")
            return {"message": "User already exists", "profile_complete": existing.get("profile_complete", False)}

        user_data = {
            "firebase_uid": firebase_uid,
            "email": email,
            "profile_complete": False,
            "createdAt": datetime.utcnow()
        }
        print(f"Inserting user data: {user_data}")
        result = await db.Users.insert_one(user_data)
        print(f"Insert result: {result.inserted_id}")

        return {"message": "User registered", "profile_complete": False}
    except Exception as e:
        print(f"Error in register_user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/complete-profile")
async def complete_profile(profile_data: ProfileData, user=Depends(get_current_user)):
    firebase_uid = user["uid"]
    
    existing_user = await db.Users.find_one({"firebase_uid": firebase_uid})
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found. Please register first.")
    
    username_taken = await db.Users.find_one({
        "username": profile_data.username,
        "firebase_uid": {"$ne": firebase_uid}
    })
    if username_taken:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    update_data = {
        "username": profile_data.username,
        "aboutyou": profile_data.aboutyou,
        "likes": profile_data.likes,
        "profile_complete": True,
        "profileCompletedAt": datetime.utcnow()
    }
    
    if profile_data.imageUrl and profile_data.imageUrl != 'https://via.placeholder.com/300x200?text=Click+to+Upload+Image':
        update_data["imageUrl"] = profile_data.imageUrl
    
    await db.Users.update_one(
        {"firebase_uid": firebase_uid},
        {"$set": update_data}
    )
    
    return {"message": "Profile completed successfully"}

@app.get("/profile")
async def get_user_profile(user=Depends(get_current_user)):
    firebase_uid = user["uid"]
    
    user_data = await db.Users.find_one({"firebase_uid": firebase_uid})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data.pop("_id", None)
    user_data.pop("firebase_uid", None)
    
    return user_data

@app.put("/profile")
async def update_user_profile(profile_data: ProfileData, user=Depends(get_current_user)):
    firebase_uid = user["uid"]
    
    existing_user = await db.Users.find_one({"firebase_uid": firebase_uid})
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if profile_data.username != existing_user.get("username"):
        username_taken = await db.Users.find_one({
            "username": profile_data.username,
            "firebase_uid": {"$ne": firebase_uid}
        })
        if username_taken:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    update_data = {
        "username": profile_data.username,
        "aboutyou": profile_data.aboutyou,
        "likes": profile_data.likes,
        "updatedAt": datetime.utcnow()
    }
    
    if profile_data.imageUrl and profile_data.imageUrl != 'https://via.placeholder.com/300x200?text=Click+to+Upload+Image':
        update_data["imageUrl"] = profile_data.imageUrl
    
    await db.Users.update_one(
        {"firebase_uid": firebase_uid},
        {"$set": update_data}
    )
    
    return {"message": "Profile updated successfully"}

@app.get("/check-username/{username}")
async def check_username_availability(username: str, user=Depends(get_current_user)):
    firebase_uid = user["uid"]
    
    existing = await db.Users.find_one({
        "username": username,
        "firebase_uid": {"$ne": firebase_uid}
    })
    
    return {"available": existing is None}

@app.get("/debug/users")
async def get_all_users():
    users = await db.Users.find().to_list(100)
    for user in users:
        user["_id"] = str(user["_id"])
    return {"users": users, "count": len(users)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
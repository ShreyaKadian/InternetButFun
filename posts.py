from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional
from app import get_current_user, db

router = APIRouter()

class PostModel(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None

class CommentModel(BaseModel):
    content: str

async def get_user_profile(firebase_uid: str):
    """Get user profile including username"""
    user_data = await db.Users.find_one({"firebase_uid": firebase_uid})
    if not user_data:
        raise HTTPException(status_code=404, detail="User profile not found")
    return user_data

@router.post("/posts")
async def create_post(post: PostModel, user=Depends(get_current_user)):
    try:
        user_profile = await get_user_profile(user["uid"])
        username = user_profile.get("username", user["email"])
        
        post_data = {
            "user_id": user["uid"],
            "username": username,
            "title": post.title,
            "content": post.content,
            "image_url": post.image_url or "",
            "created_at": datetime.utcnow(),
            "likes": [],
            "saves": [],
            "comments": []
        }
        
        result = await db.Posts.insert_one(post_data)
        return {"message": "Post created", "post_id": str(result.inserted_id)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create post: {str(e)}")

@router.get("/posts")
async def get_all_posts(user=Depends(get_current_user)):
    try:
        posts = await db.Posts.find().sort("created_at", -1).to_list(100)
        
        for post in posts:
            post["_id"] = str(post["_id"])
            post["liked"] = user["uid"] in post.get("likes", [])
            post["saved"] = user["uid"] in post.get("saves", [])
            post["like_count"] = len(post.get("likes", []))
            post["save_count"] = len(post.get("saves", []))
            post["comment_count"] = len(post.get("comments", []))
            
        return posts
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch posts: {str(e)}")

@router.get("/my-posts")
async def get_my_posts(user=Depends(get_current_user)):
    try:
        posts = await db.Posts.find({"user_id": user["uid"]}).sort("created_at", -1).to_list(100)
        
        for post in posts:
            post["_id"] = str(post["_id"])
            post["like_count"] = len(post.get("likes", []))
            post["save_count"] = len(post.get("saves", []))
            post["comment_count"] = len(post.get("comments", []))
            
        return posts
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user posts: {str(e)}")

@router.get("/posts/{post_id}")
async def get_post(post_id: str, user=Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(status_code=400, detail="Invalid post ID")
            
        post = await db.Posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
            
        post["_id"] = str(post["_id"])
        post["liked"] = user["uid"] in post.get("likes", [])
        post["saved"] = user["uid"] in post.get("saves", [])
        post["like_count"] = len(post.get("likes", []))
        post["save_count"] = len(post.get("saves", []))
        post["comment_count"] = len(post.get("comments", []))
        
        return post
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch post: {str(e)}")

@router.delete("/posts/{post_id}")
async def delete_post(post_id: str, user=Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(status_code=400, detail="Invalid post ID")
            
        post = await db.Posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
            
        if post["user_id"] != user["uid"]:
            raise HTTPException(status_code=403, detail="You can only delete your own posts")
            
        await db.Posts.delete_one({"_id": ObjectId(post_id)})
        
        await db.Users.update_many(
            {},
            {"$pull": {"liked_posts": ObjectId(post_id), "saved_posts": ObjectId(post_id)}}
        )
        
        return {"message": "Post deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete post: {str(e)}")

@router.post("/posts/{post_id}/like")
async def like_post(post_id: str, user=Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(status_code=400, detail="Invalid post ID")
            
        post = await db.Posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
            
        await db.Posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$addToSet": {"likes": user["uid"]}}
        )
        
        await db.Users.update_one(
            {"firebase_uid": user["uid"]},
            {"$addToSet": {"liked_posts": ObjectId(post_id)}}
        )
        
        return {"message": "Post liked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to like post: {str(e)}")

@router.post("/posts/{post_id}/unlike")
async def unlike_post(post_id: str, user=Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(status_code=400, detail="Invalid post ID")
            
        await db.Posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$pull": {"likes": user["uid"]}}
        )
        
        await db.Users.update_one(
            {"firebase_uid": user["uid"]},
            {"$pull": {"liked_posts": ObjectId(post_id)}}
        )
        
        return {"message": "Post unliked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unlike post: {str(e)}")

@router.post("/posts/{post_id}/save")
async def save_post(post_id: str, user=Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(status_code=400, detail="Invalid post ID")
            
        post = await db.Posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
            
        await db.Posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$addToSet": {"saves": user["uid"]}}
        )
        
        await db.Users.update_one(
            {"firebase_uid": user["uid"]},
            {"$addToSet": {"saved_posts": ObjectId(post_id)}}
        )
        
        return {"message": "Post saved successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save post: {str(e)}")

@router.post("/posts/{post_id}/unsave")
async def unsave_post(post_id: str, user=Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(status_code=400, detail="Invalid post ID")
            
        await db.Posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$pull": {"saves": user["uid"]}}
        )
        
        await db.Users.update_one(
            {"firebase_uid": user["uid"]},
            {"$pull": {"saved_posts": ObjectId(post_id)}}
        )
        
        return {"message": "Post unsaved successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unsave post: {str(e)}")

@router.post("/posts/{post_id}/comment")
async def comment_post(post_id: str, comment: CommentModel, user=Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(status_code=400, detail="Invalid post ID")
            
        post = await db.Posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
            
        user_profile = await get_user_profile(user["uid"])
        username = user_profile.get("username", user["email"])
        
        comment_data = {
            "comment_id": str(ObjectId()),  
            "user_id": user["uid"],
            "username": username,
            "content": comment.content,
            "timestamp": datetime.utcnow()
        }
        
        await db.Posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$push": {"comments": comment_data}}
        )
        
        return {"message": "Comment added successfully", "comment": comment_data}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add comment: {str(e)}")

@router.get("/posts/{post_id}/comments")
async def get_post_comments(post_id: str, user=Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(status_code=400, detail="Invalid post ID")
            
        post = await db.Posts.find_one({"_id": ObjectId(post_id)}, {"comments": 1})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
            
        comments = post.get("comments", [])
        
        comments.sort(key=lambda x: x.get("timestamp", datetime.min), reverse=True)
        
        return {"comments": comments}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch comments: {str(e)}")

@router.get("/my-liked-posts")
async def get_my_liked_posts(user=Depends(get_current_user)):
    try:
        user_data = await db.Users.find_one({"firebase_uid": user["uid"]})
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
            
        liked_post_ids = user_data.get("liked_posts", [])
        
        if not liked_post_ids:
            return []
            
        posts = await db.Posts.find({"_id": {"$in": liked_post_ids}}).sort("created_at", -1).to_list(100)
        
        for post in posts:
            post["_id"] = str(post["_id"])
            post["liked"] = True 
            post["saved"] = user["uid"] in post.get("saves", [])
            post["like_count"] = len(post.get("likes", []))
            post["save_count"] = len(post.get("saves", []))
            post["comment_count"] = len(post.get("comments", []))
            
        return posts
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch liked posts: {str(e)}")

@router.get("/my-saved-posts")
async def get_my_saved_posts(user=Depends(get_current_user)):
    try:
        user_data = await db.Users.find_one({"firebase_uid": user["uid"]})
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
            
        saved_post_ids = user_data.get("saved_posts", [])
        
        if not saved_post_ids:
            return []
            
        posts = await db.Posts.find({"_id": {"$in": saved_post_ids}}).sort("created_at", -1).to_list(100)
        
        for post in posts:
            post["_id"] = str(post["_id"])
            post["liked"] = user["uid"] in post.get("likes", [])
            post["saved"] = True  # Obviously true since these are saved posts
            post["like_count"] = len(post.get("likes", []))
            post["save_count"] = len(post.get("saves", []))
            post["comment_count"] = len(post.get("comments", []))
            
        return posts
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch saved posts: {str(e)}")
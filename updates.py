from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from app import get_current_user, db

router = APIRouter()

class UpdateModel(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None

class CommentModel(BaseModel):
    content: str

async def get_user_profile(firebase_uid: str):
    user_data = await db.Users.find_one({"firebase_uid": firebase_uid})
    if not user_data:
        raise HTTPException(status_code=404, detail="User profile not found")
    return user_data


@router.post("/add_updates")  
async def create_update(update: UpdateModel, user=Depends(get_current_user)):
    try:
        user_profile = await get_user_profile(user["uid"])
        username = user_profile.get("username", user["email"])

        update_data = {
            "user_id": user["uid"],
            "username": username,
            "title": update.title,
            "content": update.content,
            "image_url": update.image_url or "",
            "created_at": datetime.utcnow(),
            "likes": [],
            "saves": [],
            "comments": []
        }

        result = await db.Updates.insert_one(update_data)
        return {"message": "Update created", "update_id": str(result.inserted_id)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create update: {str(e)}")

@router.get("/blog")
async def get_all_updates(user=Depends(get_current_user), page: int = 1, limit: int = 10):
    try:
        skip = (page - 1) * limit
        updates = await db.Updates.find().sort("created_at", -1).skip(skip).limit(limit).to_list(limit)

        for update in updates:
            update["_id"] = str(update["_id"])
            update["liked"] = user["uid"] in update.get("likes", [])
            update["saved"] = user["uid"] in update.get("saves", [])
            update["like_count"] = len(update.get("likes", []))
            update["save_count"] = len(update.get("saves", []))
            update["comment_count"] = len(update.get("comments", []))

        return updates

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch updates: {str(e)}")

@router.get("/my-updates")
async def get_my_updates(user=Depends(get_current_user)):
    try:
        updates = await db.Updates.find({"user_id": user["uid"]}).sort("created_at", -1).to_list(100)

        for update in updates:
            update["_id"] = str(update["_id"])
            update["like_count"] = len(update.get("likes", []))
            update["save_count"] = len(update.get("saves", []))
            update["comment_count"] = len(update.get("comments", []))

        return updates

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user updates: {str(e)}")

@router.get("/updates/{update_id}")
async def get_update(update_id: str, user=Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(update_id):
            raise HTTPException(status_code=400, detail="Invalid update ID")

        update = await db.Updates.find_one({"_id": ObjectId(update_id)})
        if not update:
            raise HTTPException(status_code=404, detail="Update not found")

        update["_id"] = str(update["_id"])
        update["liked"] = user["uid"] in update.get("likes", [])
        update["saved"] = user["uid"] in update.get("saves", [])
        update["like_count"] = len(update.get("likes", []))
        update["save_count"] = len(update.get("saves", []))
        update["comment_count"] = len(update.get("comments", []))

        return update

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch update: {str(e)}")

@router.delete("/updates/{update_id}")
async def delete_update(update_id: str, user=Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(update_id):
            raise HTTPException(status_code=400, detail="Invalid update ID")

        update = await db.Updates.find_one({"_id": ObjectId(update_id)})
        if not update:
            raise HTTPException(status_code=404, detail="Update not found")

        if update["user_id"] != user["uid"]:
            raise HTTPException(status_code=403, detail="You can only delete your own updates")

        await db.Updates.delete_one({"_id": ObjectId(update_id)})

        await db.Users.update_many(
            {},
            {"$pull": {"liked_updates": ObjectId(update_id), "saved_updates": ObjectId(update_id)}}
        )

        return {"message": "Update deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete update: {str(e)}")


@router.post("/updates/{update_id}/like")
async def like_update(update_id: str, user=Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(update_id):
            raise HTTPException(status_code=400, detail="Invalid update ID")

        update = await db.Updates.find_one({"_id": ObjectId(update_id)})
        if not update:
            raise HTTPException(status_code=404, detail="Update not found")

        await db.Updates.update_one(
            {"_id": ObjectId(update_id)},
            {"$addToSet": {"likes": user["uid"]}}
        )

        await db.Users.update_one(
            {"firebase_uid": user["uid"]},
            {"$addToSet": {"liked_updates": ObjectId(update_id)}}
        )

        return {"message": "Update liked successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to like update: {str(e)}")

@router.post("/updates/{update_id}/unlike")
async def unlike_update(update_id: str, user=Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(update_id):
            raise HTTPException(status_code=400, detail="Invalid update ID")

        await db.Updates.update_one(
            {"_id": ObjectId(update_id)},
            {"$pull": {"likes": user["uid"]}}
        )

        await db.Users.update_one(
            {"firebase_uid": user["uid"]},
            {"$pull": {"liked_updates": ObjectId(update_id)}}
        )

        return {"message": "Update unliked successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unlike update: {str(e)}")

@router.post("/updates/{update_id}/save")
async def save_update(update_id: str, user=Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(update_id):
            raise HTTPException(status_code=400, detail="Invalid update ID")

        update = await db.Updates.find_one({"_id": ObjectId(update_id)})
        if not update:
            raise HTTPException(status_code=404, detail="Update not found")

        await db.Updates.update_one(
            {"_id": ObjectId(update_id)},
            {"$addToSet": {"saves": user["uid"]}}
        )

        await db.Users.update_one(
            {"firebase_uid": user["uid"]},
            {"$addToSet": {"saved_updates": ObjectId(update_id)}}
        )

        return {"message": "Update saved successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save update: {str(e)}")

@router.post("/updates/{update_id}/unsave")
async def unsave_update(update_id: str, user=Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(update_id):
            raise HTTPException(status_code=400, detail="Invalid update ID")

        await db.Updates.update_one(
            {"_id": ObjectId(update_id)},
            {"$pull": {"saves": user["uid"]}}
        )

        await db.Users.update_one(
            {"firebase_uid": user["uid"]},
            {"$pull": {"saved_updates": ObjectId(update_id)}}
        )

        return {"message": "Update unsaved successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unsave update: {str(e)}")

@router.post("/updates/{update_id}/comment")
async def comment_update(update_id: str, comment: CommentModel, user=Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(update_id):
            raise HTTPException(status_code=400, detail="Invalid update ID")

        update = await db.Updates.find_one({"_id": ObjectId(update_id)})
        if not update:
            raise HTTPException(status_code=404, detail="Update not found")

        user_profile = await get_user_profile(user["uid"])
        username = user_profile.get("username", user["email"])

        comment_data = {
            "comment_id": str(ObjectId()),
            "user_id": user["uid"],
            "username": username,
            "content": comment.content,
            "timestamp": datetime.utcnow()
        }

        await db.Updates.update_one(
            {"_id": ObjectId(update_id)},
            {"$push": {"comments": comment_data}}
        )

        return {"message": "Comment added successfully", "comment": comment_data}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add comment: {str(e)}")

@router.get("/updates/{update_id}/comments")
async def get_update_comments(update_id: str, user=Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(update_id):
            raise HTTPException(status_code=400, detail="Invalid update ID")

        update = await db.Updates.find_one({"_id": ObjectId(update_id)}, {"comments": 1})
        if not update:
            raise HTTPException(status_code=404, detail="Update not found")

        comments = update.get("comments", [])
        comments.sort(key=lambda x: x.get("timestamp", datetime.min), reverse=True)

        return {"comments": comments}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch comments: {str(e)}")


@router.get("/my-liked-updates")
async def get_my_liked_updates(user=Depends(get_current_user)):
    try:
        user_data = await db.Users.find_one({"firebase_uid": user["uid"]})
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        liked_update_ids = user_data.get("liked_updates", [])
        if not liked_update_ids:
            return []

        updates = await db.Updates.find({"_id": {"$in": liked_update_ids}}).sort("created_at", -1).to_list(100)

        for update in updates:
            update["_id"] = str(update["_id"])
            update["liked"] = True
            update["saved"] = user["uid"] in update.get("saves", [])
            update["like_count"] = len(update.get("likes", []))
            update["save_count"] = len(update.get("saves", []))
            update["comment_count"] = len(update.get("comments", []))

        return updates

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch liked updates: {str(e)}")

@router.get("/my-saved-updates")
async def get_my_saved_updates(user=Depends(get_current_user)):
    try:
        user_data = await db.Users.find_one({"firebase_uid": user["uid"]})
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        saved_update_ids = user_data.get("saved_updates", [])
        if not saved_update_ids:
            return []

        updates = await db.Updates.find({"_id": {"$in": saved_update_ids}}).sort("created_at", -1).to_list(100)

        for update in updates:
            update["_id"] = str(update["_id"])
            update["liked"] = user["uid"] in update.get("likes", [])
            update["saved"] = True
            update["like_count"] = len(update.get("likes", []))
            update["save_count"] = len(update.get("saves", []))
            update["comment_count"] = len(update.get("comments", []))

        return updates

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch saved updates: {str(e)}")
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Optional
from pydantic import BaseModel
from datetime import datetime
import json
from app import get_current_user, db
from firebase_admin import auth as firebase_auth

def create_chat_router(db):
    router = APIRouter()

    class ChatMessage(BaseModel):
        content: str
        sender_id: str
        username: str
        timestamp: datetime
        imageUrl: Optional[str] = None

    class ConnectionManager:
        def __init__(self):
            self.active_connections: Dict[str, WebSocket] = {}

        async def connect(self, websocket: WebSocket, user_id: str):
            await websocket.accept()
            self.active_connections[user_id] = websocket

        def disconnect(self, user_id: str):
            self.active_connections.pop(user_id, None)

        async def broadcast(self, message: dict):
            for connection in self.active_connections.values():
                await connection.send_json(message)

    manager = ConnectionManager()

    @router.websocket("/chat")
    async def websocket_chat(websocket: WebSocket, token: str):
        try:
            token = token.replace("Bearer ", "")
            user = firebase_auth.verify_id_token(token, clock_skew_seconds=60)
            user_id = user["uid"]
            email = user.get("email", "unknown")
            print(f"WebSocket: Verifying user {email} with UID {user_id}")
            
            # Check if user exists, auto-register if not
            user_data = await db.Users.find_one({"firebase_uid": user_id})
            if not user_data:
                print(f"User {email} not found, auto-registering")
                user_data = {
                    "firebase_uid": user_id,
                    "email": email,
                    "profile_complete": False,
                    "createdAt": datetime.utcnow()
                }
                await db.Users.insert_one(user_data)
                username = "Anonymous"
                image_url = None
            else:
                username = user_data.get("username", "Anonymous")
                image_url = user_data.get("imageUrl", None)
            print(f"WebSocket: User {username} (UID: {user_id}) authenticated")
        
        except Exception as e:
            print(f"WebSocket: Token verification failed: {str(e)}")
            await websocket.close(code=4001, reason=f"Invalid token: {str(e)}")
            return

        await manager.connect(websocket, user_id)
        try:
            recent_messages = await db.Messages.find().sort("timestamp", -1).limit(50).to_list(50)
            recent_messages.reverse()
            for msg in recent_messages:
                await websocket.send_json({
                    "type": "message",
                    "content": msg["content"],
                    "sender_id": msg["sender_id"],
                    "username": msg["username"],
                    "timestamp": msg["timestamp"].isoformat(),
                    "imageUrl": msg.get("imageUrl", None)
                })

            while True:
                data = await websocket.receive_json()
                if data.get("type") != "message":
                    continue

                content = data.get("content", "").strip()
                if not content:
                    continue

                message = {
                    "content": content,
                    "sender_id": user_id,
                    "username": username,
                    "timestamp": datetime.utcnow(),
                    "imageUrl": image_url
                }
                await db.Messages.insert_one(message)

                await manager.broadcast({
                    "type": "message",
                    "content": content,
                    "sender_id": user_id,
                    "username": username,
                    "timestamp": message["timestamp"].isoformat(),
                    "imageUrl": image_url
                })

        except WebSocketDisconnect:
            manager.disconnect(user_id)
        except Exception as e:
            print(f"WebSocket: Error for user {username}: {str(e)}")
            manager.disconnect(user_id)
            await websocket.close(code=4000, reason=str(e))

    return router
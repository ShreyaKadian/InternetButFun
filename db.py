from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.getenv("MONGODB_URI", "mongodb://localhost:27017")  
client = AsyncIOMotorClient(MONGO_URL)
db = client["internetButFun_db"]
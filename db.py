from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://localhost:27017"  # default local MongoDB
client = AsyncIOMotorClient(MONGO_URL)
db = client["internetButFun_db"]  # your DB name

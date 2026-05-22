import os
from motor.motor_asyncio import AsyncIOMotorClient

client: AsyncIOMotorClient = None
db = None
_is_connected = False

async def connect_database():
    global client, db, _is_connected
    uri = os.getenv("MONGODB_URI")
    if not uri:
        print("⚠️  No MONGODB_URI found - using in-memory storage")
        return
    try:
        client = AsyncIOMotorClient(uri)
        await client.admin.command("ping")
        db = client.get_default_database() or client["interview-app"]
        _is_connected = True
        print("✅ MongoDB connected successfully")
    except Exception as e:
        print(f"❌ MongoDB connection error: {e}")
        print("⚠️  Falling back to in-memory storage")

def is_mongodb_connected() -> bool:
    return _is_connected

def get_db():
    return db

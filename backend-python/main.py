from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_database, is_mongodb_connected
from routes import auth, api

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_database()
    yield

app = FastAPI(title="AI Interview Platform API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(api.router, prefix="/api", tags=["Interview"])

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "database": "MongoDB" if is_mongodb_connected() else "In-Memory",
    }

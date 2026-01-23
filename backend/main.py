"""
DailyCook Backend - FastAPI Application
Utility-first recipe generator focused on execution
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from routes import fridge, fitness, cuisine, drinks, daily, history, ai, auth, meals, favorites, goals, dashboard, admin
from database import create_db_and_tables
from dotenv import load_dotenv

# Advanced Features
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    await create_db_and_tables()
    
    # Try to init Redis Cache, but don't fail if Redis is not available
    try:
        from fastapi_cache import FastAPICache
        from fastapi_cache.backends.redis import RedisBackend
        from redis import asyncio as aioredis
        redis = aioredis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"), encoding="utf8", decode_responses=True)
        await redis.ping()  # Test connection
        FastAPICache.init(RedisBackend(redis), prefix="dailycook-cache")
        print("Redis cache initialized")
    except Exception as e:
        print(f"Redis not available, running without cache: {e}")
    yield

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="DailyCook API",
    description="Utility-first recipe generator - execution over discovery",
    version="1.0.0",
    lifespan=lifespan
)

# Apply Rate Limit Exception Handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
# In production, this should be restricted to the frontend domain
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://dailycook-web.vercel.app",
    "https://dailycook-ei0sad316-rajas-projects-2444d0ec.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(fridge.router, prefix="/api/fridge", tags=["Fridge Recipes"])
app.include_router(fitness.router, prefix="/api/fitness", tags=["Fitness Recipes"])
app.include_router(cuisine.router, prefix="/api/cuisine", tags=["Global Cuisine"])
app.include_router(drinks.router, prefix="/api/drinks", tags=["Drinks"])
app.include_router(daily.router, prefix="/api/daily", tags=["Recipe of the Day"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Generation"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(meals.router, prefix="/api/meals", tags=["Meal Logging"])
app.include_router(favorites.router, prefix="/api/favorites", tags=["Favorites"])
app.include_router(goals.router, prefix="/api/goals", tags=["Goals"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {
        "message": "DailyCook API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

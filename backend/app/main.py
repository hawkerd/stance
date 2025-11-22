from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.dependencies import get_db
import logging
from app.api.comments import router as comments_router
from app.api.auth import router as auth_router
from app.api.entities import router as entities_router
from app.api.stances import stance_router, user_stances_router, entity_stances_router
from app.api.images import router as images_router
from app.api.users import router as users_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(dependencies=[Depends(get_db)])

origins = [
    "http://localhost:3000",
    # You can add more origins here if needed
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, etc.
    allow_headers=["*"],  # Allow all headers
)

app.include_router(entities_router.router)
app.include_router(stance_router.router)
app.include_router(user_stances_router.router)
app.include_router(entity_stances_router.router)
app.include_router(users_router.router)
app.include_router(auth_router.router)
app.include_router(comments_router.router)
app.include_router(images_router.router)

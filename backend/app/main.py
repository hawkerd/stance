from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.dependencies import get_db
import logging
from app.routers import (
    users, auth, stances, demographics, profiles, 
    comments, events, issues, comment_reactions, 
    stance_blocks, images
)


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
    allow_methods=["*"],        # GET, POST, etc.
    allow_headers=["*"],        # Allow all headers
)

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(stances.router)
app.include_router(demographics.router)
app.include_router(profiles.router)
app.include_router(comments.router)
app.include_router(events.router)
app.include_router(issues.router)
app.include_router(comment_reactions.router)
app.include_router(stance_blocks.router)
app.include_router(images.router)
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends
from app.dependencies import get_db
import logging
from app.routers import users, auth


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(dependencies=[Depends(get_db)])


app.include_router(users.router)
app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "Stance!"}
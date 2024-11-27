import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from config import config


load_dotenv()

app = FastAPI()

origins = [
    config.ALLOW_ORIGIN,
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendRequestBody(BaseModel):
    keyword: str


class RecommendResponseBody(BaseModel):
    keyword: str


# recommend
@app.get("/recommend")
async def recommend():
    return {"message": "Hello World"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

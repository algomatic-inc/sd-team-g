import os


class Config:
    PROJECT_ID = os.getenv("PROJECT_ID")
    BUCKET_NAME = os.getenv("BUCKET_NAME")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL")
    ALLOW_ORIGIN = os.getenv("ALLOW_ORIGIN")


config = Config()

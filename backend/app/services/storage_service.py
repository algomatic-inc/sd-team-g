from google.cloud import storage
from app.config import settings

storage_client = None
bucket = None


def initialize_storage_client():
    global storage_client, bucket
    storage_client = storage.Client()
    bucket = storage_client.bucket(settings.BUCKET_NAME)


def upload_to_firebase(audio_content, filename):
    blob = bucket.blob(filename)
    blob.upload_from_string(audio_content, content_type='audio/mp3')
    blob.make_public()
    return blob.public_url

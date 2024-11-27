# sd-team-gravity

## Local Environment Setup
```
cd gis
npm run dev
```

http://localhost:5173/

## Deployment to Google Cloud Run

1. Install and set up the Google Cloud SDK.

2. Authenticate with Google Cloud:
```
gcloud auth login
```

3. Set your project ID:
```
PROJECT_ID=xxxx
gcloud config set project $PROJECT_ID
```

4. Build and push the Docker image to Google Artifact Registry:
```
docker build ./backend --platform linux/amd64 -t asia-northeast1-docker.pkg.dev/$PROJECT_ID/main/backend && docker push asia-northeast1-docker.pkg.dev/$PROJECT_ID/main/backend
```

5. Deploy to Cloud Run:
```
gcloud run deploy backend \
   --image asia-northeast1-docker.pkg.dev/$PROJECT_ID/main/backend \
   --platform managed \
   --region asia-northeast1 \
   --allow-unauthenticated
```

6. Execute the API
```
curl -d '{"keyword": "tech"}' -H "Content-Type: application/json" https://xxxx.asia-northeast1.run.app/contents
```

## Frontend Deployment to Firebase Hosting

1. Install the Firebase CLI:
```
npm install -g firebase-tools
```

2. Login to Firebase:
```
firebase login
```

3. Build your frontend:
```
cd gis
npm run build
```

4. Deploy to Firebase Hosting:
```
firebase deploy
```

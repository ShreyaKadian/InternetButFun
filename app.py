from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials, auth as firebase_auth, initialize_app
from db import db

try:
    cred = credentials.Certificate("serviceAccountKey.json")
    initialize_app(cred)
    print("Firebase Admin initialized successfully")
except Exception as e:
    print(f"Firebase Admin initialization failed: {e}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_current_user(request: Request):
    print("=== TOKEN DEBUG ===")
    token = request.headers.get("Authorization")
    print(f"Raw Authorization header: {token}")
    
    if not token or not token.startswith("Bearer "):
        print("Missing or invalid token format")
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    try:
        token_value = token.split(" ")[1]
        print(f"Extracted token: {token_value[:50]}...")
        decoded = firebase_auth.verify_id_token(token_value, clock_skew_seconds=60)
        print(f"Token decoded successfully for user: {decoded.get('email')}")
        return decoded
    except Exception as e:
        error_msg = str(e)
        print(f"Token verification failed: {error_msg}")
        raise HTTPException(status_code=401, detail=f"Invalid Firebase token: {error_msg}")
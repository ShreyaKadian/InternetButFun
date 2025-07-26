from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials, auth as firebase_auth, initialize_app
from db import db
import traceback

try:
    cred = credentials.Certificate("serviceAccountKey.json")
    initialize_app(cred)
    print("Firebase Admin initialized successfully")
except Exception as e:
    print(f"Firebase Admin initialization failed: {e} - Stacktrace: {traceback.format_exc()}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://internetbutfun.vercel.app"],
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
    except firebase_auth.InvalidIdTokenError as e:
        print(f"Invalid token error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid Firebase token: {str(e)}")
    except Exception as e:
        print(f"Unexpected error in token verification: {str(e)} - Stacktrace: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
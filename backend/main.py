import os
import sqlite3
import numpy as np
import cv2
import glob as glob_module
import gc

os.environ['TF_FORCE_LOAD_ONCE'] = '1'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import tempfile
import shutil

# SQLAlchemy imports for PostgreSQL
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLAlchemy Base for models
Base = declarative_base()

# Pydantic models
class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    full_name: Optional[str] = None

class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None

app = FastAPI()

# Environment variables with defaults
# Allow Vercel frontend and Render backend
ALLOWED_ORIGINS_ENV = os.getenv("ALLOWED_ORIGINS", "")
if ALLOWED_ORIGINS_ENV:
    ALLOWED_ORIGINS = ALLOWED_ORIGINS_ENV.split(",")
else:
    ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://localhost:3000", 
        "http://127.0.0.1:5173",
        "https://violence-detection-system-using-cnn.vercel.app",
        "https://violence-detection-api-mhzo.onrender.com"
    ]
SECRET_KEY = os.getenv("SECRET_KEY", "violence-detection-secret-key-change-in-production-2024-v2")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days default
PORT = int(os.getenv("PORT", "10000"))  # Render provides this

# DATABASE CONFIGURATION
DATABASE_URL = os.getenv("DATABASE_URL")  # Render provides this automatically

if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./users.db"
    print("Using SQLite - DATABASE_URL not set")
elif "postgres" in DATABASE_URL.lower():
    print(f"Using PostgreSQL")
else:
    print(f"Using: {DATABASE_URL[:30]}...")

print(f"Creating engine with DATABASE_URL...")
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={"connect_timeout": 30} if "postgres" in DATABASE_URL else {}
)
print("Engine created successfully")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
print("SessionLocal created")

# DATABASE MODELS
class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    email = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    disabled = Column(Boolean, default=False)

class HistoryDB(Base):
    __tablename__ = "history"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    filename = Column(String)
    is_violence = Column(Boolean)
    confidence = Column(Float)
    timestamp = Column(DateTime)

# Create tables
print("Creating database tables...")
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")
except Exception as e:
    print(f"Error creating tables: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRAME_SEQUENCE_LENGTH = 10
FRAME_HEIGHT = 160
FRAME_WIDTH = 160

model = None
model_type = None
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def init_db():
    # Tables already created via SQLAlchemy metadata
    pass

def get_db_user(username: str):
    max_retries = 3
    for attempt in range(max_retries):
        try:
            db = SessionLocal()
            return db.query(UserDB).filter(UserDB.username == username).first()
        except Exception as e:
            print(f"DB connection error (attempt {attempt+1}): {e}")
            if attempt == max_retries - 1:
                raise
        finally:
            if 'db' in locals():
                db.close()

def create_db_user(username: str, password: str, email: str = None, full_name: str = None):
    hashed = get_password_hash(password)
    db = SessionLocal()
    try:
        db_user = UserDB(username=username, password=hashed, email=email, full_name=full_name)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    finally:
        db.close()

def verify_db_password(username: str, password: str) -> bool:
    user = get_db_user(username)
    if not user:
        return False
    return verify_password(password, user.password)

def save_history(username: str, filename: str, is_violence: bool, confidence: float):
    db = SessionLocal()
    try:
        history_entry = HistoryDB(
            username=username,
            filename=filename,
            is_violence=is_violence,
            confidence=confidence,
            timestamp=datetime.utcnow()
        )
        db.add(history_entry)
        db.commit()
    except Exception as e:
        print(f"Error saving history: {e}")
    finally:
        db.close()

def get_user_history(username: str):
    db = SessionLocal()
    try:
        return db.query(HistoryDB).filter(HistoryDB.username == username).order_by(HistoryDB.id.desc()).all()
    finally:
        db.close()

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": int(expire.timestamp())})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        
        exp = payload.get("exp")
        if exp:
            exp_timestamp = int(exp) if isinstance(exp, (int, float)) else int(datetime.fromisoformat(exp).timestamp())
            if exp_timestamp < int(datetime.utcnow().timestamp()):
                raise credentials_exception
        
        token_data = TokenData(username=username)
    except JWTError as e:
        print(f"JWT Error: {e}")
        raise credentials_exception
    
    user = get_db_user(token_data.username)
    if user is None:
        raise credentials_exception
    return User(username=user.username, email=user.email, full_name=user.full_name, disabled=bool(user.disabled))

def load_detection_model():
    global model
    global model_type
    
    try:
        from tensorflow import keras
        
        model_base_path = os.getenv("MODEL_PATH") or os.path.join(os.path.dirname(__file__), "..", "Alert")
        model_file = os.getenv("MODEL_FILE", "best_lstm_model_v3.keras")
        MODEL_PATH = os.path.join(model_base_path, model_file)
        model = keras.models.load_model(MODEL_PATH, compile=False)
        model_type = "tensorflow"
        print(f"TensorFlow model loaded from {MODEL_PATH}")
    except Exception as e:
        print(f"Error loading model: {e}")
        model_type = None

def preprocess_video(video_path, target_frames=FRAME_SEQUENCE_LENGTH):
    cap = cv2.VideoCapture(video_path)
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames == 0:
        cap.release()
        raise ValueError("Empty video file")
    
    frame_indices = np.linspace(0, total_frames - 1, target_frames, dtype=np.int32)
    
    frames = np.zeros((target_frames, FRAME_WIDTH, FRAME_HEIGHT, 3), dtype=np.float32)
    
    for i, idx in enumerate(frame_indices):
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if ret:
            frame = cv2.resize(frame, (FRAME_WIDTH, FRAME_HEIGHT))
            cv2.cvtColor(frame, cv2.COLOR_BGR2RGB, dst=frame)
            frames[i] = frame.astype(np.float32) / 255.0
    
    cap.release()
    del ret, frame
    gc.collect()
    
    return frames

def predict_video(video_path):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        frames = preprocess_video(video_path)
        
        if model_type == "tflite":
            input_details = model.get_input_details()
            output_details = model.get_output_details()
            
            input_shape = input_details[0]['shape']
            frames = frames.reshape(input_shape).astype(np.float32)
            
            model.set_tensor(input_details[0]['index'], frames)
            model.invoke()
            prediction = model.get_tensor(output_details[0]['index'])[0][0]
        else:
            preprocessed_frames = np.expand_dims(frames, axis=0)
            prediction = model.predict(preprocessed_frames, verbose=0)[0][0]
            del preprocessed_frames
        
        del frames
        gc.collect()
        
        return float(prediction)
    except Exception as e:
        gc.collect()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.on_event("startup")
async def startup_event():
    print("Application starting...")
    init_db()
    load_detection_model()
    cleanup_old_files()
    print(f"Application startup complete. Ready on port {PORT}")

def cleanup_old_files():
    """Clean up old log files and limit database history"""
    current_dir = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else "."
    
    for log_file in glob_module.glob(os.path.join(current_dir, "*.log")):
        try:
            os.remove(log_file)
            print(f"Removed old log file: {log_file}")
        except Exception as e:
            print(f"Could not remove {log_file}: {e}")
    
    db_path = os.path.join(current_dir, "users.db")
    if os.path.exists(db_path):
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("""
                DELETE FROM history 
                WHERE id NOT IN (
                    SELECT id FROM history 
                    ORDER BY timestamp DESC 
                    LIMIT 100
                )
            """)
            deleted = cursor.rowcount
            conn.commit()
            conn.close()
            if deleted > 0:
                print(f"Cleaned up {deleted} old history entries")
        except Exception as e:
            print(f"Could not cleanup history: {e}")

@app.get("/")
async def root():
    return {"message": "Violence Detection API", "version": "1.0", "auth_enabled": True}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/register", status_code=201)
async def register(user: UserCreate):
    existing = get_db_user(user.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    create_db_user(user.username, user.password, user.email, user.full_name or user.username)
    return {"message": "User created successfully", "username": user.username}

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_db_user(form_data.username)
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name
    }

@app.put("/users/me")
async def update_users_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    update_fields = []
    values = []
    
    if user_update.username is not None and user_update.username != current_user.username:
        existing = get_db_user(user_update.username)
        if existing:
            raise HTTPException(status_code=400, detail="Username already exists")
        update_fields.append("username = ?")
        values.append(user_update.username)
    
    if user_update.full_name is not None:
        update_fields.append("full_name = ?")
        values.append(user_update.full_name)
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    values.append(current_user.username)
    cursor.execute(
        f"UPDATE users SET {', '.join(update_fields)} WHERE username = ?",
        values
    )
    conn.commit()
    conn.close()
    
    new_username = user_update.username if user_update.username is not None else current_user.username
    updated_user = get_db_user(new_username)
    return {
        "username": updated_user.username,
        "email": updated_user.email,
        "full_name": updated_user.full_name
    }

@app.post("/detect")
async def detect_violence(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a video file.")
    
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_file:
            shutil.copyfileobj(file.file, tmp_file)
            tmp_path = tmp_file.name
        
        prediction = predict_video(tmp_path)
        
        is_violence = prediction > 0.5
        confidence = prediction if is_violence else (1 - prediction)
        
        save_history(current_user.username, file.filename, is_violence, round(confidence * 100, 2))
        
        result = {
            "is_violence": bool(is_violence),
            "confidence": round(confidence * 100, 2),
            "prediction": round(prediction * 100, 2),
            "user": current_user.username
        }
        
        return JSONResponse(content=result)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")
    
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except:
                pass
        gc.collect()

@app.get("/history")
async def get_history(current_user: User = Depends(get_current_user)):
    history = get_user_history(current_user.username)
    return {
        "history": [
            {
                "id": h.id,
                "filename": h.filename,
                "is_violence": bool(h.is_violence),
                "confidence": h.confidence,
                "timestamp": h.timestamp.isoformat() if isinstance(h.timestamp, datetime) else h.timestamp
            }
            for h in history
        ],
        "total": len(history)
    }

@app.get("/stats")
async def get_stats(current_user: User = Depends(get_current_user)):
    history = get_user_history(current_user.username)
    total = len(history)
    violence_count = sum(1 for h in history if h.is_violence)
    non_violence_count = total - violence_count
    
    return {
        "total": total,
        "violence_detected": violence_count,
        "non_violence": non_violence_count,
        "violence_percentage": round(violence_count / total * 100, 2) if total > 0 else 0
    }

@app.post("/change-password")
async def change_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user)
):
    user = get_db_user(current_user.username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(old_password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    hashed = get_password_hash(new_password)
    db = SessionLocal()
    try:
        db.query(User).filter(User.username == current_user.username).update({"password": hashed})
        db.commit()
    finally:
        db.close()
    
    return {"message": "Password changed successfully"}

@app.post("/share/{history_id}")
async def share_result(
    history_id: int,
    current_user: User = Depends(get_current_user)
):
    history = get_user_history(current_user.username)
    item = next((h for h in history if h.id == history_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="History not found")
    
    share_token = f"vd_{history_id}_{datetime.utcnow().timestamp()}"
    
    return {
        "share_id": share_token,
        "filename": item.filename,
        "is_violence": bool(item.is_violence),
        "confidence": item.confidence,
        "timestamp": item.timestamp.isoformat() if isinstance(item.timestamp, datetime) else item.timestamp,
        "shared_by": current_user.username
    }

@app.get("/export")
async def export_history(
    format: str = "json",
    current_user: User = Depends(get_current_user)
):
    history = get_user_history(current_user.username)
    
    if format == "csv":
        import csv
        import io
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Filename", "Is Violence", "Confidence", "Timestamp"])
        for h in history:
            writer.writerow([
                h.id,
                h.filename,
                "Yes" if h.is_violence else "No",
                h.confidence,
                h.timestamp.isoformat() if isinstance(h.timestamp, datetime) else h.timestamp
            ])
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=violence_detection_history.csv"}
        )
    
    return {
        "history": [
            {
                "id": h.id,
                "filename": h.filename,
                "is_violence": bool(h.is_violence),
                "confidence": h.confidence,
                "timestamp": h.timestamp.isoformat() if isinstance(h.timestamp, datetime) else h.timestamp
            }
            for h in history
        ],
        "total": len(history)
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "10000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
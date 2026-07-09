# Violence Detection System using CNN & LSTM Models

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Framework](https://img.shields.io/badge/Framework-TensorFlow%20%7C%20Keras-orange)
![Status](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)

## Project Description
This is a full-stack web application for violence detection in videos using deep learning. The system combines a React/Vite frontend with a FastAPI backend to provide an intuitive interface for uploading videos and detecting violent content using a CNN-LSTM model.

## Features

### Web Application Features
- **User Authentication**: Secure registration and login system with JWT tokens
- **Video Upload**: Drag-and-drop or click-to-upload interface with video preview
- **Batch Upload Queue**: Upload and analyze multiple videos sequentially
- **Violence Detection**: AI-powered analysis using CNN-LSTM model
- **Results Dashboard**: Visualize detection results with confidence scores
- **History Tracking**: View and filter past analysis results
- **Export Reports**: Download history as CSV file
- **Share Results**: Copy detection results to clipboard or share via native share API
- **Profile Management**: Update profile information and change password
- **Responsive Design**: Mobile-friendly interface with app-like experience
- **PWA Support**: Installable progressive web app with offline capabilities
- **Social Sharing**: Open Graph image for rich link previews on social media

### Technical Features
- **Modern Tech Stack**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons
- **Robust Backend**: FastAPI with SQLite database, JWT authentication
- **Deep Learning Model**: CNN-LSTM architecture for video violence detection
- **Secure Authentication**: Password hashing with bcrypt, token-based auth
- **RESTful API**: Well-documented endpoints for all functionality
- **Environment Configuration**: Configurable via environment variables
- **Production Ready**: Deployed on Render (backend) and Vercel (frontend)

## Model Architecture
The violence detection model uses a hybrid CNN-LSTM approach:
1.  **Frame Extraction**: Uniformly samples 10 frames from input video
2.  **Feature Extraction**: MobileNetV2 extracts spatial features from each frame
3.  **Temporal Analysis**: LSTM networks analyze sequential frame features
4.  **Classification**: Dense layers output violence probability score

## Performance
- **Accuracy**: Approximately **97%** violence detection accuracy
- **Processing Time**: Under 2 seconds per video (depending on length)
- **Model Size**: Optimized for efficient inference

## System Architecture
```
Frontend (React/Vite)  <-- HTTPS -->  Backend (FastAPI)
        │                             │
        ▼                             ▼
  Video Upload              Video Processing
        │                             │
        ▼                             ▼
   Results Display           Model Inference
        │                             │
        ▼                             ▼
   History Storage          Database (SQLite)
```

## Deployment
* **Frontend**: [https://violence-detection-cnn-lstm.vercel.app/](https://violence-detection-cnn-lstm.vercel.app/)
* **Backend**: Coming Soon (Placeholder: `https://your-backend.onrender.com`)

### Frontend (Vercel)
1. Sign in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** -> **Project** and import your repository `Maheshkarkii/violence-detection-cnn-lstm`.
3. Vercel will automatically detect the configuration from `vercel.json` at the root.
4. In the **Environment Variables** section, add:
   - `VITE_API_URL`: Your deployed backend API URL (e.g. `https://your-backend-api.onrender.com`)
5. Click **Deploy**.

### Backend (Render / VPS)
1. Set up a Web Service on Render (or equivalent provider) pointed to your repository.
2. Set the root directory to `backend`.
3. Set the build command to: `pip install -r requirements.txt`
4. Set the start command to: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Configure environment variables (detailed below).

### Environment Variables
Backend requires:
- `SECRET_KEY`: JWT signing key
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins (including your deployed Vercel URL)
- `MODEL_PATH`: Path to model directory (optional)
- `MODEL_FILE`: Model filename (default: best_lstm_model_v3.keras)
- `TOKEN_EXPIRE_MINUTES`: JWT expiration time (default: 10080 = 7 days)
- `DB_PATH`: Database path (optional)
- `DB_NAME`: Database filename (default: users.db)

## Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Git

### Backend Setup
1.  Clone the repository:
    ```bash
    git clone https://github.com/Maheshkarkii/violence-detection-cnn-lstm.git
    cd violence-detection-cnn-lstm/backend
    ```

2.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```

3.  Set environment variables (create `.env` file):
    ```bash
    SECRET_KEY=your-secret-key-here
    ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
    MODEL_PATH=../Alert  # Adjust based on your model location
    ```

4.  Ensure the model file exists at the specified path:
    ```
    ../Alert/best_lstm_model_v3.keras
    ```

5.  Start the backend server:
    ```bash
    uvicorn main:app --reload
    ```
    The API will be available at http://localhost:8000

### Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```

2.  Install Node.js dependencies:
    ```bash
    npm install
    ```

3.  Set environment variables (create `.env` file):
    ```bash
    VITE_API_URL=http://localhost:8000
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at http://localhost:5173

## Usage

### 1. User Authentication
- Navigate to the application URL
- Click "Sign Up" to create a new account
- Or click "Login" if you already have an account
- Upon successful login, you'll be redirected to the dashboard

### 2. Video Analysis
1.  From the dashboard, click "Upload Video" or drag & drop a video file
2.  Supported formats: MP4, AVI, MOV, WebM (max 100MB)
3.  Video preview will show with play/pause controls
4.  Click "Analyze Video" to start processing
5.  Wait for analysis to complete (typically <2 seconds)
6.  View results with violence detection status and confidence percentage

### 3. Batch Processing
1.  Enable multi-upload by holding Ctrl/Cmd while selecting files
2.  Add multiple videos to the upload queue
3.  Videos will be processed sequentially
4.  Monitor progress in the queue section

### 4. History & Analytics
- View past analyses in the History tab
- Filter results by violence detection status
- Search videos by filename
- See overall statistics in the dashboard cards
- Export history as CSV file
- Share individual results via clipboard or native share

### 5. Profile Management
- Access profile via navigation menu
- Update profile information
- Change password securely
- Logout of your session

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /token` - Login and get JWT token
- `GET /users/me` - Get current user info
- `POST /change-password` - Change user password

### Video Analysis
- `POST /detect` - Upload and analyze video file
- `GET /health` - Check API and model status

### History & Reports
- `GET /history` - Get user's analysis history
- `GET /stats` - Get user's statistics
- `GET /export` - Export history as CSV or JSON
- `POST /share/{history_id}` - Generate shareable result

## Model Information
The violence detection model expects:
- Input: Sequences of 10 frames, each 160x160x3 (RGB)
- Preprocessing: Frames resized, normalized to [0,1]
- Output: Single float value representing violence probability
- Threshold: >0.5 indicates violence detected

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Built By
- **Mahesh Karki** ([GitHub](https://github.com/Maheshkarkii))
- **Anil Paneru** ([GitHub](https://github.com/Theani7))
- **Rahul Mishra**

## Acknowledgments
- Deep learning model architecture inspired by video action recognition research
- Real Life Violence Situations Dataset for training and evaluation
- Open source community for React, FastAPI, and related technologies

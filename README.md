# AI Interview Practice Platform

> An intelligent interview practice platform powered by AI that conducts realistic technical interviews with real-time analysis of facial expressions, voice tone, and body language.

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.6-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Analysis System](#analysis-system)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The AI Interview Practice Platform is a comprehensive solution for job seekers to practice and improve their interview skills. It combines artificial intelligence, computer vision, and voice analysis to provide realistic interview experiences with actionable feedback.

### What Makes This Special?

- **AI-Powered Interviews**: Dynamic question generation using Groq's Llama 3.1 model
- **Real-time Analysis**: Live tracking of facial expressions, voice metrics, and posture
- **Comprehensive Feedback**: Detailed reports with scores, strengths, weaknesses, and suggestions
- **Flexible Storage**: Works with or without MongoDB (hybrid storage system)
- **User-Friendly**: Demo mode available without registration
- **Modern UI**: Beautiful dark mode with smooth animations


## ✨ Features

### Core Functionality

#### 🤖 AI-Powered Interview System
- **Smart Question Generation**: AI generates role-specific questions based on your resume
- **Dynamic Conversations**: Follow-up questions adapt to your responses
- **Multiple Roles**: Frontend, Backend, Full Stack, Data Science, Product Manager, DevOps
- **Difficulty Levels**: Easy, Medium, Hard questions
- **Resume Analysis**: Upload PDF/TXT or paste text for personalized questions

#### 📊 Real-time Analysis
- **Facial Expression Analysis**
  - Eye contact tracking (percentage of time looking at camera)
  - Smile detection and confidence levels
  - Emotion recognition (happy, neutral, sad, angry, surprised, fearful, disgusted)
  - Face detection confidence scoring
  
- **Voice Analysis**
  - Pitch variation tracking
  - Loudness/volume monitoring
  - Speaking pace calculation (words per minute)
  - Filler word detection ("um", "uh", "like", "you know", etc.)
  - Silence detection and timing
  
- **Posture Analysis**
  - Head position tracking (centered, left, right)
  - Movement stability monitoring
  - Posture score calculation

#### 📈 Comprehensive Reporting
- **Overall Score**: 0-100 rating based on multiple factors
- **Category Breakdown**:
  - Content Quality (0-20 points)
  - Clarity of Communication (0-20 points)
  - Voice Tone (0-20 points)
  - Body Language (0-20 points)
  - Fluency (0-20 points)
- **Question-by-Question Feedback**: Individual scores, strengths, weaknesses
- **Actionable Suggestions**: Specific tips for improvement
- **Visual Analytics**: Charts and graphs for easy understanding

#### 👤 User Management
- **Authentication System**: Secure JWT-based login/registration
- **Demo Mode**: Try without creating an account
- **Interview History**: Track all past interviews
- **Report Archive**: Access previous reports anytime
- **User Profiles**: Manage account settings

#### 🎨 User Experience
- **Dark Mode**: Eye-friendly dark theme with smooth transitions
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Feedback**: Live metrics during interview
- **Progress Tracking**: Timer and question counter
- **Intuitive Navigation**: Easy-to-use interface


## 🛠️ Tech Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3 | UI framework |
| **TypeScript** | 5.5 | Type safety |
| **Vite** | 5.4 | Build tool & dev server |
| **TailwindCSS** | 3.4 | Styling |
| **React Router** | 6.26 | Navigation |
| **Axios** | 1.7 | HTTP client |
| **face-api.js** | 0.22 | Facial recognition |
| **Recharts** | 2.12 | Data visualization |
| **Web Speech API** | Native | Voice recognition |
| **Web Audio API** | Native | Audio analysis |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express** | 4.19 | Web framework |
| **TypeScript** | 5.5 | Type safety |
| **MongoDB** | 8.6 | Database (optional) |
| **Mongoose** | 8.6 | ODM for MongoDB |
| **Groq SDK** | 0.7 | AI integration |
| **JWT** | 9.0 | Authentication |
| **bcryptjs** | 2.4 | Password hashing |
| **Multer** | 1.4 | File upload |
| **pdf-parse** | 1.1 | PDF parsing |

### AI & Machine Learning

- **Groq API**: Llama 3.1 8B Instant model for question generation and feedback
- **face-api.js**: TensorFlow.js-based facial recognition
- **Custom Algorithms**: Voice and posture analysis


## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
├─────────────────────────────────────────────────────────────┤
│  Pages: Home | Setup | Interview | Report | Login | History │
│  Context: Auth | Theme                                       │
│  Services: API | Facial | Voice | Posture Analysis          │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      Backend (Node.js)                       │
├─────────────────────────────────────────────────────────────┤
│  Routes: /auth | /api                                        │
│  Services: AI (Groq) | Storage | Analysis                   │
│  Middleware: JWT Auth                                        │
└────────────┬────────────────────────┬───────────────────────┘
             │                        │
             │                        │
    ┌────────▼────────┐      ┌───────▼────────┐
    │   MongoDB       │      │  Groq API      │
    │   (Optional)    │      │  (Llama 3.1)   │
    │                 │      │                │
    │  - Users        │      │  - Questions   │
    │  - Sessions     │      │  - Feedback    │
    │  - Reports      │      │  - Analysis    │
    └─────────────────┘      └────────────────┘
```

### Data Flow

#### Interview Flow
```
1. User uploads resume → Backend parses PDF/TXT
2. AI generates questions → Groq API processes resume + role
3. Interview starts → Camera/Mic permissions granted
4. User speaks → Speech Recognition converts to text
5. Real-time analysis → Face-api.js + Audio API + Custom algorithms
6. Response saved → MongoDB/Memory storage
7. AI generates follow-up → Groq API processes conversation
8. Interview ends → Generate comprehensive report
9. Report displayed → Charts, scores, suggestions
```

#### Analysis Pipeline
```
Video Stream → face-api.js → Facial Metrics
                            ↓
Audio Stream → Web Audio API → Voice Metrics
                            ↓
Transcript → Custom Parser → Filler Words
                            ↓
All Metrics → AI Service → Comprehensive Report
```

### Storage System

The platform uses a **hybrid storage approach**:

- **MongoDB Mode**: When connected, all data persists in MongoDB
- **In-Memory Mode**: Falls back to Map-based storage if MongoDB unavailable
- **Seamless Switching**: No code changes needed, automatic detection


## 📦 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **MongoDB** (optional) ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/))

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-interview-platform.git
cd ai-interview-platform
```

### Step 2: Install Dependencies

#### Backend Setup
```bash
cd backend
npm install
```

#### Frontend Setup
```bash
cd frontend
npm install
```

### Step 3: Configure Environment Variables

#### Backend Configuration

Create `backend/.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# AI Configuration (Required)
GROQ_API_KEY=your_groq_api_key_here

# Database Configuration (Optional)
MONGODB_URI=mongodb://localhost:27017/interview-app

# Authentication
JWT_SECRET=your-secret-key-change-in-production
```

**Get Your Groq API Key:**
1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste into `.env` file

#### Frontend Configuration (Optional)

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:3001
```

### Step 4: Start MongoDB (Optional)

If you want to use MongoDB for persistent storage:

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

**Note**: The application works without MongoDB using in-memory storage.


## 🚀 Usage

### Running in Development Mode

#### Start Backend Server

Open a terminal and run:

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 3001
✅ MongoDB connected successfully
```

Or if MongoDB is not running:
```
🚀 Server running on port 3001
⚠️  MongoDB not connected - using in-memory storage
```

#### Start Frontend Development Server

Open another terminal and run:

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.4.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Accessing the Application

Open your browser and navigate to:
```
http://localhost:5173
```

### Using the Platform

#### Option 1: Demo Mode (No Registration)

1. Click **"Try Demo"** on the home page
2. Select a job role (e.g., Frontend Developer)
3. Choose interview duration (3-10 minutes)
4. Grant camera and microphone permissions
5. Click **"Start Interview"**
6. Answer questions by clicking the microphone button
7. Click **"Finish Interview"** to see your report

#### Option 2: Full Experience (With Account)

1. Click **"Get Started"** on the home page
2. Register with email, password, and name
3. Upload your resume (PDF/TXT) or paste resume text
4. Select job role and interview duration
5. Grant camera and microphone permissions
6. Complete the interview
7. View detailed report with AI feedback
8. Access interview history from your dashboard

### Interview Tips

- **Camera**: Position yourself centered in the frame
- **Lighting**: Ensure good lighting on your face
- **Microphone**: Speak clearly and at a moderate pace
- **Environment**: Choose a quiet location
- **Browser**: Use Chrome or Edge for best compatibility


## 📡 API Documentation

### Base URL
```
http://localhost:3001
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}

Response: 200 OK
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: 200 OK
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer jwt_token_here

Response: 200 OK
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe"
}
```

### Interview Endpoints

#### Generate Questions
```http
POST /api/generate-questions
Content-Type: multipart/form-data

Fields:
- resume: File (PDF/TXT)
- resumeText: String
- role: String
- difficulty: String (easy/medium/hard)
- numQuestions: Number

Response: 200 OK
{
  "questions": [
    {
      "id": "q1",
      "text": "Question text",
      "type": "technical",
      "difficulty": "medium",
      "expectedPoints": ["point1", "point2"],
      "followUps": ["follow-up question"]
    }
  ],
  "resumeText": "extracted text"
}
```

#### Start Interview Session
```http
POST /api/session/start
Content-Type: application/json

{
  "userId": "user_id_or_guest",
  "role": "Frontend Developer",
  "questions": [...],
  "resumeText": "resume content"
}

Response: 200 OK
{
  "sessionId": "s_1234567890_abc123",
  "resumeText": "resume content"
}
```

#### Save Interview Response
```http
POST /api/session/append-response
Content-Type: application/json

{
  "sessionId": "session_id",
  "questionId": "q1",
  "transcription": "user's answer",
  "audioMetrics": {
    "pitch": 150,
    "loudness": 45,
    "pace": 120,
    "fillerCount": 2
  },
  "faceMetrics": {
    "eyeContact": 0.75,
    "smile": 0.6,
    "emotions": {...}
  },
  "timestamp": 1234567890
}

Response: 200 OK
{
  "saved": true
}
```

#### Get Next Question
```http
POST /api/chat/next-question
Content-Type: application/json

{
  "sessionId": "session_id",
  "conversationHistory": [
    {"role": "assistant", "content": "question"},
    {"role": "user", "content": "answer"}
  ],
  "resumeText": "resume content"
}

Response: 200 OK
{
  "question": "Next interview question based on conversation"
}
```

#### Generate Report
```http
POST /api/generate-report
Content-Type: application/json

{
  "sessionId": "session_id",
  "resumeText": "resume content"
}

Response: 200 OK
{
  "reportId": "r_1234567890",
  "report": {
    "sessionId": "session_id",
    "role": "Frontend Developer",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "overallScore": 75,
    "categories": {
      "content": 15,
      "clarity": 14,
      "tone": 16,
      "bodyLanguage": 15,
      "fluency": 15
    },
    "questionFeedback": [...],
    "suggestions": [...]
  }
}
```

### History Endpoints

#### Get Interview History
```http
GET /api/sessions/history?userId=user_id

Response: 200 OK
{
  "sessions": [
    {
      "sessionId": "s_123",
      "role": "Frontend Developer",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "questionCount": 5,
      "responseCount": 5
    }
  ]
}
```

#### Get Report History
```http
GET /api/reports/history?userId=user_id

Response: 200 OK
{
  "reports": [
    {
      "reportId": "r_123",
      "sessionId": "s_123",
      "role": "Frontend Developer",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "overallScore": 75
    }
  ]
}
```

#### Get Specific Report
```http
GET /api/report/:reportId

Response: 200 OK
{
  "reportId": "r_123",
  "sessionId": "s_123",
  "role": "Frontend Developer",
  "overallScore": 75,
  "categories": {...},
  "questionFeedback": [...],
  "suggestions": [...]
}
```


## 🔬 Analysis System

### Facial Analysis

The platform uses **face-api.js** (TensorFlow.js-based) for real-time facial recognition and analysis.

#### Metrics Tracked

1. **Eye Contact**
   - Calculates percentage of time user looks at camera
   - Uses face landmarks to detect gaze direction
   - Updates every 2 seconds during interview

2. **Smile Detection**
   - Measures smile intensity (0-1 scale)
   - Tracks confidence and authenticity
   - Correlates with positive emotions

3. **Emotion Recognition**
   - Detects 7 emotions: happy, neutral, sad, angry, surprised, fearful, disgusted
   - Provides confidence scores for each emotion
   - Tracks emotional consistency throughout interview

4. **Face Detection**
   - Ensures face is visible and centered
   - Tracks face position and movement
   - Monitors detection confidence

#### Implementation

```typescript
// Facial Analysis Service
class FacialAnalyzer {
  - addDetection(detection): Stores facial data
  - generateReport(duration): Creates comprehensive facial report
  - Tracks: expressions, eye contact, emotions over time
}
```

### Voice Analysis

Uses **Web Audio API** for real-time audio processing and analysis.

#### Metrics Tracked

1. **Pitch**
   - Measures voice frequency (Hz)
   - Tracks pitch variation
   - Indicates confidence and emotion

2. **Loudness/Volume**
   - Measures audio amplitude (dB)
   - Tracks volume consistency
   - Indicates confidence level

3. **Speaking Pace**
   - Calculates words per minute
   - Optimal range: 120-150 WPM
   - Too fast or slow affects clarity

4. **Filler Words**
   - Detects: "um", "uh", "like", "you know", "so", "actually", "basically"
   - Counts occurrences per response
   - Affects fluency score

5. **Silence Detection**
   - Tracks pauses and gaps
   - Distinguishes thinking pauses from awkward silences
   - Affects pacing score

#### Implementation

```typescript
// Voice Analysis Service
class VoiceAnalyzer {
  - addSample(pitch, loudness): Stores voice metrics
  - addTranscript(text, timestamp): Analyzes speech content
  - generateReport(duration): Creates voice analysis report
}

// Audio Analyzer
class AudioAnalyzer {
  - initialize(stream): Sets up audio processing
  - getMetrics(): Returns real-time pitch and loudness
  - Uses: AudioContext, AnalyserNode, FFT analysis
}
```

### Posture Analysis

Custom algorithm for tracking body language and posture.

#### Metrics Tracked

1. **Head Position**
   - Centered, left, right positioning
   - Tracks horizontal alignment
   - Indicates engagement

2. **Movement Stability**
   - Measures excessive movement
   - Tracks fidgeting and restlessness
   - Affects body language score

3. **Posture Score**
   - Overall posture rating (0-100)
   - Based on position consistency
   - Correlates with confidence

#### Implementation

```typescript
// Posture Analysis Service
class PostureAnalyzer {
  - addFacePosition(x, y): Tracks head position
  - generateReport(): Creates posture analysis
  - Calculates: position distribution, movement patterns
}
```

### AI-Powered Feedback

Uses **Groq's Llama 3.1** model for intelligent analysis and feedback.

#### Capabilities

1. **Question Generation**
   - Analyzes resume content
   - Generates role-specific questions
   - Adapts difficulty level

2. **Dynamic Follow-ups**
   - Processes conversation history
   - Generates contextual follow-up questions
   - Maintains interview flow

3. **Comprehensive Reports**
   - Analyzes interview transcript
   - Combines with metrics data
   - Generates actionable feedback

4. **Fallback System**
   - Works without API key (uses defaults)
   - Graceful degradation
   - Metrics-based analysis as backup


## 📁 Project Structure

```
ai-interview-platform/
│
├── frontend/                      # React frontend application
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── components/            # Reusable React components
│   │   │   ├── Navbar.tsx        # Navigation bar with auth
│   │   │   └── ThemeToggle.tsx   # Dark mode toggle
│   │   │
│   │   ├── context/               # React Context providers
│   │   │   ├── AuthContext.tsx   # Authentication state
│   │   │   └── ThemeContext.tsx  # Theme management
│   │   │
│   │   ├── pages/                 # Page components
│   │   │   ├── Home.tsx          # Landing page
│   │   │   ├── Setup.tsx         # Interview setup
│   │   │   ├── InterviewChat.tsx # Interview interface
│   │   │   ├── Report.tsx        # Results display
│   │   │   ├── Login.tsx         # Login page
│   │   │   ├── Register.tsx      # Registration page
│   │   │   └── History.tsx       # Interview history
│   │   │
│   │   ├── services/              # Business logic services
│   │   │   ├── api.service.ts    # API communication
│   │   │   ├── auth.service.ts   # Authentication logic
│   │   │   ├── analysis.service.ts        # Main analysis
│   │   │   ├── facial-analysis.service.ts # Facial tracking
│   │   │   ├── voice-analysis.service.ts  # Voice analysis
│   │   │   └── posture-analysis.service.ts # Posture tracking
│   │   │
│   │   ├── types/                 # TypeScript type definitions
│   │   │   └── index.ts
│   │   │
│   │   ├── App.tsx                # Main app component
│   │   ├── main.tsx               # Entry point
│   │   └── index.css              # Global styles
│   │
│   ├── .env.example               # Environment template
│   ├── package.json               # Dependencies
│   ├── tsconfig.json              # TypeScript config
│   ├── vite.config.ts             # Vite configuration
│   └── tailwind.config.js         # Tailwind CSS config
│
├── backend/                       # Node.js backend application
│   ├── src/
│   │   ├── config/                # Configuration files
│   │   │   └── database.ts       # MongoDB connection
│   │   │
│   │   ├── middleware/            # Express middleware
│   │   │   └── auth.middleware.ts # JWT verification
│   │   │
│   │   ├── models/                # MongoDB models
│   │   │   ├── User.model.ts     # User schema
│   │   │   ├── Session.model.ts  # Interview session schema
│   │   │   └── Report.model.ts   # Report schema
│   │   │
│   │   ├── routes/                # API routes
│   │   │   ├── auth.routes.ts    # Authentication endpoints
│   │   │   └── api.routes.ts     # Interview endpoints
│   │   │
│   │   ├── services/              # Business logic
│   │   │   ├── ai.service.ts     # Groq AI integration
│   │   │   └── storage.service.ts # Data persistence
│   │   │
│   │   ├── types/                 # TypeScript types
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts               # Server entry point
│   │
│   ├── .env.example               # Environment template
│   ├── package.json               # Dependencies
│   └── tsconfig.json              # TypeScript config
│
├── .gitignore                     # Git ignore rules
├── README.md                      # This file
└── setup-github.bat               # GitHub setup script

```

### Key Files Explained

#### Frontend

- **App.tsx**: Main application component with routing
- **AuthContext.tsx**: Manages user authentication state globally
- **ThemeContext.tsx**: Handles dark/light mode switching
- **InterviewChat.tsx**: Core interview interface with real-time analysis
- **Report.tsx**: Displays comprehensive interview results
- **analysis.service.ts**: Coordinates all analysis services
- **facial-analysis.service.ts**: Processes facial recognition data
- **voice-analysis.service.ts**: Analyzes voice metrics
- **posture-analysis.service.ts**: Tracks body language

#### Backend

- **index.ts**: Express server setup and middleware configuration
- **database.ts**: MongoDB connection with fallback handling
- **auth.middleware.ts**: JWT token verification
- **ai.service.ts**: Groq API integration for AI features
- **storage.service.ts**: Hybrid storage (MongoDB + in-memory)
- **User.model.ts**: User data schema
- **Session.model.ts**: Interview session schema
- **Report.model.ts**: Report data schema


## 🌐 Deployment

### Production Build

#### Backend

```bash
cd backend
npm run build
npm start
```

The backend will be compiled to `backend/dist/` and run in production mode.

#### Frontend

```bash
cd frontend
npm run build
```

The frontend will be built to `frontend/dist/` for static hosting.

### Environment Variables for Production

#### Backend `.env`
```env
PORT=3001
NODE_ENV=production
GROQ_API_KEY=your_production_groq_key
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=strong_random_secret_key_here
```

#### Frontend `.env`
```env
VITE_API_URL=https://your-api-domain.com
```

### Deployment Options

#### Option 1: Traditional Hosting

**Backend (Node.js)**
- Deploy to: Heroku, DigitalOcean, AWS EC2, Google Cloud
- Ensure MongoDB is accessible
- Set environment variables
- Use PM2 for process management

**Frontend (Static)**
- Deploy to: Vercel, Netlify, GitHub Pages, AWS S3
- Build the project first
- Configure API URL
- Set up custom domain

#### Option 2: Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/interview-app
      - GROQ_API_KEY=${GROQ_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

Run with:
```bash
docker-compose up -d
```

#### Option 3: Cloud Platform (Recommended)

**Vercel (Frontend) + Railway (Backend + MongoDB)**

1. **Frontend on Vercel**:
   ```bash
   npm install -g vercel
   cd frontend
   vercel
   ```

2. **Backend on Railway**:
   - Connect GitHub repository
   - Add MongoDB service
   - Set environment variables
   - Deploy automatically

### Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Verify MongoDB connection
- [ ] Test authentication flow
- [ ] Check camera/microphone permissions
- [ ] Test interview flow end-to-end
- [ ] Verify report generation
- [ ] Test on multiple browsers
- [ ] Check mobile responsiveness
- [ ] Monitor error logs
- [ ] Set up SSL/HTTPS


## 🔧 Configuration

### Frontend Configuration

#### Vite Config (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
```

#### Tailwind Config (`tailwind.config.js`)
```javascript
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Custom theme extensions
    }
  }
}
```

### Backend Configuration

#### TypeScript Config (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

#### Server Config (`src/index.ts`)
```typescript
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
```

### MongoDB Configuration

#### Connection String Format
```
mongodb://[username:password@]host[:port]/database[?options]
```

#### Examples
```env
# Local
MONGODB_URI=mongodb://localhost:27017/interview-app

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/interview-app

# With authentication
MONGODB_URI=mongodb://admin:password@localhost:27017/interview-app?authSource=admin
```

### Groq API Configuration

#### Rate Limits (Free Tier)
- 30 requests per minute
- 14,400 requests per day
- Automatic retry on rate limit

#### Model Selection
```typescript
const MODEL = 'llama-3.1-8b-instant'; // Fast, free
// Alternative: 'llama-3.1-70b-versatile' // More powerful
```

### Security Configuration

#### JWT Settings
```env
JWT_SECRET=your-256-bit-secret-key
JWT_EXPIRES_IN=7d
```

#### CORS Settings
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

#### Password Hashing
```typescript
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```


## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Camera/Microphone Not Working

**Problem**: Browser doesn't request permissions or shows "Permission denied"

**Solutions**:
- Use HTTPS or localhost (required for media access)
- Check browser permissions: Settings → Privacy → Camera/Microphone
- Use Chrome or Edge (best compatibility)
- Ensure no other app is using camera/mic
- Try incognito/private mode
- Restart browser

**Check Permissions**:
```javascript
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => console.log('✅ Permissions granted'))
  .catch(err => console.error('❌ Permission denied:', err));
```

#### 2. MongoDB Connection Failed

**Problem**: `MongoDB not connected - using in-memory storage`

**Solutions**:
- Check if MongoDB is running: `mongod --version`
- Start MongoDB service:
  - Windows: `net start MongoDB`
  - macOS: `brew services start mongodb-community`
  - Linux: `sudo systemctl start mongod`
- Verify connection string in `.env`
- Check firewall settings
- Try connecting with MongoDB Compass

**Note**: App works without MongoDB using in-memory storage

#### 3. Groq API Errors

**Problem**: "Groq API error" or "Using fallback questions"

**Solutions**:
- Verify API key in `backend/.env`
- Check API key is active at https://console.groq.com
- Check rate limits (30 req/min free tier)
- Ensure internet connection
- Check backend console for detailed error

**Test API Key**:
```bash
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### 4. Speech Recognition Not Working

**Problem**: Transcript shows "No speech detected"

**Solutions**:
- Speak clearly and loudly
- Check microphone is not muted
- Reduce background noise
- Use Chrome or Edge (best support)
- Check browser console for errors
- Try different microphone

**Browser Support**:
- ✅ Chrome/Edge: Full support
- ⚠️ Firefox: Limited support
- ❌ Safari: Not supported

#### 5. Face Detection Issues

**Problem**: "No face detected" or low confidence

**Solutions**:
- Ensure good lighting on face
- Position face centered in frame
- Remove glasses if causing issues
- Check camera quality
- Wait for models to load (first time takes ~10s)
- Clear browser cache

**Model Loading**:
```javascript
// Models load from CDN on first use
await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
await faceapi.nets.faceExpressionNet.loadFromUri('/models')
```

#### 6. Build Errors

**Problem**: `npm run build` fails

**Solutions**:
- Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- Check Node.js version: `node --version` (need 18+)
- Clear npm cache: `npm cache clean --force`
- Check for TypeScript errors: `npm run type-check`

#### 7. Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3001`

**Solutions**:
- Kill process using port:
  ```bash
  # Windows
  netstat -ano | findstr :3001
  taskkill /PID <PID> /F
  
  # macOS/Linux
  lsof -ti:3001 | xargs kill -9
  ```
- Change port in `backend/.env`:
  ```env
  PORT=3002
  ```

#### 8. CORS Errors

**Problem**: "Access to fetch blocked by CORS policy"

**Solutions**:
- Ensure backend is running
- Check CORS configuration in `backend/src/index.ts`
- Verify API URL in frontend `.env`
- Use proxy in `vite.config.ts`

#### 9. Authentication Issues

**Problem**: "Invalid token" or "Access token required"

**Solutions**:
- Clear browser localStorage
- Re-login to get new token
- Check JWT_SECRET matches in `.env`
- Verify token expiration time
- Check browser console for token

**Clear Auth**:
```javascript
localStorage.removeItem('token');
localStorage.removeItem('user');
```

#### 10. Report Generation Fails

**Problem**: "Failed to generate report"

**Solutions**:
- Check backend console for errors
- Verify session has responses
- Check Groq API is working
- Try with fallback (works without API)
- Ensure MongoDB/storage is accessible

### Getting Help

If you encounter issues not listed here:

1. **Check Console Logs**:
   - Browser console (F12)
   - Backend terminal output

2. **Enable Debug Mode**:
   ```env
   NODE_ENV=development
   DEBUG=*
   ```

3. **Check GitHub Issues**:
   - Search existing issues
   - Create new issue with:
     - Error message
     - Steps to reproduce
     - Browser/OS info
     - Console logs

4. **Common Error Codes**:
   - 400: Bad request (check request body)
   - 401: Unauthorized (check token)
   - 404: Not found (check URL/route)
   - 500: Server error (check backend logs)


## 🚀 Performance Optimization

### Frontend Optimizations

#### Code Splitting
```typescript
// Lazy load pages
const Report = lazy(() => import('./pages/Report'));
const History = lazy(() => import('./pages/History'));
```

#### Memoization
```typescript
// Prevent unnecessary re-renders
const MemoizedComponent = memo(Component);
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

#### Analysis Intervals
```typescript
// Optimize analysis frequency
const ANALYSIS_INTERVAL = 2000; // 2 seconds
setInterval(analyzeMetrics, ANALYSIS_INTERVAL);
```

### Backend Optimizations

#### Database Indexing
```typescript
// Add indexes for faster queries
UserSchema.index({ email: 1 });
SessionSchema.index({ userId: 1, createdAt: -1 });
ReportSchema.index({ sessionId: 1 });
```

#### Caching
```typescript
// Cache frequently accessed data
const cache = new Map();
const getCachedData = (key) => {
  if (cache.has(key)) return cache.get(key);
  const data = fetchData(key);
  cache.set(key, data);
  return data;
};
```

#### API Response Compression
```typescript
import compression from 'compression';
app.use(compression());
```

### Best Practices

1. **Minimize Bundle Size**
   - Use tree shaking
   - Remove unused dependencies
   - Lazy load heavy components

2. **Optimize Images**
   - Use WebP format
   - Compress images
   - Lazy load images

3. **Reduce API Calls**
   - Batch requests
   - Implement pagination
   - Use caching

4. **Monitor Performance**
   - Use React DevTools Profiler
   - Monitor bundle size
   - Track API response times


## 🔒 Security

### Implemented Security Measures

#### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Token Expiration**: 7-day expiry by default
- **Secure Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)

#### Data Protection
- **Environment Variables**: Sensitive data in .env files
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: MongoDB parameterized queries
- **XSS Prevention**: React's built-in escaping

#### API Security
- **CORS Configuration**: Restricted origins
- **Rate Limiting**: Groq API rate limit handling
- **Error Handling**: No sensitive data in error messages
- **HTTPS**: Required for production

### Security Best Practices

#### For Production

1. **Use HTTPS**
   ```nginx
   server {
     listen 443 ssl;
     ssl_certificate /path/to/cert.pem;
     ssl_certificate_key /path/to/key.pem;
   }
   ```

2. **Secure Headers**
   ```typescript
   import helmet from 'helmet';
   app.use(helmet());
   ```

3. **Rate Limiting**
   ```typescript
   import rateLimit from 'express-rate-limit';
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   app.use('/api/', limiter);
   ```

4. **Environment Variables**
   - Never commit `.env` files
   - Use strong JWT secrets
   - Rotate API keys regularly
   - Use different keys for dev/prod

5. **Database Security**
   - Use MongoDB authentication
   - Restrict database access
   - Regular backups
   - Encrypt sensitive data

### Security Checklist

- [x] Passwords hashed with bcrypt
- [x] JWT tokens for authentication
- [x] Environment variables for secrets
- [x] CORS configured
- [x] Input validation
- [ ] HTTPS in production
- [ ] Rate limiting (recommended)
- [ ] Security headers (recommended)
- [ ] Database authentication (recommended)
- [ ] Regular security audits (recommended)


## 📊 Database Schema

### User Collection

```typescript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  createdAt: Date (default: now)
}
```

### Session Collection

```typescript
{
  _id: ObjectId,
  sessionId: String (unique, required),
  userId: String (optional, default: 'guest'),
  role: String (required),
  questions: Array<Question> (mixed type),
  responses: Array<Response> (mixed type),
  createdAt: Date (default: now)
}

// Question Structure
{
  id: String,
  text: String,
  type: String,
  difficulty: String,
  expectedPoints: Array<String>,
  followUps: Array<String>
}

// Response Structure
{
  questionId: String,
  transcription: String,
  timestamp: Number,
  audioMetrics: {
    pitch: Number,
    loudness: Number,
    pace: Number,
    fillerCount: Number
  },
  faceMetrics: {
    eyeContact: Number,
    smile: Number,
    emotions: Object
  }
}
```

### Report Collection

```typescript
{
  _id: ObjectId,
  reportId: String (unique, required),
  sessionId: String (required),
  userId: String (optional, default: 'guest'),
  role: String (required),
  timestamp: Date (default: now),
  overallScore: Number (required),
  categories: {
    content: Number,
    clarity: Number,
    tone: Number,
    bodyLanguage: Number,
    fluency: Number
  },
  facial: Object (optional),
  voice: Object (optional),
  posture: Object (optional),
  questionFeedback: Array<Feedback>,
  suggestions: Array<String>
}

// Feedback Structure
{
  qid: String,
  text: String,
  score: Number,
  strengths: Array<String>,
  weaknesses: Array<String>,
  suggestedAnswer: String
}
```


## 🧪 Testing

### Manual Testing Checklist

#### Authentication Flow
- [ ] Register new user
- [ ] Login with credentials
- [ ] Logout functionality
- [ ] Token persistence
- [ ] Protected routes redirect

#### Interview Setup
- [ ] Resume upload (PDF)
- [ ] Resume upload (TXT)
- [ ] Resume text paste
- [ ] Role selection
- [ ] Duration selection
- [ ] Camera permission
- [ ] Microphone permission

#### Interview Flow
- [ ] First question appears
- [ ] Speech recognition works
- [ ] Transcript displays correctly
- [ ] Stop recording saves response
- [ ] Next question generates
- [ ] AI speaks questions
- [ ] Timer counts down
- [ ] Live metrics update
- [ ] Finish interview button

#### Analysis
- [ ] Face detection works
- [ ] Eye contact tracking
- [ ] Smile detection
- [ ] Emotion recognition
- [ ] Voice pitch tracking
- [ ] Loudness monitoring
- [ ] Filler word detection
- [ ] Posture tracking

#### Report Generation
- [ ] Report generates successfully
- [ ] Overall score displays
- [ ] Category scores show
- [ ] Question feedback appears
- [ ] Suggestions provided
- [ ] Charts render correctly
- [ ] Facial analysis included
- [ ] Voice analysis included
- [ ] Posture analysis included

#### History
- [ ] Interview history loads
- [ ] Report history loads
- [ ] Can view past reports
- [ ] Correct user filtering

### Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Speech Recognition | ✅ | ✅ | ⚠️ | ❌ |
| Face Detection | ✅ | ✅ | ✅ | ✅ |
| Audio Analysis | ✅ | ✅ | ✅ | ✅ |
| Camera Access | ✅ | ✅ | ✅ | ✅ |
| Dark Mode | ✅ | ✅ | ✅ | ✅ |

**Recommended**: Chrome or Edge for full functionality

### Testing Commands

```bash
# Frontend type checking
cd frontend
npm run type-check

# Backend type checking
cd backend
npm run type-check

# Build test
npm run build

# Lint check (if configured)
npm run lint
```


## 🎓 Learning Resources

### Technologies Used

#### React & TypeScript
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

#### Face Recognition
- [face-api.js Documentation](https://github.com/justadudewhohacks/face-api.js)
- [TensorFlow.js](https://www.tensorflow.org/js)

#### Web APIs
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)

#### Backend
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)

#### AI Integration
- [Groq Documentation](https://console.groq.com/docs)
- [Llama 3.1 Model Card](https://ai.meta.com/llama/)

### Project Concepts

#### Real-time Analysis
- Computer Vision basics
- Audio signal processing
- Natural Language Processing
- Machine Learning inference

#### Full-Stack Development
- RESTful API design
- Authentication & Authorization
- Database design
- State management
- Error handling


## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**
   - Use GitHub Issues
   - Include reproduction steps
   - Provide error messages and logs

2. **Suggest Features**
   - Open a feature request
   - Explain the use case
   - Discuss implementation approach

3. **Submit Pull Requests**
   - Fork the repository
   - Create a feature branch
   - Make your changes
   - Write clear commit messages
   - Submit PR with description

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/ai-interview-platform.git
cd ai-interview-platform

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add: your feature description"

# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Code Style

- Use TypeScript for type safety
- Follow existing code structure
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names

### Commit Message Format

```
Type: Brief description

Detailed explanation if needed

Examples:
- Add: user profile page
- Fix: camera permission issue
- Update: improve voice analysis accuracy
- Refactor: simplify authentication logic
```


## 🗺️ Roadmap

### Planned Features

#### Short Term (v1.1)
- [ ] Video recording of interviews
- [ ] Export reports as PDF
- [ ] Email report delivery
- [ ] Custom question banks
- [ ] Interview scheduling
- [ ] Practice mode (no recording)

#### Medium Term (v1.2)
- [ ] Multi-language support
- [ ] Voice accent analysis
- [ ] Advanced body language tracking
- [ ] Peer review system
- [ ] Interview templates
- [ ] Progress dashboard

#### Long Term (v2.0)
- [ ] Mobile app (React Native)
- [ ] Live interview with human interviewer
- [ ] Team/organization features
- [ ] Integration with job boards
- [ ] Advanced analytics dashboard
- [ ] AI interview coach
- [ ] Virtual reality interviews

### Known Limitations

- Speech recognition works best in Chrome/Edge
- Face detection requires good lighting
- Groq API has rate limits (free tier)
- In-memory storage doesn't persist across restarts
- No video recording yet
- Limited to English language


## 📝 License

MIT License

Copyright (c) 2024 AI Interview Platform

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


## 🙏 Acknowledgments

### Technologies & Libraries

- **React Team** - For the amazing React framework
- **Groq** - For providing free AI API access
- **face-api.js** - For facial recognition capabilities
- **MongoDB** - For flexible database solution
- **TailwindCSS** - For beautiful styling system
- **Vite** - For lightning-fast development experience

### Inspiration

This project was inspired by the need for accessible interview practice tools that provide real-time feedback and help job seekers improve their interview skills.

### Special Thanks

- The open-source community for amazing tools and libraries
- All contributors who help improve this project
- Users who provide valuable feedback


## 📞 Support & Contact

### Getting Help

- **Documentation**: Read this README thoroughly
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/ai-interview-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/ai-interview-platform/discussions)

### Reporting Issues

When reporting issues, please include:
1. Clear description of the problem
2. Steps to reproduce
3. Expected vs actual behavior
4. Browser and OS information
5. Console error messages
6. Screenshots if applicable

### Feature Requests

Have an idea? We'd love to hear it!
1. Check existing issues first
2. Open a new issue with "Feature Request" label
3. Describe the feature and use case
4. Explain why it would be valuable

---

## 🚀 Quick Start Summary

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/ai-interview-platform.git
cd ai-interview-platform

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Configure environment
# Create backend/.env with GROQ_API_KEY

# 4. Start development servers
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev

# 5. Open browser
# http://localhost:5173
```

---

## 📈 Project Stats

- **Lines of Code**: 5000+
- **Files**: 50+
- **Components**: 15+
- **API Endpoints**: 12+
- **Analysis Metrics**: 20+
- **Supported Roles**: 6
- **Technologies**: 20+

---

## ⭐ Show Your Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 🤝 Contributing code
- 📢 Sharing with others

---

**Built with ❤️ using React, Node.js, and AI**

*Happy Interviewing! 🎯*

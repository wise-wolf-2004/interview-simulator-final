# AI Interview Practice Platform

An intelligent interview practice platform that uses AI to conduct realistic technical interviews with real-time analysis of facial expressions, voice tone, and body language.

## Features

### 🎯 Core Features
- **AI-Powered Interviews** - Dynamic question generation based on your resume and role
- **Real-time Analysis** - Live tracking of facial expressions, voice metrics, and posture
- **Comprehensive Reports** - Detailed feedback on content, clarity, tone, body language, and fluency
- **Multiple Roles** - Support for Frontend, Backend, Full Stack, Data Science, Product Manager, and DevOps positions
- **Authentication System** - Secure user registration and login with JWT
- **Dark Mode** - Beautiful dark theme with smooth transitions
- **Interview History** - Track all your past interviews and reports

### 📊 Analysis Capabilities
- **Facial Analysis** - Eye contact, smile detection, emotion tracking using face-api.js
- **Voice Analysis** - Pitch, loudness, pace, filler word detection
- **Posture Tracking** - Head position and movement analysis
- **AI Feedback** - Intelligent suggestions powered by Groq's Llama 3.1

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- TailwindCSS for styling
- React Router for navigation
- face-api.js for facial recognition
- Web Speech API for voice recognition
- Web Audio API for voice analysis

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose (optional, falls back to in-memory storage)
- JWT authentication
- Groq API (Llama 3.1) for AI features
- bcrypt for password hashing

## Prerequisites

- Node.js 18+ and npm
- MongoDB (optional - works without it)
- Groq API key (free at https://console.groq.com)

## Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd <project-folder>
```

### 2. Install dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Configure environment variables

**Backend** - Create `backend/.env`:
```env
PORT=3001
GROQ_API_KEY=your_groq_api_key_here
MONGODB_URI=mongodb://localhost:27017/interview-app
JWT_SECRET=your-secret-key-change-in-production
```

**Frontend** - Create `frontend/.env` (if needed):
```env
VITE_API_URL=http://localhost:3001
```

### 4. Get your Groq API key
1. Go to https://console.groq.com
2. Sign up for a free account
3. Create an API key
4. Add it to `backend/.env`

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Usage

### Quick Start (Demo Mode)
1. Go to http://localhost:5173
2. Click "Try Demo" to skip registration
3. Select a job role and interview duration
4. Grant camera and microphone permissions
5. Start the interview!

### Full Experience (With Account)
1. Register for an account
2. Upload your resume (PDF/TXT) or paste resume text
3. Select job role and interview duration
4. Complete the interview
5. View your detailed report with AI feedback
6. Access your interview history anytime

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── types/          # TypeScript types
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context (theme, auth)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API and analysis services
│   │   └── types/          # TypeScript types
│   └── package.json
│
├── .gitignore
└── README.md
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Interview
- `POST /api/generate-questions` - Generate interview questions
- `POST /api/session/start` - Start interview session
- `POST /api/session/append-response` - Save interview response
- `POST /api/chat/next-question` - Get next AI question
- `POST /api/generate-report` - Generate interview report

### History
- `GET /api/sessions/history?userId=<id>` - Get user's interview sessions
- `GET /api/reports/history?userId=<id>` - Get user's reports
- `GET /api/report/:reportId` - Get specific report

## Features in Detail

### Real-time Analysis
The platform analyzes multiple aspects during the interview:
- **Facial Expressions**: Happiness, confidence, neutral, surprise, etc.
- **Eye Contact**: Percentage of time looking at camera
- **Voice Metrics**: Pitch variation, loudness, speaking pace
- **Filler Words**: Detection of "um", "uh", "like", etc.
- **Posture**: Head position and movement tracking

### AI Report Generation
After the interview, you receive:
- Overall score (0-100)
- Category scores: Content, Clarity, Tone, Body Language, Fluency
- Question-by-question feedback
- Strengths and weaknesses
- Suggested improvements
- Better answer examples

## Troubleshooting

### Camera/Microphone not working
- Ensure you've granted browser permissions
- Use Chrome or Edge (best compatibility)
- Check if other apps are using the camera/mic

### MongoDB connection issues
- The app works without MongoDB (uses in-memory storage)
- Check if MongoDB is running: `mongod --version`
- Verify MONGODB_URI in `.env`

### AI features not working
- Verify your Groq API key is correct
- Check backend console for API errors
- The app falls back to default questions/reports if API fails

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning and development.

## Acknowledgments

- Groq for providing free AI API access
- face-api.js for facial recognition
- The open-source community

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React, Node.js, and AI

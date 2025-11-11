# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- Hugging Face API key (FREE - get from https://huggingface.co/settings/tokens)

## Installation & Setup

### 1. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```
PORT=3001
HUGGINGFACE_API_KEY=hf_your_actual_key_here
NODE_ENV=development
```

To get your FREE Hugging Face API key:
1. Go to https://huggingface.co/join
2. Create a free account
3. Go to https://huggingface.co/settings/tokens
4. Click "New token" and copy it

Start backend:
```bash
npm run dev
```

Backend will run on http://localhost:3001

### 2. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:5173

## Usage Flow

1. Open http://localhost:5173 in your browser
2. Click "Get Started" or "Try Demo"
3. Upload resume (PDF/TXT) or paste text, select job role
4. Grant camera and microphone permissions
5. Click "Start Interview" - AI generates questions
6. Answer each question by clicking the mic button
7. View live transcription and metrics
8. After all questions, view detailed performance report

## Features Implemented

✅ Home page with feature overview
✅ Setup page with resume upload, role selection, camera/mic test
✅ Interview page with:
  - Live speech-to-text transcription (Web Speech API)
  - Real-time camera preview
  - Face analysis (face-api.js)
  - Audio analysis (Web Audio API)
  - TTS question reading
  - Chat history
✅ Report page with:
  - Overall score and category breakdown
  - Radar and bar charts
  - Question-by-question feedback
  - AI-generated improvement suggestions
✅ Backend API with:
  - Question generation (Hugging Face - Mistral-7B)
  - Session management
  - Report generation with AI feedback
  - Fallback to default questions if API fails

## Browser Requirements

- Chrome/Edge (recommended) - full Web Speech API support
- Firefox - limited speech recognition
- Safari - limited support

## Privacy Notes

- Face and audio analysis runs in-browser (privacy-first)
- Only transcripts and derived metrics sent to server
- No video/audio files uploaded unless explicitly needed

## Troubleshooting

**Camera/Mic not working:**
- Check browser permissions
- Use HTTPS or localhost only
- Try Chrome/Edge browsers

**Speech recognition not working:**
- Web Speech API requires Chrome/Edge
- Check microphone permissions
- Speak clearly and at normal pace

**Hugging Face API errors:**
- Verify API key in backend/.env (starts with hf_)
- Check https://huggingface.co/settings/tokens
- App will use fallback questions if API fails
- Review backend console logs

## Next Steps

- Add user authentication (AWS Cognito)
- Implement PDF export with charts
- Deploy to AWS (Lambda + S3 + CloudFront)
- Add MongoDB/DynamoDB for persistence
- Enhance face analysis with more metrics
- Add practice mode (no saving)

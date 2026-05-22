from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str

class AuthResponse(BaseModel):
    token: str
    user: UserResponse


# ── Questions ─────────────────────────────────────────────────────────────────

class Question(BaseModel):
    id: str
    text: str
    type: str = "technical"
    difficulty: str = "medium"
    expectedPoints: List[str] = []
    followUps: List[str] = []


# ── Session ───────────────────────────────────────────────────────────────────

class AudioMetrics(BaseModel):
    pitch: float = 0
    loudness: float = 0
    pace: float = 0
    fillerCount: int = 0

class FaceMetrics(BaseModel):
    smile: float = 0
    eyeContact: float = 0
    blinkRate: float = 0

class SessionResponse(BaseModel):
    questionId: str
    transcription: str
    timestamp: float
    audioMetrics: AudioMetrics
    faceMetrics: FaceMetrics

class StartSessionRequest(BaseModel):
    userId: Optional[str] = "guest"
    role: str
    questions: List[Any] = []
    resumeText: Optional[str] = ""

class AppendResponseRequest(BaseModel):
    sessionId: str
    questionId: str
    transcription: str
    audioMetrics: Dict[str, Any]
    faceMetrics: Dict[str, Any]
    timestamp: float

class NextQuestionRequest(BaseModel):
    sessionId: str
    conversationHistory: List[Dict[str, str]] = []
    resumeText: Optional[str] = ""

class GenerateReportRequest(BaseModel):
    sessionId: str
    resumeText: Optional[str] = ""


# ── Report ────────────────────────────────────────────────────────────────────

class Categories(BaseModel):
    content: float
    clarity: float
    tone: float
    bodyLanguage: float
    fluency: float

class QuestionFeedback(BaseModel):
    qid: str
    text: str
    score: float
    strengths: List[str]
    weaknesses: List[str]
    suggestedAnswer: str

class Report(BaseModel):
    sessionId: str
    role: str
    timestamp: str
    overallScore: float
    categories: Categories
    questionFeedback: List[Any] = []
    suggestions: List[str] = []
    facial: Optional[Any] = None
    voice: Optional[Any] = None
    posture: Optional[Any] = None

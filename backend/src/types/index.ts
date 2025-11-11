export interface Question {
  id: string;
  text: string;
  type: 'technical' | 'behavioral';
  difficulty: 'easy' | 'medium' | 'hard';
  expectedPoints: string[];
  followUps: string[];
}

export interface SessionResponse {
  questionId: string;
  transcription: string;
  timestamp: number;
  audioMetrics: {
    pitch: number;
    loudness: number;
    pace: number;
    fillerCount: number;
  };
  faceMetrics: {
    smile: number;
    eyeContact: number;
    blinkRate: number;
  };
}

export interface Session {
  sessionId: string;
  userId?: string;
  role: string;
  questions: Question[];
  responses: SessionResponse[];
  createdAt: string;
}

export interface Report {
  sessionId: string;
  userId?: string;
  role: string;
  timestamp: string;
  overallScore: number;
  categories: {
    content: number;
    clarity: number;
    tone: number;
    bodyLanguage: number;
    fluency: number;
  };
  questionFeedback: Array<{
    qid: string;
    text: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestedAnswer: string;
  }>;
  suggestions: string[];
}

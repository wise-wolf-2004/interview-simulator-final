export interface Question {
  id: string;
  text: string;
  type: 'technical' | 'behavioral';
  difficulty: 'easy' | 'medium' | 'hard';
  expectedPoints: string[];
  followUps: string[];
}

export interface AudioMetrics {
  pitch: number;
  loudness: number;
  pace: number;
  fillerCount: number;
}

export interface FaceMetrics {
  smile: number;
  eyeContact: number;
  blinkRate: number;
}

export interface SessionResponse {
  questionId: string;
  transcription: string;
  timestamp: number;
  audioMetrics: AudioMetrics;
  faceMetrics: FaceMetrics;
}

export interface Report {
  sessionId: string;
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

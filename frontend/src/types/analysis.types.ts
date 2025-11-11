export interface ComprehensiveAnalysisReport {
  sessionId: string;
  role: string;
  timestamp: string;
  duration: number; // seconds
  
  // Facial Analysis
  facial: {
    eyeContactScore: number;
    expressionBreakdown: {
      happy: number;
      neutral: number;
      sad: number;
      angry: number;
      surprised: number;
      fearful: number;
    };
    dominantExpression: string;
    blinkRate: number;
    headPoseStability: number;
    overallEngagement: number;
  };
  
  // Voice Analysis
  voice: {
    averagePitch: number;
    pitchVariation: number;
    averageLoudness: number;
    loudnessVariation: number;
    speakingPace: number;
    pauseCount: number;
    averagePauseDuration: number;
    fillerWordCount: number;
    fillerWordRate: number;
    toneQuality: string;
    confidenceScore: number;
    clarityScore: number;
  };
  
  // Posture Analysis
  posture: {
    stabilityScore: number;
    movementLevel: string;
    postureQuality: string;
    fidgetingDetected: boolean;
    averageMovement: number;
    overallBodyLanguageScore: number;
  };
  
  // Overall Scores
  overallScore: number;
  categories: {
    content: number;
    clarity: number;
    tone: number;
    bodyLanguage: number;
    fluency: number;
  };
  
  // Question Feedback
  questionFeedback: Array<{
    qid: string;
    text: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestedAnswer: string;
  }>;
  
  // AI Suggestions
  suggestions: string[];
}

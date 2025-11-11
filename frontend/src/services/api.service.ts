import axios from 'axios';
import type { Question, SessionResponse, Report } from '../types';

const API_BASE = 'http://localhost:3001/api';

export const api = {
  async generateQuestions(
    resumeFile: File | null,
    resumeText: string,
    role: string,
    difficulty: string = 'medium',
    numQuestions: number = 5
  ): Promise<{ questions: Question[]; resumeText: string }> {
    const formData = new FormData();
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }
    formData.append('resumeText', resumeText);
    formData.append('role', role);
    formData.append('difficulty', difficulty);
    formData.append('numQuestions', numQuestions.toString());

    const response = await axios.post(`${API_BASE}/generate-questions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async startSession(
    role: string,
    questions: Question[],
    resumeText: string,
    userId?: string | null
  ): Promise<{ sessionId: string; resumeText: string }> {
    const response = await axios.post(`${API_BASE}/session/start`, {
      role,
      questions,
      resumeText,
      userId,
    });
    return response.data;
  },

  async appendResponse(
    sessionId: string,
    questionId: string,
    transcription: string,
    audioMetrics: any,
    faceMetrics: any,
    timestamp: number
  ): Promise<{ saved: boolean }> {
    const response = await axios.post(`${API_BASE}/session/append-response`, {
      sessionId,
      questionId,
      transcription,
      audioMetrics,
      faceMetrics,
      timestamp,
    });
    return response.data;
  },

  async generateReport(sessionId: string, resumeText: string): Promise<{ reportId: string; report: Report }> {
    const response = await axios.post(`${API_BASE}/generate-report`, {
      sessionId,
      resumeText,
    });
    return response.data;
  },

  async getReport(reportId: string): Promise<Report> {
    const response = await axios.get(`${API_BASE}/report/${reportId}`);
    return response.data;
  },
};

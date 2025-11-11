import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { generateQuestions, generateReport } from '../services/ai.service.js';
import { 
  createSession, 
  findSessionById, 
  updateSession, 
  findSessionsByUserId,
  createReport as saveReport,
  findReportById,
  findReportsByUserId,
  findReportBySessionId
} from '../services/storage.service.js';
import type { Session, SessionResponse } from '../types/index.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/generate-questions', upload.single('resume'), async (req, res) => {
  try {
    let resumeText = req.body.resumeText || '';
    
    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        const pdfData = await pdfParse(req.file.buffer);
        resumeText = pdfData.text;
      } else {
        resumeText = req.file.buffer.toString('utf-8');
      }
    }

    const { role, difficulty = 'medium', numQuestions = 5 } = req.body;

    const questions = await generateQuestions(
      resumeText,
      role,
      difficulty,
      parseInt(numQuestions)
    );

    res.json({ questions, resumeText });
  } catch (error: any) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/session/start', async (req, res) => {
  try {
    const { userId, role, questions, resumeText } = req.body;
    const sessionId = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const sessionData = {
      sessionId,
      userId: userId || 'guest', // Default to 'guest' if no userId
      role,
      questions: questions || [],
      responses: [],
      createdAt: new Date().toISOString(),
    };

    await createSession(sessionData);
    console.log('✅ Session created:', sessionId, 'for user:', sessionData.userId);
    
    res.json({ sessionId, resumeText });
  } catch (error: any) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's interview history
router.get('/sessions/history', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const userSessions = await findSessionsByUserId(userId);
    const sessionList = userSessions.map(s => ({
      sessionId: s.sessionId,
      role: s.role,
      createdAt: s.createdAt,
      questionCount: s.questions.length,
      responseCount: s.responses.length,
    }));

    res.json({ sessions: sessionList });
  } catch (error: any) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's reports
router.get('/reports/history', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const userReports = await findReportsByUserId(userId);
    const reportList = userReports.map(report => ({
      reportId: report.reportId,
      sessionId: report.sessionId,
      role: report.role,
      timestamp: report.timestamp,
      overallScore: report.overallScore,
    }));

    res.json({ reports: reportList });
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/session/append-response', async (req, res) => {
  try {
    const { sessionId, questionId, transcription, audioMetrics, faceMetrics, timestamp } = req.body;
    
    console.log('📝 Appending response to session:', sessionId, 'question:', questionId);
    
    const session = await findSessionById(sessionId);
    if (!session) {
      console.error('❌ Session not found:', sessionId);
      return res.status(404).json({ error: 'Session not found' });
    }

    const response: SessionResponse = {
      questionId,
      transcription,
      timestamp,
      audioMetrics,
      faceMetrics,
    };

    session.responses.push(response);
    await updateSession(sessionId, { responses: session.responses });
    
    console.log('✅ Response saved to session:', sessionId, '- Total responses:', session.responses.length);
    res.json({ saved: true });
  } catch (error: any) {
    console.error('❌ Error saving response:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/chat/next-question', async (req, res) => {
  try {
    const { sessionId, conversationHistory, resumeText } = req.body;
    
    console.log('🤔 Generating next question for session:', sessionId);
    
    const session = await findSessionById(sessionId);
    if (!session) {
      console.error('❌ Session not found:', sessionId);
      return res.status(404).json({ error: 'Session not found' });
    }

    console.log('📚 Session found, role:', session.role, '- Conversation length:', conversationHistory?.length || 0);
    
    const { generateInterviewerResponse } = await import('../services/ai.service.js');
    const nextQuestion = await generateInterviewerResponse(
      session.role,
      conversationHistory,
      resumeText
    );

    console.log('✅ Next question generated:', nextQuestion.substring(0, 100));
    res.json({ question: nextQuestion });
  } catch (error: any) {
    console.error('❌ Error generating next question:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate-report', async (req, res) => {
  try {
    const { sessionId, resumeText } = req.body;
    
    const session = await findSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const report = await generateReport(
      sessionId,
      session.role,
      session.responses,
      session.questions,
      resumeText || 'No resume provided'
    );

    const reportId = `r_${Date.now()}`;
    const reportData = {
      ...report,
      reportId,
      userId: session.userId,
    };
    
    await saveReport(reportData);
    console.log('✅ Report saved:', reportId);

    res.json({ reportId, report: reportData });
  } catch (error: any) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/report/:reportId', async (req, res) => {
  try {
    const report = await findReportById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

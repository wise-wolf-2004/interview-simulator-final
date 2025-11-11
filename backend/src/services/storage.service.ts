import { isMongoDBConnected } from '../config/database.js';
import { User } from '../models/User.model.js';
import { Session } from '../models/Session.model.js';
import { Report } from '../models/Report.model.js';

// In-memory fallback storage
const memoryUsers = new Map<string, any>();
const memorySessions = new Map<string, any>();
const memoryReports = new Map<string, any>();

// USER OPERATIONS
export async function createUser(userData: any) {
  if (isMongoDBConnected()) {
    const user = await User.create(userData);
    return user.toObject();
  } else {
    // Generate ID for in-memory storage
    const userId = `u_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userWithId = {
      ...userData,
      _id: userId,
      id: userId,
    };
    memoryUsers.set(userId, userWithId);
    return userWithId;
  }
}

export async function findUserByEmail(email: string) {
  if (isMongoDBConnected()) {
    const user = await User.findOne({ email });
    return user ? user.toObject() : null;
  } else {
    return Array.from(memoryUsers.values()).find(u => u.email === email) || null;
  }
}

export async function findUserById(id: string) {
  if (isMongoDBConnected()) {
    const user = await User.findOne({ _id: id });
    return user ? user.toObject() : null;
  } else {
    return memoryUsers.get(id) || null;
  }
}

// SESSION OPERATIONS
export async function createSession(sessionData: any) {
  if (isMongoDBConnected()) {
    const session = await Session.create(sessionData);
    return session.toObject();
  } else {
    memorySessions.set(sessionData.sessionId, sessionData);
    return sessionData;
  }
}

export async function findSessionById(sessionId: string) {
  if (isMongoDBConnected()) {
    const session = await Session.findOne({ sessionId });
    return session ? session.toObject() : null;
  } else {
    return memorySessions.get(sessionId) || null;
  }
}

export async function updateSession(sessionId: string, updates: any) {
  if (isMongoDBConnected()) {
    const session = await Session.findOneAndUpdate(
      { sessionId },
      updates,
      { new: true }
    );
    return session ? session.toObject() : null;
  } else {
    const session = memorySessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
      memorySessions.set(sessionId, session);
      return session;
    }
    return null;
  }
}

export async function findSessionsByUserId(userId: string) {
  if (isMongoDBConnected()) {
    const sessions = await Session.find({ userId }).sort({ createdAt: -1 });
    return sessions.map(s => s.toObject());
  } else {
    return Array.from(memorySessions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

// REPORT OPERATIONS
export async function createReport(reportData: any) {
  if (isMongoDBConnected()) {
    const report = await Report.create(reportData);
    return report.toObject();
  } else {
    memoryReports.set(reportData.reportId, reportData);
    return reportData;
  }
}

export async function findReportById(reportId: string) {
  if (isMongoDBConnected()) {
    const report = await Report.findOne({ reportId });
    return report ? report.toObject() : null;
  } else {
    return memoryReports.get(reportId) || null;
  }
}

export async function findReportsByUserId(userId: string) {
  if (isMongoDBConnected()) {
    const reports = await Report.find({ userId }).sort({ timestamp: -1 });
    return reports.map(r => r.toObject());
  } else {
    return Array.from(memoryReports.values())
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export async function findReportBySessionId(sessionId: string) {
  if (isMongoDBConnected()) {
    const report = await Report.findOne({ sessionId });
    return report ? report.toObject() : null;
  } else {
    return Array.from(memoryReports.values()).find(r => r.sessionId === sessionId) || null;
  }
}

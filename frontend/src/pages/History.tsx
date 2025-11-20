import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import axios from 'axios';

interface SessionHistory {
  sessionId: string;
  role: string;
  createdAt: string;
  questionCount: number;
  responseCount: number;
}

interface ReportHistory {
  reportId: string;
  sessionId: string;
  role: string;
  timestamp: string;
  overallScore: number;
}

export default function History() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionHistory[]>([]);
  const [reports, setReports] = useState<ReportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'sessions'>('reports');
  const user = authService.getUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchHistory();
  }, [user, navigate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      // Fetch reports
      const reportsRes = await axios.get(
        `http://localhost:3001/api/reports/history?userId=${user?.id}`
      );
      setReports(reportsRes.data.reports || []);

      // Fetch sessions
      const sessionsRes = await axios.get(
        `http://localhost:3001/api/sessions/history?userId=${user?.id}`
      );
      setSessions(sessionsRes.data.sessions || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewReport = async (reportId: string) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/report/${reportId}`);
      navigate('/report', { state: { reportId, report: response.data } });
    } catch (error) {
      console.error('Error loading report:', error);
      alert('Failed to load report');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Interview History</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! View your past interviews and reports.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'reports'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reports ({reports.length})
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'sessions'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sessions ({sessions.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'reports' && (
              <div>
                {reports.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
                    <p className="text-gray-600 mb-6">
                      Complete an interview to see your first report here.
                    </p>
                    <button
                      onClick={() => navigate('/setup')}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                    >
                      Start New Interview
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div
                        key={report.reportId}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                        onClick={() => viewReport(report.reportId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{report.role}</h3>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(
                                  report.overallScore
                                )}`}
                              >
                                {report.overallScore}/100
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {formatDate(report.timestamp)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Session ID: {report.sessionId}
                            </p>
                          </div>
                          <div className="text-right">
                            <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                              View Report →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sessions' && (
              <div>
                {sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎤</div>
                    <h3 className="text-xl font-semibold mb-2">No Sessions Yet</h3>
                    <p className="text-gray-600 mb-6">
                      Start your first interview to see session history.
                    </p>
                    <button
                      onClick={() => navigate('/setup')}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                    >
                      Start New Interview
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div
                        key={session.sessionId}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">{session.role}</h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(session.createdAt)}
                            </p>
                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                              <span>📝 {session.questionCount} questions</span>
                              <span>💬 {session.responseCount} responses</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Session ID: {session.sessionId}
                            </p>
                          </div>
                          <div className="text-right">
                            {session.responseCount === session.questionCount ? (
                              <span className="text-green-600 font-medium">✓ Completed</span>
                            ) : (
                              <span className="text-yellow-600 font-medium">⏳ In Progress</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/setup')}
              className="p-4 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition text-left"
            >
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold mb-1">Start New Interview</h3>
              <p className="text-sm text-gray-600">Practice with AI interviewer</p>
            </button>
            <button
              onClick={() => navigate('/setup?demo=true')}
              className="p-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-left"
            >
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold mb-1">Quick Demo</h3>
              <p className="text-sm text-gray-600">Try without uploading resume</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

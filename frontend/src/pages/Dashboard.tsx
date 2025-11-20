import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import ThemeToggle from '../components/ThemeToggle';
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getUser());
  const [sessions, setSessions] = useState<SessionHistory[]>([]);
  const [reports, setReports] = useState<ReportHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const userId = user?.id;
      
      const [sessionsRes, reportsRes] = await Promise.all([
        axios.get(`http://localhost:3001/api/sessions/history?userId=${userId}`),
        axios.get(`http://localhost:3001/api/reports/history?userId=${userId}`),
      ]);

      setSessions(sessionsRes.data.sessions);
      setReports(reportsRes.data.reports);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.name}!</p>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => navigate('/setup')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition transform hover:scale-105"
            >
              New Interview
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Interviews</p>
                <p className="text-3xl font-bold text-gray-900">{sessions.length}</p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed Reports</p>
                <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {reports.length > 0
                    ? Math.round(reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length)
                    : 0}
                </p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Interview Reports</h2>
            {reports.length > 0 && (
              <Link to="/history" className="text-indigo-600 hover:text-indigo-700 font-medium">
                View All →
              </Link>
            )}
          </div>
          
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No interview reports yet</p>
              <button
                onClick={() => navigate('/setup')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                Start Your First Interview
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 5).map((report) => (
                <div
                  key={report.reportId}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                  onClick={async () => {
                    try {
                      const response = await axios.get(`http://localhost:3001/api/report/${report.reportId}`);
                      navigate('/report', { state: { reportId: report.reportId, report: response.data } });
                    } catch (error) {
                      console.error('Error loading report:', error);
                      alert('Failed to load report');
                    }
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.role}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(report.timestamp).toLocaleDateString()} at{' '}
                        {new Date(report.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-bold ${getScoreColor(report.overallScore)}`}>
                      {report.overallScore}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Interview History</h2>
            {sessions.length > 0 && (
              <Link to="/history" className="text-indigo-600 hover:text-indigo-700 font-medium">
                View All →
              </Link>
            )}
          </div>
          
          {sessions.length === 0 ? (
            <p className="text-gray-600">No interview sessions yet</p>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.sessionId}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{session.role}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(session.createdAt).toLocaleDateString()} •{' '}
                        {session.questionCount} questions • {session.responseCount} responses
                      </p>
                    </div>
                    <div className="text-gray-500">
                      {session.responseCount === session.questionCount ? '✅' : '⏳'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

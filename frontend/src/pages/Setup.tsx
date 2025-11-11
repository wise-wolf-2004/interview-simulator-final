import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api.service';
import { authService } from '../services/auth.service';
import type { Question } from '../types';

export default function Setup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [role, setRole] = useState('Frontend Developer');
  const [duration, setDuration] = useState(5); // in minutes
  const [cameraPermission, setCameraPermission] = useState(false);
  const [micPermission, setMicPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    requestPermissions();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setCameraPermission(true);
      setMicPermission(true);
    } catch (err) {
      console.error('Permission error:', err);
      setError('Camera and microphone access required');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleStartInterview = async () => {
    if (!cameraPermission || !micPermission) {
      setError('Please grant camera and microphone permissions');
      return;
    }

    if (!resumeText && !resumeFile && !isDemo) {
      setError('Please upload a resume or paste text');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const demoResume = isDemo ? 'Experienced software engineer with 5 years in React and TypeScript' : '';
      const { questions, resumeText: extractedText } = await api.generateQuestions(
        resumeFile,
        resumeText || demoResume,
        role,
        'medium',
        5
      );

      // Get userId from auth service
      const user = authService.getUser();
      const userId = user?.id || null;

      const { sessionId } = await api.startSession(role, questions, extractedText, userId);

      navigate('/interview', {
        state: { sessionId, questions, role, resumeText: extractedText, duration },
      });
    } catch (err: any) {
      console.error('Error starting interview:', err);
      setError(err.response?.data?.error || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Interview Setup</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>Full Stack Developer</option>
                  <option>Data Scientist</option>
                  <option>Product Manager</option>
                  <option>DevOps Engineer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={3}>3 Minutes (Quick)</option>
                  <option value={5}>5 Minutes (Standard)</option>
                  <option value={7}>7 Minutes (Detailed)</option>
                  <option value={10}>10 Minutes (Comprehensive)</option>
                </select>
              </div>
            </div>

            {!isDemo && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Resume (PDF/TXT)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.txt,.docx"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {resumeFile && (
                    <p className="text-sm text-gray-600 mt-2">Selected: {resumeFile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Paste Resume Text
                  </label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Paste your resume here..."
                  />
                </div>
              </>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-300 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <span className={`mr-2 ${cameraPermission ? 'text-green-500' : 'text-red-500'}`}>
                    {cameraPermission ? '✓' : '✗'}
                  </span>
                  Camera Preview
                </h3>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-48 bg-gray-900 rounded"
                />
              </div>

              <div className="border border-gray-300 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <span className={`mr-2 ${micPermission ? 'text-green-500' : 'text-red-500'}`}>
                    {micPermission ? '✓' : '✗'}
                  </span>
                  Microphone Test
                </h3>
                <div className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎤</div>
                    <p className="text-sm text-gray-600">
                      {micPermission ? 'Microphone ready' : 'Requesting permission...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartInterview}
              disabled={loading || !cameraPermission || !micPermission}
              className="w-full bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating Questions...' : 'Start Interview'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

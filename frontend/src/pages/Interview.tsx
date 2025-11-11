import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api.service';
import { loadFaceModels, analyzeFace, AudioAnalyzer, countFillerWords, calculatePace } from '../services/analysis.service';
import type { Question, AudioMetrics, FaceMetrics } from '../types';

interface LocationState {
  sessionId: string;
  questions: Question[];
  role: string;
  resumeText: string;
}

export default function Interview() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'question' | 'answer'; text: string }>>([]);
  const [timer, setTimer] = useState(0);
  const [liveMetrics, setLiveMetrics] = useState({ tone: 'Neutral', eyeContact: '0%' });
  const [initialized, setInitialized] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioAnalyzerRef = useRef<AudioAnalyzer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!state?.sessionId) {
      navigate('/setup');
      return;
    }

    initializeInterview();
    return cleanup;
  }, []);

  useEffect(() => {
    if (initialized && currentQuestionIndex < state.questions.length) {
      speakQuestion(state.questions[currentQuestionIndex].text);
      setChatHistory(prev => [...prev, { type: 'question', text: state.questions[currentQuestionIndex].text }]);
    }
  }, [currentQuestionIndex, initialized]);

  const initializeInterview = async () => {
    try {
      await loadFaceModels();
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      audioAnalyzerRef.current = new AudioAnalyzer();
      await audioAnalyzerRef.current.initialize(stream);

      setupSpeechRecognition();
      startTimer();
      startMetricsTracking();
      
      // Show first question after initialization
      setInitialized(true);
    } catch (err) {
      console.error('Initialization error:', err);
    }
  };

  const setupSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(prev => prev + finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognitionRef.current = recognition;
  };

  const speakQuestion = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const startTimer = () => {
    intervalRef.current = window.setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const startMetricsTracking = () => {
    setInterval(async () => {
      if (videoRef.current && audioAnalyzerRef.current) {
        const faceMetrics = await analyzeFace(videoRef.current);
        const audioMetrics = audioAnalyzerRef.current.getMetrics();

        setLiveMetrics({
          tone: audioMetrics.loudness > 50 ? 'Confident' : 'Calm',
          eyeContact: `${Math.round(faceMetrics.eyeContact * 100)}%`,
        });
      }
    }, 2000);
  };

  const handleStartRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
      setTranscript('');
    }
  };

  const handleStopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);

      const duration = (Date.now() - startTimeRef.current) / 1000;
      const wordCount = transcript.split(' ').filter(w => w.length > 0).length;

      const audioMetrics: AudioMetrics = {
        ...audioAnalyzerRef.current!.getMetrics(),
        pace: calculatePace(wordCount, duration),
        fillerCount: countFillerWords(transcript),
      };

      const faceMetrics: FaceMetrics = await analyzeFace(videoRef.current!);

      await api.appendResponse(
        state.sessionId,
        state.questions[currentQuestionIndex].id,
        transcript,
        audioMetrics,
        faceMetrics,
        Date.now()
      );

      setChatHistory(prev => [...prev, { type: 'answer', text: transcript }]);

      if (currentQuestionIndex < state.questions.length - 1) {
        setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 1000);
      } else {
        handleFinishInterview();
      }
    }
  };

  const handleFinishInterview = async () => {
    cleanup();
    
    try {
      const { reportId, report } = await api.generateReport(state.sessionId, state.resumeText);
      navigate('/report', { state: { reportId, report } });
    } catch (err) {
      console.error('Error generating report:', err);
    }
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (audioAnalyzerRef.current) {
      audioAnalyzerRef.current.cleanup();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    window.speechSynthesis.cancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!state?.sessionId) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{state.role}</h2>
              <p className="text-gray-600">Question {currentQuestionIndex + 1} of {state.questions.length}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono">{formatTime(timer)}</div>
              <div className="text-sm text-gray-600">Elapsed Time</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold mb-4">Chat History</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {chatHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg ${
                      item.type === 'question' ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-green-50 border-l-4 border-green-500'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1 uppercase text-gray-600">
                      {item.type === 'question' ? 'AI Interviewer' : 'Your Answer'}
                    </div>
                    <p className="text-gray-800">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold mb-4">Live Transcription</h3>
              <div className="bg-gray-50 p-4 rounded-lg min-h-32">
                <p className="text-gray-800">{transcript || 'Start speaking to see transcription...'}</p>
              </div>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`px-12 py-4 rounded-full font-semibold text-lg transition ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isRecording ? '⏹ Stop Recording' : '🎤 Start Recording'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold mb-4">Camera Preview</h3>
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full rounded-lg bg-gray-900"
              />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold mb-4">Live Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tone:</span>
                  <span className="font-semibold text-indigo-600">{liveMetrics.tone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Eye Contact:</span>
                  <span className="font-semibold text-indigo-600">{liveMetrics.eyeContact}</span>
                </div>
              </div>
            </div>

            {currentQuestionIndex === state.questions.length - 1 && (
              <button
                onClick={handleFinishInterview}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Finish Interview
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

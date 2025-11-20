import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api.service';
import { loadFaceModels, analyzeFace, AudioAnalyzer, countFillerWords, calculatePace } from '../services/analysis.service';
import { FacialAnalyzer } from '../services/facial-analysis.service';
import { VoiceAnalyzer } from '../services/voice-analysis.service';
import { PostureAnalyzer } from '../services/posture-analysis.service';
import * as faceapi from 'face-api.js';
import type { Question, AudioMetrics, FaceMetrics } from '../types';
import axios from 'axios';

interface LocationState {
  sessionId: string;
  questions: Question[];
  role: string;
  resumeText: string;
  duration: number; // in minutes
}

interface Message {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: number;
}

export default function InterviewChat() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timer, setTimer] = useState(0);
  const [liveMetrics, setLiveMetrics] = useState({
    tone: 'Neutral',
    eyeContact: '0%',
    volume: 'Normal',
    emotion: 'Neutral',
    posture: 'Centered',
    confidence: 0
  });
  const [isThinking, setIsThinking] = useState(false);
  const [sessionData, setSessionData] = useState<any[]>([]);
  const [timeUp, setTimeUp] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioAnalyzerRef = useRef<AudioAnalyzer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  
  // Analysis services
  const facialAnalyzerRef = useRef<FacialAnalyzer>(new FacialAnalyzer());
  const voiceAnalyzerRef = useRef<VoiceAnalyzer>(new VoiceAnalyzer());
  const postureAnalyzerRef = useRef<PostureAnalyzer>(new PostureAnalyzer());

  useEffect(() => {
    if (!state?.sessionId) {
      navigate('/setup');
      return;
    }

    initializeInterview();
    return cleanup;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeInterview = async () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

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

      // Start with first question
      const firstQuestion = state.questions[0]?.text || "Tell me about yourself and your background.";
      addMessage('interviewer', firstQuestion);
      speakQuestion(firstQuestion);
    } catch (err) {
      console.error('Initialization error:', err);
    }
  };

  const finalTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');

  const setupSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
    };

    recognition.onresult = (event: any) => {
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcriptPiece + ' ';
        } else {
          interim += transcriptPiece;
        }
      }

      interimTranscriptRef.current = interim;

      // Update display with both final and interim
      setTranscript(finalTranscriptRef.current + interimTranscriptRef.current);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);

      if (event.error === 'no-speech') {
        console.log('No speech detected, continuing...');
      } else if (event.error === 'audio-capture') {
        alert('Microphone not accessible. Please check permissions.');
      } else if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please allow microphone access.');
      }
    };

    recognition.onend = () => {
      console.log('🎤 Speech recognition ended');

      // If still recording, restart (for continuous recognition)
      if (isRecording) {
        console.log('Restarting recognition...');
        try {
          recognition.start();
        } catch (e) {
          console.error('Error restarting recognition:', e);
        }
      }
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
      setTimer(prev => {
        const newTime = prev + 1;
        const durationInSeconds = (state.duration || 5) * 60;

        // Check if time is up
        if (newTime >= durationInSeconds && !timeUp) {
          setTimeUp(true);
          // Auto-stop recording if active
          if (isRecording && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
          }
        }

        return newTime;
      });
    }, 1000);
  };

  const startMetricsTracking = () => {
    setInterval(async () => {
      if (videoRef.current && audioAnalyzerRef.current) {
        try {
          const faceDetection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

          const audioMetrics = audioAnalyzerRef.current.getMetrics();

          // Add to analyzers
          if (faceDetection) {
            facialAnalyzerRef.current.addDetection(faceDetection);
            
            // Track posture (using face box position)
            const box = faceDetection.detection.box;
            postureAnalyzerRef.current.addFacePosition(box.x, box.y);
          }
          
          voiceAnalyzerRef.current.addSample(audioMetrics.pitch, audioMetrics.loudness);

          // Calculate accurate live metrics
          const faceMetrics = await analyzeFace(videoRef.current);
          
          // Determine tone based on loudness
          let tone = 'Quiet';
          if (audioMetrics.loudness > 60) tone = 'Confident';
          else if (audioMetrics.loudness > 40) tone = 'Clear';
          else if (audioMetrics.loudness > 20) tone = 'Normal';
          
          // Determine volume level
          let volume = 'Low';
          if (audioMetrics.loudness > 70) volume = 'High';
          else if (audioMetrics.loudness > 40) volume = 'Good';
          else if (audioMetrics.loudness > 20) volume = 'Normal';
          
          // Get dominant emotion
          let emotion = 'Neutral';
          let maxEmotionValue = 0;
          if (faceDetection?.expressions) {
            const expressions = faceDetection.expressions;
            Object.entries(expressions).forEach(([key, value]) => {
              if (value > maxEmotionValue) {
                maxEmotionValue = value;
                emotion = key.charAt(0).toUpperCase() + key.slice(1);
              }
            });
          }
          
          // Determine posture
          let posture = 'Centered';
          if (faceDetection) {
            const box = faceDetection.detection.box;
            const videoWidth = videoRef.current.videoWidth;
            const centerX = box.x + box.width / 2;
            const relativePosition = centerX / videoWidth;
            
            if (relativePosition < 0.35) posture = 'Left';
            else if (relativePosition > 0.65) posture = 'Right';
            else posture = 'Centered';
          }
          
          // Calculate confidence score (0-100)
          const confidence = Math.round(
            (faceMetrics.eyeContact * 30) + // 30% weight on eye contact
            (faceMetrics.smile * 20) + // 20% weight on smile
            (Math.min(audioMetrics.loudness / 100, 1) * 30) + // 30% weight on volume
            (faceDetection ? 20 : 0) // 20% weight on face detection
          );

          setLiveMetrics({
            tone,
            eyeContact: `${Math.round(faceMetrics.eyeContact * 100)}%`,
            volume,
            emotion,
            posture,
            confidence
          });
        } catch (error) {
          console.error('Metrics tracking error:', error);
        }
      }
    }, 2000);
  };

  const addMessage = (role: 'interviewer' | 'candidate', content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: Date.now() }]);
  };

  const handleStartRecording = () => {
    if (timeUp) {
      return; // Don't allow recording after time is up
    }

    if (recognitionRef.current) {
      try {
        finalTranscriptRef.current = '';
        interimTranscriptRef.current = '';
        setTranscript('');
        recognitionRef.current.start();
        setIsRecording(true);
        startTimeRef.current = Date.now();
      } catch (error) {
        console.error('Error starting recognition:', error);
        alert('Could not start speech recognition. Please try again.');
      }
    }
  };

  const handleStopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);

      // Wait a moment for final results to come through
      await new Promise(resolve => setTimeout(resolve, 500));

      const finalText = finalTranscriptRef.current.trim();

      if (!finalText) {
        alert('No speech detected. Please try speaking again.');
        return;
      }

      // Add candidate response to chat
      addMessage('candidate', finalText);

      // Add transcript to voice analyzer
      voiceAnalyzerRef.current.addTranscript(finalText, Date.now());

      // Capture metrics
      const duration = (Date.now() - startTimeRef.current) / 1000;
      const wordCount = finalText.split(' ').filter(w => w.length > 0).length;

      const audioMetrics: AudioMetrics = {
        ...audioAnalyzerRef.current!.getMetrics(),
        pace: calculatePace(wordCount, duration),
        fillerCount: countFillerWords(finalText),
      };

      const faceMetrics: FaceMetrics = await analyzeFace(videoRef.current!);

      // Save session data
      setSessionData(prev => [...prev, {
        transcription: finalText,
        audioMetrics,
        faceMetrics,
        timestamp: Date.now(),
      }]);

      // Get AI follow-up question
      setIsThinking(true);
      try {
        const conversationHistory = messages.map(m => ({
          role: m.role === 'interviewer' ? 'assistant' : 'user',
          content: m.content,
        }));
        conversationHistory.push({ role: 'user', content: finalText });

        const response = await axios.post('http://localhost:3001/api/chat/next-question', {
          sessionId: state.sessionId,
          conversationHistory,
          resumeText: state.resumeText,
        });

        const nextQuestion = response.data.question;

        setTimeout(() => {
          addMessage('interviewer', nextQuestion);
          speakQuestion(nextQuestion);
          setIsThinking(false);
        }, 1000);
      } catch (error) {
        console.error('Error getting next question:', error);
        setIsThinking(false);
      }

      setTranscript('');
    }
  };

  const handleFinishInterview = async () => {
    if (isGeneratingReport) return;
    
    setIsGeneratingReport(true);
    console.log('🔄 Starting report generation...');
    console.log('Session data length:', sessionData.length);
    console.log('Messages length:', messages.length);

    try {
      // Generate comprehensive analysis reports
      console.log('📊 Generating analysis reports...');
      const facialReport = facialAnalyzerRef.current.generateReport(timer);
      const voiceReport = voiceAnalyzerRef.current.generateReport(timer);
      const postureReport = postureAnalyzerRef.current.generateReport();

      console.log('✅ Analysis Reports Generated:');
      console.log('Facial:', facialReport);
      console.log('Voice:', voiceReport);
      console.log('Posture:', postureReport);

      // Save all responses (if any)
      if (sessionData.length > 0) {
        console.log(`💾 Saving ${sessionData.length} responses...`);
        for (const data of sessionData) {
          await api.appendResponse(
            state.sessionId,
            `q${sessionData.indexOf(data) + 1}`,
            data.transcription,
            data.audioMetrics,
            data.faceMetrics,
            data.timestamp
          );
        }
        console.log('✅ Responses saved');
      } else {
        console.log('⚠️ No session data to save');
      }

      // Generate AI report
      console.log('🤖 Generating AI report...');
      const { reportId, report } = await api.generateReport(state.sessionId, state.resumeText);
      console.log('✅ AI report generated:', reportId);
      
      // Enhance report with real analysis data
      const enhancedReport = {
        ...report,
        facial: facialReport,
        voice: voiceReport,
        posture: postureReport,
        duration: timer,
      };

      console.log('🎉 Navigating to report page...');
      cleanup();
      navigate('/report', { state: { reportId, report: enhancedReport } });
    } catch (err: any) {
      console.error('❌ Error generating report:', err);
      alert(`Failed to generate report: ${err.message || 'Unknown error'}. Please check the console for details.`);
      setIsGeneratingReport(false);
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

  const getRemainingTime = () => {
    const durationInSeconds = (state.duration || 5) * 60;
    const remaining = Math.max(0, durationInSeconds - timer);
    return formatTime(remaining);
  };

  const getTimeColor = () => {
    const durationInSeconds = (state.duration || 5) * 60;
    const remaining = durationInSeconds - timer;

    if (remaining <= 30) return 'text-red-600';
    if (remaining <= 60) return 'text-orange-600';
    return 'text-gray-900';
  };

  if (!state?.sessionId) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{state.role} Interview</h2>
              <p className="text-gray-600">Interactive Conversation Mode • {state.duration} min</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-mono ${getTimeColor()}`}>
                {getRemainingTime()}
              </div>
              <div className="text-sm text-gray-600">
                {timeUp ? 'Time Up!' : 'Time Remaining'}
              </div>
            </div>
          </div>
          {timeUp && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-semibold">
                ⏰ Interview time has ended. Please finish your interview to see your report.
              </p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold mb-4">Interview Conversation</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg ${msg.role === 'interviewer'
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'bg-green-50 border-l-4 border-green-500'
                      }`}
                  >
                    <div className="text-xs font-semibold mb-1 uppercase text-gray-600">
                      {msg.role === 'interviewer' ? '🤖 AI Interviewer' : '👤 You'}
                    </div>
                    <p className="text-gray-800">{msg.content}</p>
                  </div>
                ))}
                {isThinking && (
                  <div className="p-4 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                    <div className="text-xs font-semibold mb-1 uppercase text-gray-600">
                      🤖 AI Interviewer
                    </div>
                    <p className="text-gray-600 italic">Thinking...</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold">Live Transcription</h4>
                  {isRecording && (
                    <span className="text-xs text-red-600 animate-pulse flex items-center">
                      <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                      Recording...
                    </span>
                  )}
                </div>
                <p className="text-gray-800 min-h-16 whitespace-pre-wrap">
                  {transcript || 'Click the mic button and start speaking clearly...'}
                </p>
                {isRecording && (
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: Speak clearly and pause briefly between sentences for better accuracy
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={isThinking || timeUp}
                  className={`flex-1 px-8 py-4 rounded-lg font-semibold text-lg transition ${isRecording
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed'
                    }`}
                >
                  {timeUp ? '⏰ Time Up' : isRecording ? '⏹ Stop & Send' : '🎤 Start Speaking'}
                </button>
                {(messages.length > 4 || timeUp) && (
                  <button
                    onClick={handleFinishInterview}
                    disabled={isGeneratingReport}
                    className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isGeneratingReport ? (
                      <>
                        <span className="animate-spin inline-block mr-2">⏳</span>
                        Generating Report...
                      </>
                    ) : (
                      'Finish Interview'
                    )}
                  </button>
                )}
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
                playsInline
                className="w-full h-64 rounded-lg bg-gray-900 object-cover"
              />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold mb-4">Live Metrics</h3>
              <div className="space-y-3">
                {/* Confidence Score */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Confidence</span>
                    <span className="text-sm font-bold text-indigo-600">{liveMetrics.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        liveMetrics.confidence >= 70 ? 'bg-green-500' :
                        liveMetrics.confidence >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${liveMetrics.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Eye Contact */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👁️</span>
                    <span className="text-sm text-gray-600">Eye Contact</span>
                  </div>
                  <span className="font-semibold text-indigo-600">{liveMetrics.eyeContact}</span>
                </div>

                {/* Tone */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎤</span>
                    <span className="text-sm text-gray-600">Tone</span>
                  </div>
                  <span className="font-semibold text-indigo-600">{liveMetrics.tone}</span>
                </div>

                {/* Volume */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔊</span>
                    <span className="text-sm text-gray-600">Volume</span>
                  </div>
                  <span className="font-semibold text-indigo-600">{liveMetrics.volume}</span>
                </div>

                {/* Emotion */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">😊</span>
                    <span className="text-sm text-gray-600">Emotion</span>
                  </div>
                  <span className="font-semibold text-indigo-600">{liveMetrics.emotion}</span>
                </div>

                {/* Posture */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧍</span>
                    <span className="text-sm text-gray-600">Posture</span>
                  </div>
                  <span className="font-semibold text-indigo-600">{liveMetrics.posture}</span>
                </div>

                {/* Exchanges */}
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💬</span>
                    <span className="text-sm text-gray-600">Exchanges</span>
                  </div>
                  <span className="font-semibold text-indigo-600">{Math.floor(messages.length / 2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

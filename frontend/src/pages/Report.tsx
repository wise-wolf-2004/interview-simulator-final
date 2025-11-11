import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { authService } from '../services/auth.service';
import type { Report as ReportType } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

interface LocationState {
  reportId: string;
  report: ReportType;
}

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [animatedScores, setAnimatedScores] = useState({
    overall: 0,
    content: 0,
    clarity: 0,
    tone: 0,
    bodyLanguage: 0,
    fluency: 0,
  });

  useEffect(() => {
    if (state?.report) {
      // Animate scores on load
      const duration = 1500;
      const steps = 60;
      const interval = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setAnimatedScores({
          overall: Math.round(state.report.overallScore * progress),
          content: Math.round(state.report.categories.content * progress),
          clarity: Math.round(state.report.categories.clarity * progress),
          tone: Math.round(state.report.categories.tone * progress),
          bodyLanguage: Math.round(state.report.categories.bodyLanguage * progress),
          fluency: Math.round(state.report.categories.fluency * progress),
        });

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [state?.report]);

  if (!state?.report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Report Found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { report } = state;

  // Use real analysis data if available
  const facial = (report as any).facial;
  const voice = (report as any).voice;
  const posture = (report as any).posture;
  
  const avgEyeContact = facial?.eyeContactScore || 75;

  const getScoreColor = (score: number, max: number = 100) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number, max: number = 100) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  // Eye Contact Doughnut Chart
  const eyeContactData = {
    labels: ['Maintained', 'Not Maintained'],
    datasets: [{
      data: [avgEyeContact, 100 - avgEyeContact],
      backgroundColor: ['#4f46e5', '#e5e7eb'],
      borderWidth: 0,
    }],
  };

  // Facial Expression Bar Chart
  const expressionData = {
    labels: ['Happy', 'Neutral', 'Sad', 'Surprised'],
    datasets: [{
      label: 'Expression %',
      data: facial ? [
        facial.expressionBreakdown.happy,
        facial.expressionBreakdown.neutral,
        facial.expressionBreakdown.sad,
        facial.expressionBreakdown.surprised,
      ] : [30, 50, 10, 10],
      backgroundColor: ['#10b981', '#6b7280', '#ef4444', '#f59e0b'],
      borderRadius: 8,
    }],
  };

  // Voice Tone Line Chart
  const toneData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
    datasets: [{
      label: 'Tone Energy',
      data: report.questionFeedback.map(q => q.score),
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    setIsDownloading(true);

    try {
      // Expand all questions for PDF
      const wasExpanded = expandedQuestion;
      setExpandedQuestion(null);

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the report
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f9fafb',
      });

      // Restore expanded state
      setExpandedQuestion(wasExpanded);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Add additional pages if content is long
      const pageHeight = imgHeight * ratio;
      let heightLeft = pageHeight - pdfHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', imgX, -pdfHeight + 10, imgWidth * ratio, imgHeight * ratio);
        heightLeft -= pdfHeight;
      }

      // Download
      const fileName = `Interview_Report_${report.role.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      console.log('✅ PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto" ref={reportRef}>
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Interview Performance Report
              </h1>
              <p className="text-gray-600 text-lg">
                AI-driven insights on your interview behavior and responses
              </p>
              <div className="flex gap-4 mt-4 text-sm text-gray-500">
                <span>📋 {report.role}</span>
                <span>📅 {new Date(report.timestamp).toLocaleDateString()}</span>
                <span>⏱️ {new Date(report.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(animatedScores.overall)}`}>
                {animatedScores.overall}
              </div>
              <div className="text-sm text-gray-600 font-semibold">Overall Score</div>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Generating...
                  </>
                ) : (
                  <>
                    📄 Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Summary Cards - 2x2 Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Eye Contact Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">👁️ Eye Contact</h3>
              <span className={`text-3xl font-bold ${getScoreColor(avgEyeContact)}`}>
                {avgEyeContact}%
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32">
                <Doughnut 
                  data={eyeContactData} 
                  options={{
                    cutout: '70%',
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  Eye contact maintained for <strong>{avgEyeContact}%</strong> of the session.
                </p>
                {facial && (
                  <p className="text-xs text-gray-700 mb-1">
                    Blink rate: {facial.blinkRate} blinks/min • Engagement: {facial.overallEngagement}%
                  </p>
                )}
                <p className="text-xs text-gray-500 italic">
                  💡 Consistent eye contact conveys attentiveness and confidence.
                </p>
              </div>
            </div>
          </div>

          {/* Facial Expression Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">😊 Facial Expression</h3>
              <span className="text-2xl">🟢</span>
            </div>
            <div className="h-32">
              <Bar 
                data={expressionData}
                options={{
                  indexAxis: 'y',
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { max: 100, ticks: { callback: (val) => val + '%' } },
                  },
                }}
              />
            </div>
            <p className="text-xs text-gray-500 italic mt-3">
              💡 A relaxed, positive expression helps create rapport with the interviewer.
            </p>
          </div>

          {/* Body Language Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">🧍 Body Language</h3>
              <span className={`text-3xl font-bold ${getScoreColor(animatedScores.bodyLanguage, 20)}`}>
                {animatedScores.bodyLanguage}/20
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-6xl">🧍‍♂️</div>
              <div className="flex-1">
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Posture Stability</span>
                    <span className="font-semibold">{posture?.stabilityScore || Math.round(animatedScores.bodyLanguage / 20 * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${posture?.stabilityScore || (animatedScores.bodyLanguage / 20 * 100)}%` }}
                    />
                  </div>
                </div>
                {posture && (
                  <p className="text-xs text-gray-700 mb-1">
                    Movement: {posture.movementLevel} • Quality: {posture.postureQuality}
                    {posture.fidgetingDetected && ' • ⚠️ Fidgeting detected'}
                  </p>
                )}
                <p className="text-xs text-gray-500 italic">
                  💡 Stable posture and open gestures create a confident impression.
                </p>
              </div>
            </div>
          </div>

          {/* Voice Tone Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">🎤 Voice Tone</h3>
              <span className={`text-3xl font-bold ${getScoreColor(animatedScores.tone, 20)}`}>
                {animatedScores.tone}/20
              </span>
            </div>
            <div className="h-32">
              <Line 
                data={toneData}
                options={{
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { min: 0, max: 20 },
                  },
                }}
              />
            </div>
            {voice && (
              <div className="text-xs text-gray-700 mt-2 space-y-1">
                <p>Pace: {voice.speakingPace} words/min • Pitch: {voice.averagePitch}Hz</p>
                <p>Tone: {voice.toneQuality} • Fillers: {voice.fillerWordCount} ({voice.fillerWordRate}/min)</p>
              </div>
            )}
            <p className="text-xs text-gray-500 italic mt-2">
              💡 Vocal energy and modulation affect clarity and confidence.
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Performance Breakdown</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { label: 'Content', score: animatedScores.content, icon: '📝', max: 20 },
              { label: 'Clarity', score: animatedScores.clarity, icon: '💬', max: 20 },
              { label: 'Tone', score: animatedScores.tone, icon: '🎵', max: 20 },
              { label: 'Body Language', score: animatedScores.bodyLanguage, icon: '🧍', max: 20 },
              { label: 'Fluency', score: animatedScores.fluency, icon: '⚡', max: 20 },
            ].map((cat, idx) => (
              <div key={idx} className={`border-2 rounded-xl p-4 text-center ${getScoreBgColor(cat.score, cat.max)}`}>
                <div className="text-3xl mb-2">{cat.icon}</div>
                <div className="text-sm font-semibold text-gray-700 mb-1">{cat.label}</div>
                <div className={`text-2xl font-bold ${getScoreColor(cat.score, cat.max)}`}>
                  {cat.score}/{cat.max}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Answer Analysis */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Detailed Answer Analysis</h2>
          <div className="space-y-4">
            {report.questionFeedback.map((feedback, idx) => (
              <div 
                key={idx}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition"
              >
                <button
                  onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                  className="w-full p-6 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4 text-left">
                    <span className="text-2xl font-bold text-indigo-600">Q{idx + 1}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{feedback.text}</p>
                      <div className="flex gap-3 mt-2 text-sm">
                        <span className={`px-3 py-1 rounded-full ${getScoreBgColor(feedback.score, 20)}`}>
                          Score: {feedback.score}/20
                        </span>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                          👁️ {avgEyeContact}%
                        </span>
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full">
                          😊 Positive
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-2xl">{expandedQuestion === idx ? '▲' : '▼'}</span>
                </button>

                {expandedQuestion === idx && (
                  <div className="p-6 bg-white border-t">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                          ✅ Strengths
                        </h4>
                        <ul className="space-y-2">
                          {feedback.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-green-500 mt-1">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                          📈 Areas to Improve
                        </h4>
                        <ul className="space-y-2">
                          {feedback.weaknesses.map((w, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-orange-500 mt-1">•</span>
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        💡 Suggested Improved Answer
                      </h4>
                      <p className="text-sm text-gray-800">{feedback.suggestedAnswer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Overall AI Feedback Summary */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🤖</span>
            <h2 className="text-2xl font-bold text-indigo-900">AI Summary Feedback</h2>
          </div>
          
          <div className="bg-white rounded-xl p-6 mb-4">
            <div className="flex gap-3 mb-4">
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                🔵 Calm Tone
              </span>
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                🟢 Positive Expression
              </span>
            </div>
            
            <div className="space-y-3 text-gray-700 leading-relaxed">
              {report.suggestions.map((suggestion, idx) => (
                <p key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold mt-1">•</span>
                  <span>{suggestion}</span>
                </p>
              ))}
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Generated by AI • Based on {report.questionFeedback.length} interview responses</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate(authService.isAuthenticated() ? '/dashboard' : '/')}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-8 py-4 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            ← {authService.isAuthenticated() ? 'Back to Dashboard' : 'Back to Home'}
          </button>
          <button
            onClick={() => navigate('/setup')}
            className="flex-1 bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Start New Interview →
          </button>
        </div>
      </div>
    </div>
  );
}

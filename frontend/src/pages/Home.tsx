import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 flex items-center justify-center p-4 transition-all duration-500 pt-20">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-8 md:p-12 transform transition-all duration-300 hover:shadow-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Voice-Driven Interview Simulator
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Practice interviews with AI-powered feedback on your voice, body language, and content
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg">
            <div className="text-3xl mb-3">🎤</div>
            <h3 className="font-semibold text-lg mb-2 dark:text-white">Live Transcription</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Real-time speech-to-text as you answer</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg">
            <div className="text-3xl mb-3">📹</div>
            <h3 className="font-semibold text-lg mb-2 dark:text-white">Expression Analysis</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Track facial expressions and body language</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-lg mb-2 dark:text-white">AI Feedback</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Get detailed improvement suggestions</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/register')}
            className="flex-1 bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex-1 bg-gray-200 text-gray-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-300 transition"
          >
            Sign In
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/setup?demo=true')}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Or try a demo without signing up →
          </button>
        </div>
      </div>
    </div>
  );
}

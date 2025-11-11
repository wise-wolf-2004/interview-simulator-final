# Get Your FREE Groq API Key

Groq provides FREE, ultra-fast AI inference. It's much faster than Hugging Face and completely free!

## Steps:

1. **Sign up at Groq:**
   - Go to https://console.groq.com/
   - Click "Sign Up" (use Google/GitHub or email)

2. **Get your API key:**
   - After signing in, go to https://console.groq.com/keys
   - Click "Create API Key"
   - Give it a name (e.g., "Interview Simulator")
   - Copy the key (starts with `gsk_`)

3. **Add to your .env file:**
   ```
   GROQ_API_KEY=gsk_your_actual_key_here
   ```

4. **Restart backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

## Benefits:

- ✅ **Completely FREE** - No credit card required
- ✅ **Super FAST** - Responses in <1 second
- ✅ **Generous limits** - 30 requests/minute on free tier
- ✅ **Llama 3 model** - High quality responses
- ✅ **Dynamic questions** - AI generates unique questions based on your resume

## Features Now Enabled:

1. **AI-Generated Questions** - Tailored to your resume and role
2. **Interactive Chatbot** - Natural conversation flow with follow-ups
3. **Smart Follow-ups** - AI asks relevant questions based on your answers
4. **AI-Powered Reports** - Detailed feedback on your performance

The app still works without the API key (uses fallback questions), but with Groq you get the full AI experience!

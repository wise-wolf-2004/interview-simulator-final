import Groq from 'groq-sdk';
import type { Question, SessionResponse, Report } from '../types/index.js';

// Using Llama 3.1 via Groq (FREE and FAST!)
const MODEL = 'llama-3.1-8b-instant';

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return null;
  }

  return new Groq({ apiKey });
}

export async function generateQuestions(
  resumeText: string,
  role: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  numQuestions: number = 5
): Promise<Question[]> {
  const groq = getGroqClient();

  if (!groq) {
    console.log('⚠ No Groq API key configured, using fallback questions');
    return generateDefaultQuestions(role, numQuestions, difficulty);
  }

  try {
    console.log('🤖 Calling Groq API to generate questions...');

    const prompt = `You are an expert technical interviewer for ${role} position. 
Create ${numQuestions} interview questions based on this resume: ${resumeText.substring(0, 800)}

Return ONLY a valid JSON array with this exact structure (no other text):
[{
  "id": "q1",
  "text": "Your interview question here",
  "type": "technical",
  "difficulty": "${difficulty}",
  "expectedPoints": ["key point 1", "key point 2"],
  "followUps": ["follow up question 1", "follow up question 2"]
}]`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '';
    console.log('📝 Groq response received, parsing...');

    const jsonMatch = content.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('✅ Generated', parsed.length, 'AI questions for', role);
        return parsed;
      }
    }

    console.log('⚠ Could not parse AI response, using fallback');
  } catch (error: any) {
    console.error('❌ Groq API error:', error.message || error);
    if (error.status) console.error('Status:', error.status);
  }

  console.log('⚠ Using fallback questions');
  return generateDefaultQuestions(role, numQuestions, difficulty);
}

export async function generateInterviewerResponse(
  role: string,
  conversationHistory: Array<{ role: string; content: string }>,
  resumeText: string
): Promise<string> {
  const groq = getGroqClient();

  if (!groq) {
    return "That's interesting. Can you elaborate more on your experience?";
  }

  try {
    const systemPrompt = `You are an experienced ${role} interviewer conducting a professional interview. 
Resume context: ${resumeText.substring(0, 500)}

Guidelines:
- Ask thoughtful follow-up questions based on candidate responses
- Probe deeper into technical details when relevant
- Keep questions concise (1-2 sentences)
- Be professional but friendly
- After 5-7 exchanges, naturally conclude the interview
- If candidate gives a good answer, acknowledge it briefly then ask next question`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
    ];

    const response = await groq.chat.completions.create({
      messages: messages as any,
      model: MODEL,
      temperature: 0.8,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || "Thank you for sharing. What else can you tell me?";
  } catch (error: any) {
    console.error('Groq API error:', error.message);
    return "That's interesting. Can you tell me more?";
  }
}

export async function generateReport(
  sessionId: string,
  role: string,
  responses: SessionResponse[],
  questions: Question[],
  resumeSummary: string
): Promise<Report> {
  const groq = getGroqClient();

  if (!groq) {
    console.log('⚠ No API key, using metrics-based analysis');
    return generateDefaultReport(sessionId, role, responses, questions);
  }

  try {
    const transcript = responses.map((r, i) =>
      `Q${i + 1}: ${questions[i]?.text}\nA: ${r.transcription}`
    ).join('\n\n');

    const prompt = `You are an interview coach. Evaluate this ${role} interview.

Transcript:
${transcript.substring(0, 2000)}

Audio: avg loudness ${responses.reduce((s, r) => s + r.audioMetrics.loudness, 0) / responses.length}, fillers ${responses.reduce((s, r) => s + r.audioMetrics.fillerCount, 0)}
Face: avg smile ${responses.reduce((s, r) => s + r.faceMetrics.smile, 0) / responses.length}, eye contact ${responses.reduce((s, r) => s + r.faceMetrics.eyeContact, 0) / responses.length}

Return ONLY valid JSON (no other text):
{
  "overallScore": 75,
  "categories": { "content": 15, "clarity": 14, "tone": 16, "bodyLanguage": 15, "fluency": 15 },
  "questionFeedback": [{ "qid": "q1", "text": "question", "score": 15, "strengths": ["strength"], "weaknesses": ["weakness"], "suggestedAnswer": "better answer" }],
  "suggestions": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"]
}`;

    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant that returns only valid JSON with no additional text.' },
        { role: 'user', content: prompt }
      ],
      model: MODEL,
      temperature: 0.5,
      max_tokens: 2000,
    });

    let content = response.choices[0]?.message?.content || '';
    console.log('📝 AI response received, length:', content.length);
    
    // Clean up response - remove markdown code blocks
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Find JSON object
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        let jsonStr = jsonMatch[0];
        
        // Fix common JSON issues
        jsonStr = jsonStr
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/\n/g, ' ') // Remove newlines
          .replace(/\s+/g, ' '); // Normalize whitespace
        
        const parsed = JSON.parse(jsonStr);
        
        if (parsed.overallScore && parsed.categories && parsed.questionFeedback) {
          console.log('✅ Generated AI report successfully');
          return {
            sessionId,
            role,
            timestamp: new Date().toISOString(),
            ...parsed,
          };
        } else {
          console.log('⚠️ AI response missing required fields');
        }
      } catch (parseError: any) {
        console.error('❌ JSON parse error:', parseError.message);
        console.log('Failed to parse:', jsonMatch[0].substring(0, 300));
      }
    } else {
      console.log('⚠️ No JSON object found in response');
    }
  } catch (error: any) {
    console.error('❌ Groq API error:', error.message);
  }

  console.log('⚠️ Using metrics-based analysis (fallback)');
  return generateDefaultReport(sessionId, role, responses, questions);
}

// Fallback functions
function generateDefaultQuestions(role: string, numQuestions: number, difficulty: string): Question[] {
  const questionBank: Record<string, string[]> = {
    'Frontend Developer': [
      'Tell me about your experience with React and modern JavaScript frameworks',
      'How do you approach responsive web design and cross-browser compatibility?',
      'Describe a challenging UI/UX problem you solved',
      'How do you optimize web application performance?',
      'What is your experience with state management libraries?',
      'Explain your approach to writing maintainable CSS',
      'How do you handle API integration in frontend applications?',
    ],
    'Backend Developer': [
      'Describe your experience with RESTful API design',
      'How do you handle database optimization and scaling?',
      'Tell me about your approach to API security',
      'What is your experience with microservices architecture?',
      'How do you implement caching strategies?',
      'Describe a complex backend system you built',
      'How do you handle error handling and logging?',
    ],
    'Full Stack Developer': [
      'Walk me through your full-stack development experience',
      'How do you ensure security across the entire application stack?',
      'Describe your approach to API design and integration',
      'How do you handle state management in complex applications?',
      'Tell me about a challenging full-stack project you completed',
      'How do you approach database design and optimization?',
      'What is your deployment and DevOps experience?',
    ],
    'Data Scientist': [
      'Describe your experience with machine learning algorithms',
      'How do you handle data preprocessing and cleaning?',
      'Tell me about a data science project you are proud of',
      'What is your approach to model evaluation and validation?',
      'How do you communicate technical findings to non-technical stakeholders?',
      'Describe your experience with data visualization',
      'How do you handle imbalanced datasets?',
    ],
    'Product Manager': [
      'How do you prioritize features in a product roadmap?',
      'Describe your approach to user research and validation',
      'Tell me about a product launch you managed',
      'How do you handle conflicting stakeholder requirements?',
      'What metrics do you use to measure product success?',
      'Describe a time you had to pivot a product strategy',
      'How do you work with engineering teams?',
    ],
    'DevOps Engineer': [
      'Describe your experience with CI/CD pipelines',
      'How do you implement infrastructure as code?',
      'Tell me about your approach to monitoring and alerting',
      'What is your experience with container orchestration?',
      'How do you ensure high availability and disaster recovery?',
      'Describe a complex infrastructure problem you solved',
      'What is your experience with cloud platforms?',
    ],
  };

  const questions = questionBank[role] || questionBank['Full Stack Developer'];

  return questions.slice(0, numQuestions).map((text, i) => ({
    id: `q${i + 1}`,
    text,
    type: i % 2 === 0 ? 'technical' : 'behavioral',
    difficulty: difficulty as any,
    expectedPoints: ['Clear explanation', 'Practical examples', 'Best practices'],
    followUps: ['Can you provide a specific example?', 'How would you handle edge cases?'],
  }));
}

function generateDefaultReport(
  sessionId: string,
  role: string,
  responses: SessionResponse[],
  questions: Question[]
): Report {
  const avgLoudness = responses.reduce((sum, r) => sum + r.audioMetrics.loudness, 0) / responses.length;
  const avgFillers = responses.reduce((sum, r) => sum + r.audioMetrics.fillerCount, 0) / responses.length;
  const avgSmile = responses.reduce((sum, r) => sum + r.faceMetrics.smile, 0) / responses.length;
  const avgEyeContact = responses.reduce((sum, r) => sum + r.faceMetrics.eyeContact, 0) / responses.length;

  const contentScore = Math.min(20, Math.max(10, 15 + Math.random() * 5));
  const clarityScore = Math.min(20, Math.max(10, 18 - avgFillers));
  const toneScore = Math.min(20, Math.max(10, avgLoudness / 5));
  const bodyLanguageScore = Math.min(20, Math.max(10, (avgSmile + avgEyeContact) * 10));
  const fluencyScore = Math.min(20, Math.max(10, 18 - avgFillers * 2));

  const overallScore = Math.round(contentScore + clarityScore + toneScore + bodyLanguageScore + fluencyScore);

  return {
    sessionId,
    role,
    timestamp: new Date().toISOString(),
    overallScore,
    categories: {
      content: Math.round(contentScore),
      clarity: Math.round(clarityScore),
      tone: Math.round(toneScore),
      bodyLanguage: Math.round(bodyLanguageScore),
      fluency: Math.round(fluencyScore),
    },
    questionFeedback: questions.map((q, i) => ({
      qid: q.id,
      text: q.text,
      score: Math.round(12 + Math.random() * 6),
      strengths: ['Good technical understanding', 'Clear communication'],
      weaknesses: avgFillers > 3 ? ['Reduce filler words', 'Be more concise'] : ['Add more specific examples'],
      suggestedAnswer: `A strong answer would include: ${q.expectedPoints.join(', ')}. Consider providing concrete examples from your experience.`,
    })),
    suggestions: [
      avgFillers > 3 ? 'Practice reducing filler words like "um" and "uh"' : 'Maintain your clear speaking style',
      avgLoudness < 30 ? 'Speak with more confidence and volume' : 'Good vocal projection',
      avgEyeContact < 0.5 ? 'Maintain better eye contact with the camera' : 'Excellent eye contact',
      'Provide more specific examples from your experience',
      'Practice common interview questions to improve fluency',
    ],
  };
}

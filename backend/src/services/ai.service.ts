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
    console.log('📄 Resume length:', resumeText.length, 'characters');

    // Use full resume text, but limit to 4000 chars to stay within token limits
    const resumeContent = resumeText.substring(0, 4000);

    const prompt = `You are an expert technical interviewer for ${role} position. 

Analyze this complete resume and create ${numQuestions} personalized interview questions:

RESUME:
${resumeContent}

Focus on:
- Technical skills mentioned
- Projects and their technologies
- Work experience and achievements
- Education and certifications
- Specific tools and frameworks listed

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
      max_tokens: 2500, // Increased for more detailed questions
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
    // Use more resume context for better follow-up questions
    const resumeContext = resumeText.substring(0, 2000);

    const systemPrompt = `You are an experienced ${role} interviewer conducting a professional interview. 

CANDIDATE'S RESUME SUMMARY:
${resumeContext}

Guidelines:
- Ask thoughtful follow-up questions based on candidate responses and their resume
- Reference specific projects, skills, or experiences from their resume when relevant
- Probe deeper into technical details when appropriate
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
      max_tokens: 250, // Increased for more detailed follow-ups
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

    // Use more transcript content for better analysis (up to 3500 chars)
    const transcriptContent = transcript.substring(0, 3500);

    const avgLoudness = responses.reduce((s, r) => s + r.audioMetrics.loudness, 0) / responses.length;
    const totalFillers = responses.reduce((s, r) => s + r.audioMetrics.fillerCount, 0);
    const avgSmile = responses.reduce((s, r) => s + r.faceMetrics.smile, 0) / responses.length;
    const avgEyeContact = responses.reduce((s, r) => s + r.faceMetrics.eyeContact, 0) / responses.length;

    const prompt = `You are an interview coach. Evaluate this ${role} interview comprehensively.

INTERVIEW TRANSCRIPT:
${transcriptContent}

PERFORMANCE METRICS:
- Voice: Average loudness ${avgLoudness.toFixed(1)}, Total filler words: ${totalFillers}
- Facial: Average smile ${avgSmile.toFixed(2)}, Average eye contact ${avgEyeContact.toFixed(2)}
- Total responses: ${responses.length}

Provide detailed evaluation considering:
1. Technical knowledge and accuracy
2. Communication clarity and structure
3. Confidence and tone
4. Body language and engagement
5. Speaking fluency and pace

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
      max_tokens: 3000, // Increased for comprehensive feedback
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
    'Mobile Developer': [
      'Describe your experience with mobile app development',
      'How do you handle different screen sizes and device compatibility?',
      'Tell me about your approach to mobile app performance optimization',
      'What is your experience with native vs cross-platform development?',
      'How do you handle offline functionality in mobile apps?',
      'Describe your approach to mobile app security',
      'What is your experience with app store deployment?',
    ],
    'Software Engineer': [
      'Tell me about your software development experience',
      'How do you approach system design and architecture?',
      'Describe a complex technical problem you solved',
      'What is your experience with design patterns?',
      'How do you ensure code quality and maintainability?',
      'Tell me about your experience with testing and CI/CD',
      'How do you approach performance optimization?',
    ],
    'Web Developer': [
      'Describe your web development experience',
      'How do you ensure website accessibility and SEO?',
      'Tell me about your experience with modern web technologies',
      'What is your approach to web performance optimization?',
      'How do you handle browser compatibility issues?',
      'Describe your experience with web security best practices',
      'What is your experience with content management systems?',
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
    'Data Analyst': [
      'Tell me about your experience with data analysis tools',
      'How do you approach data visualization and reporting?',
      'Describe a time when your analysis led to business insights',
      'What is your experience with SQL and database querying?',
      'How do you ensure data quality and accuracy?',
      'Tell me about your experience with statistical analysis',
      'How do you present complex data to non-technical audiences?',
    ],
    'Machine Learning Engineer': [
      'Describe your experience with ML model development and deployment',
      'How do you approach feature engineering?',
      'Tell me about your experience with deep learning frameworks',
      'What is your approach to model optimization and tuning?',
      'How do you handle model monitoring in production?',
      'Describe your experience with MLOps practices',
      'What is your experience with distributed training?',
    ],
    'AI Engineer': [
      'Tell me about your experience with AI systems development',
      'How do you approach natural language processing tasks?',
      'Describe your experience with computer vision applications',
      'What is your approach to AI model evaluation?',
      'How do you handle AI ethics and bias in models?',
      'Tell me about your experience with AI deployment at scale',
      'What is your experience with reinforcement learning?',
    ],
    'Data Engineer': [
      'Describe your experience with data pipeline development',
      'How do you approach data warehouse design?',
      'Tell me about your experience with ETL processes',
      'What is your approach to data quality and validation?',
      'How do you handle large-scale data processing?',
      'Describe your experience with cloud data platforms',
      'What is your experience with real-time data streaming?',
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
    'Cloud Engineer': [
      'Tell me about your experience with cloud architecture',
      'How do you approach cloud cost optimization?',
      'Describe your experience with cloud security best practices',
      'What is your approach to cloud migration strategies?',
      'How do you handle multi-cloud or hybrid cloud environments?',
      'Tell me about your experience with serverless architectures',
      'What is your experience with cloud automation?',
    ],
    'Site Reliability Engineer': [
      'Describe your experience with system reliability and uptime',
      'How do you approach incident management and response?',
      'Tell me about your experience with monitoring and observability',
      'What is your approach to capacity planning?',
      'How do you implement SLOs and SLIs?',
      'Describe your experience with automation and tooling',
      'What is your experience with performance optimization?',
    ],
    'System Administrator': [
      'Tell me about your experience with system administration',
      'How do you approach server management and maintenance?',
      'Describe your experience with network configuration',
      'What is your approach to system security and hardening?',
      'How do you handle backup and disaster recovery?',
      'Tell me about your experience with automation scripts',
      'What is your experience with virtualization technologies?',
    ],
    'Security Engineer': [
      'Describe your experience with security architecture',
      'How do you approach threat modeling and risk assessment?',
      'Tell me about your experience with penetration testing',
      'What is your approach to security incident response?',
      'How do you implement security best practices in development?',
      'Describe your experience with security compliance standards',
      'What is your experience with security automation?',
    ],
    'QA Engineer': [
      'Tell me about your experience with quality assurance',
      'How do you approach test planning and strategy?',
      'Describe your experience with manual and automated testing',
      'What is your approach to bug tracking and reporting?',
      'How do you ensure test coverage?',
      'Tell me about your experience with performance testing',
      'What is your experience with API testing?',
    ],
    'Test Automation Engineer': [
      'Describe your experience with test automation frameworks',
      'How do you approach test automation strategy?',
      'Tell me about your experience with CI/CD integration',
      'What is your approach to maintaining test automation suites?',
      'How do you handle flaky tests?',
      'Describe your experience with different testing types',
      'What is your experience with test reporting and metrics?',
    ],
    'UI/UX Designer': [
      'Tell me about your design process and methodology',
      'How do you approach user research and testing?',
      'Describe a challenging design problem you solved',
      'What is your experience with design tools and prototyping?',
      'How do you balance user needs with business requirements?',
      'Tell me about your experience with accessibility design',
      'What is your approach to design systems?',
    ],
    'Product Manager': [
      'How do you prioritize features in a product roadmap?',
      'Describe your approach to user research and validation',
      'Tell me about a product launch you managed',
      'What metrics do you use to measure product success?',
      'How do you handle conflicting stakeholder requirements?',
      'Describe a time you had to pivot a product strategy',
      'What is your experience working with engineering teams?',
    ],
    'Product Designer': [
      'Tell me about your product design process',
      'How do you balance aesthetics with functionality?',
      'Describe your experience with user-centered design',
      'What is your approach to design iteration and feedback?',
      'How do you collaborate with product managers and engineers?',
      'Tell me about your experience with design systems',
      'What is your approach to measuring design success?',
    ],
    'Business Analyst': [
      'Describe your experience with business analysis',
      'How do you gather and document requirements?',
      'Tell me about your experience with process improvement',
      'What is your approach to stakeholder management?',
      'How do you translate business needs into technical requirements?',
      'Describe your experience with data analysis and reporting',
      'What is your experience with business process modeling?',
    ],
    'Technical Writer': [
      'Tell me about your technical writing experience',
      'How do you approach documentation for different audiences?',
      'Describe your experience with API documentation',
      'What is your approach to keeping documentation up-to-date?',
      'How do you collaborate with engineering teams?',
      'Tell me about your experience with documentation tools',
      'What is your approach to information architecture?',
    ],
    'Scrum Master': [
      'Describe your experience with Agile methodologies',
      'How do you facilitate sprint planning and retrospectives?',
      'Tell me about a time you resolved team conflicts',
      'What is your approach to removing impediments?',
      'How do you measure team velocity and productivity?',
      'Describe your experience with scaling Agile practices',
      'What is your approach to coaching teams on Agile principles?',
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

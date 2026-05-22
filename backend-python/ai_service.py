import os
import json
import re
import random
from groq import Groq
from typing import List, Optional
from models import Question, Report

MODEL = "llama-3.1-8b-instant"


def get_groq_client() -> Optional[Groq]:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key == "your_groq_api_key_here":
        return None
    return Groq(api_key=api_key)


# ── Question Generation ───────────────────────────────────────────────────────

async def generate_questions(
    resume_text: str,
    role: str,
    difficulty: str = "medium",
    num_questions: int = 5,
) -> List[dict]:
    groq = get_groq_client()
    if not groq:
        print("⚠ No Groq API key - using fallback questions")
        return generate_default_questions(role, num_questions, difficulty)

    resume_content = resume_text[:4000]
    print(f"📄 Resume length: {len(resume_text)} characters")
    print("🤖 Calling Groq API to generate questions...")

    prompt = f"""You are an expert technical interviewer for {role} position.

Analyze this complete resume and create {num_questions} personalized interview questions:

RESUME:
{resume_content}

Focus on:
- Technical skills mentioned
- Projects and their technologies
- Work experience and achievements
- Education and certifications
- Specific tools and frameworks listed

Return ONLY a valid JSON array with this exact structure (no other text):
[{{
  "id": "q1",
  "text": "Your interview question here",
  "type": "technical",
  "difficulty": "{difficulty}",
  "expectedPoints": ["key point 1", "key point 2"],
  "followUps": ["follow up question 1", "follow up question 2"]
}}]"""

    try:
        response = groq.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=MODEL,
            temperature=0.7,
            max_tokens=2500,
        )
        content = response.choices[0].message.content or ""
        match = re.search(r"\[[\s\S]*\]", content)
        if match:
            parsed = json.loads(match.group())
            if isinstance(parsed, list) and len(parsed) > 0:
                print(f"✅ Generated {len(parsed)} AI questions for {role}")
                return parsed
        print("⚠ Could not parse AI response, using fallback")
    except Exception as e:
        print(f"❌ Groq API error: {e}")

    return generate_default_questions(role, num_questions, difficulty)


# ── Follow-up Question ────────────────────────────────────────────────────────

async def generate_interviewer_response(
    role: str,
    conversation_history: List[dict],
    resume_text: str,
) -> str:
    groq = get_groq_client()
    if not groq:
        return "That's interesting. Can you elaborate more on your experience?"

    resume_context = resume_text[:2000]
    system_prompt = f"""You are an experienced {role} interviewer conducting a professional interview.

CANDIDATE'S RESUME SUMMARY:
{resume_context}

Guidelines:
- Ask thoughtful follow-up questions based on candidate responses and their resume
- Reference specific projects, skills, or experiences from their resume when relevant
- Probe deeper into technical details when appropriate
- Keep questions concise (1-2 sentences)
- Be professional but friendly
- After 5-7 exchanges, naturally conclude the interview
- If candidate gives a good answer, acknowledge it briefly then ask next question"""

    try:
        messages = [{"role": "system", "content": system_prompt}] + conversation_history
        response = groq.chat.completions.create(
            messages=messages,
            model=MODEL,
            temperature=0.8,
            max_tokens=250,
        )
        return response.choices[0].message.content or "Thank you for sharing. What else can you tell me?"
    except Exception as e:
        print(f"Groq API error: {e}")
        return "That's interesting. Can you tell me more?"


# ── Report Generation ─────────────────────────────────────────────────────────

async def generate_report(
    session_id: str,
    role: str,
    responses: List[dict],
    questions: List[dict],
    resume_summary: str,
) -> dict:
    groq = get_groq_client()
    if not groq:
        print("⚠ No API key, using metrics-based analysis")
        return generate_default_report(session_id, role, responses, questions)

    transcript_parts = []
    for i, r in enumerate(responses):
        q_text = questions[i]["text"] if i < len(questions) else "Question"
        transcript_parts.append(f"Q{i+1}: {q_text}\nA: {r.get('transcription', '')}")
    transcript = "\n\n".join(transcript_parts)[:3500]

    def safe_avg(key, sub=None):
        vals = []
        for r in responses:
            m = r.get(sub, r) if sub else r
            if isinstance(m, dict) and key in m:
                vals.append(float(m[key]))
        return sum(vals) / len(vals) if vals else 0

    avg_loudness = safe_avg("loudness", "audioMetrics")
    total_fillers = sum(r.get("audioMetrics", {}).get("fillerCount", 0) for r in responses)
    avg_smile = safe_avg("smile", "faceMetrics")
    avg_eye = safe_avg("eyeContact", "faceMetrics")

    prompt = f"""You are an interview coach. Evaluate this {role} interview comprehensively.

INTERVIEW TRANSCRIPT:
{transcript}

PERFORMANCE METRICS:
- Voice: Average loudness {avg_loudness:.1f}, Total filler words: {total_fillers}
- Facial: Average smile {avg_smile:.2f}, Average eye contact {avg_eye:.2f}
- Total responses: {len(responses)}

Provide detailed evaluation considering:
1. Technical knowledge and accuracy
2. Communication clarity and structure
3. Confidence and tone
4. Body language and engagement
5. Speaking fluency and pace

Return ONLY valid JSON (no other text):
{{
  "overallScore": 75,
  "categories": {{ "content": 15, "clarity": 14, "tone": 16, "bodyLanguage": 15, "fluency": 15 }},
  "questionFeedback": [{{ "qid": "q1", "text": "question", "score": 15, "strengths": ["strength"], "weaknesses": ["weakness"], "suggestedAnswer": "better answer" }}],
  "suggestions": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"]
}}"""

    try:
        response = groq.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful assistant that returns only valid JSON with no additional text."},
                {"role": "user", "content": prompt},
            ],
            model=MODEL,
            temperature=0.5,
            max_tokens=3000,
        )
        content = response.choices[0].message.content or ""
        content = re.sub(r"```json\n?", "", content)
        content = re.sub(r"```\n?", "", content).strip()

        match = re.search(r"\{[\s\S]*\}", content)
        if match:
            json_str = match.group()
            json_str = re.sub(r",(\s*[}\]])", r"\1", json_str)
            parsed = json.loads(json_str)
            if parsed.get("overallScore") and parsed.get("categories") and parsed.get("questionFeedback"):
                print("✅ Generated AI report successfully")
                from datetime import datetime
                return {
                    "sessionId": session_id,
                    "role": role,
                    "timestamp": datetime.utcnow().isoformat(),
                    **parsed,
                }
    except Exception as e:
        print(f"❌ Report generation error: {e}")

    print("⚠️ Using metrics-based analysis (fallback)")
    return generate_default_report(session_id, role, responses, questions)


# ── Fallback Questions ────────────────────────────────────────────────────────

QUESTION_BANK = {
    "Frontend Developer": [
        "Tell me about your experience with React and modern JavaScript frameworks",
        "How do you approach responsive web design and cross-browser compatibility?",
        "Describe a challenging UI/UX problem you solved",
        "How do you optimize web application performance?",
        "What is your experience with state management libraries?",
        "Explain your approach to writing maintainable CSS",
        "How do you handle API integration in frontend applications?",
    ],
    "Backend Developer": [
        "Describe your experience with RESTful API design",
        "How do you handle database optimization and scaling?",
        "Tell me about your approach to API security",
        "What is your experience with microservices architecture?",
        "How do you implement caching strategies?",
        "Describe a complex backend system you built",
        "How do you handle error handling and logging?",
    ],
    "Full Stack Developer": [
        "Walk me through your full-stack development experience",
        "How do you ensure security across the entire application stack?",
        "Describe your approach to API design and integration",
        "How do you handle state management in complex applications?",
        "Tell me about a challenging full-stack project you completed",
        "How do you approach database design and optimization?",
        "What is your deployment and DevOps experience?",
    ],
    "Mobile Developer": [
        "Describe your experience with mobile app development",
        "How do you handle different screen sizes and device compatibility?",
        "Tell me about your approach to mobile app performance optimization",
        "What is your experience with native vs cross-platform development?",
        "How do you handle offline functionality in mobile apps?",
        "Describe your approach to mobile app security",
        "What is your experience with app store deployment?",
    ],
    "Software Engineer": [
        "Tell me about your software development experience",
        "How do you approach system design and architecture?",
        "Describe a complex technical problem you solved",
        "What is your experience with design patterns?",
        "How do you ensure code quality and maintainability?",
        "Tell me about your experience with testing and CI/CD",
        "How do you approach performance optimization?",
    ],
    "Data Scientist": [
        "Describe your experience with machine learning algorithms",
        "How do you handle data preprocessing and cleaning?",
        "Tell me about a data science project you are proud of",
        "What is your approach to model evaluation and validation?",
        "How do you communicate technical findings to non-technical stakeholders?",
        "Describe your experience with data visualization",
        "How do you handle imbalanced datasets?",
    ],
    "Data Analyst": [
        "Tell me about your experience with data analysis tools",
        "How do you approach data visualization and reporting?",
        "Describe a time when your analysis led to business insights",
        "What is your experience with SQL and database querying?",
        "How do you ensure data quality and accuracy?",
        "Tell me about your experience with statistical analysis",
        "How do you present complex data to non-technical audiences?",
    ],
    "Machine Learning Engineer": [
        "Describe your experience with ML model development and deployment",
        "How do you approach feature engineering?",
        "Tell me about your experience with deep learning frameworks",
        "What is your approach to model optimization and tuning?",
        "How do you handle model monitoring in production?",
        "Describe your experience with MLOps practices",
        "What is your experience with distributed training?",
    ],
    "AI Engineer": [
        "Tell me about your experience with AI systems development",
        "How do you approach natural language processing tasks?",
        "Describe your experience with computer vision applications",
        "What is your approach to AI model evaluation?",
        "How do you handle AI ethics and bias in models?",
        "Tell me about your experience with AI deployment at scale",
        "What is your experience with reinforcement learning?",
    ],
    "Data Engineer": [
        "Describe your experience with data pipeline development",
        "How do you approach data warehouse design?",
        "Tell me about your experience with ETL processes",
        "What is your approach to data quality and validation?",
        "How do you handle large-scale data processing?",
        "Describe your experience with cloud data platforms",
        "What is your experience with real-time data streaming?",
    ],
    "DevOps Engineer": [
        "Describe your experience with CI/CD pipelines",
        "How do you implement infrastructure as code?",
        "Tell me about your approach to monitoring and alerting",
        "What is your experience with container orchestration?",
        "How do you ensure high availability and disaster recovery?",
        "Describe a complex infrastructure problem you solved",
        "What is your experience with cloud platforms?",
    ],
    "Cloud Engineer": [
        "Tell me about your experience with cloud architecture",
        "How do you approach cloud cost optimization?",
        "Describe your experience with cloud security best practices",
        "What is your approach to cloud migration strategies?",
        "How do you handle multi-cloud or hybrid cloud environments?",
        "Tell me about your experience with serverless architectures",
        "What is your experience with cloud automation?",
    ],
    "Site Reliability Engineer": [
        "Describe your experience with system reliability and uptime",
        "How do you approach incident management and response?",
        "Tell me about your experience with monitoring and observability",
        "What is your approach to capacity planning?",
        "How do you implement SLOs and SLIs?",
        "Describe your experience with automation and tooling",
        "What is your experience with performance optimization?",
    ],
    "Security Engineer": [
        "Describe your experience with security architecture",
        "How do you approach threat modeling and risk assessment?",
        "Tell me about your experience with penetration testing",
        "What is your approach to security incident response?",
        "How do you implement security best practices in development?",
        "Describe your experience with security compliance standards",
        "What is your experience with security automation?",
    ],
    "QA Engineer": [
        "Tell me about your experience with quality assurance",
        "How do you approach test planning and strategy?",
        "Describe your experience with manual and automated testing",
        "What is your approach to bug tracking and reporting?",
        "How do you ensure test coverage?",
        "Tell me about your experience with performance testing",
        "What is your experience with API testing?",
    ],
    "UI/UX Designer": [
        "Tell me about your design process and methodology",
        "How do you approach user research and testing?",
        "Describe a challenging design problem you solved",
        "What is your experience with design tools and prototyping?",
        "How do you balance user needs with business requirements?",
        "Tell me about your experience with accessibility design",
        "What is your approach to design systems?",
    ],
    "Product Manager": [
        "How do you prioritize features in a product roadmap?",
        "Describe your approach to user research and validation",
        "Tell me about a product launch you managed",
        "What metrics do you use to measure product success?",
        "How do you handle conflicting stakeholder requirements?",
        "Describe a time you had to pivot a product strategy",
        "What is your experience working with engineering teams?",
    ],
    "Business Analyst": [
        "Describe your experience with business analysis",
        "How do you gather and document requirements?",
        "Tell me about your experience with process improvement",
        "What is your approach to stakeholder management?",
        "How do you translate business needs into technical requirements?",
        "Describe your experience with data analysis and reporting",
        "What is your experience with business process modeling?",
    ],
    "Scrum Master": [
        "Describe your experience with Agile methodologies",
        "How do you facilitate sprint planning and retrospectives?",
        "Tell me about a time you resolved team conflicts",
        "What is your approach to removing impediments?",
        "How do you measure team velocity and productivity?",
        "Describe your experience with scaling Agile practices",
        "What is your approach to coaching teams on Agile principles?",
    ],
}


def generate_default_questions(role: str, num_questions: int, difficulty: str) -> List[dict]:
    questions = QUESTION_BANK.get(role, QUESTION_BANK["Full Stack Developer"])
    return [
        {
            "id": f"q{i+1}",
            "text": text,
            "type": "technical" if i % 2 == 0 else "behavioral",
            "difficulty": difficulty,
            "expectedPoints": ["Clear explanation", "Practical examples", "Best practices"],
            "followUps": ["Can you provide a specific example?", "How would you handle edge cases?"],
        }
        for i, text in enumerate(questions[:num_questions])
    ]


def generate_default_report(session_id: str, role: str, responses: List[dict], questions: List[dict]) -> dict:
    from datetime import datetime

    def avg(key, sub):
        vals = [float(r.get(sub, {}).get(key, 0)) for r in responses if r.get(sub)]
        return sum(vals) / len(vals) if vals else 0

    avg_loudness = avg("loudness", "audioMetrics")
    avg_fillers = avg("fillerCount", "audioMetrics")
    avg_smile = avg("smile", "faceMetrics")
    avg_eye = avg("eyeContact", "faceMetrics")

    content = min(20, max(10, 15 + random.random() * 5))
    clarity = min(20, max(10, 18 - avg_fillers))
    tone = min(20, max(10, avg_loudness / 5))
    body = min(20, max(10, (avg_smile + avg_eye) * 10))
    fluency = min(20, max(10, 18 - avg_fillers * 2))
    overall = round(content + clarity + tone + body + fluency)

    return {
        "sessionId": session_id,
        "role": role,
        "timestamp": datetime.utcnow().isoformat(),
        "overallScore": overall,
        "categories": {
            "content": round(content),
            "clarity": round(clarity),
            "tone": round(tone),
            "bodyLanguage": round(body),
            "fluency": round(fluency),
        },
        "questionFeedback": [
            {
                "qid": q.get("id", f"q{i+1}"),
                "text": q.get("text", ""),
                "score": round(12 + random.random() * 6),
                "strengths": ["Good technical understanding", "Clear communication"],
                "weaknesses": ["Reduce filler words", "Be more concise"] if avg_fillers > 3 else ["Add more specific examples"],
                "suggestedAnswer": f"A strong answer would include: {', '.join(q.get('expectedPoints', []))}.",
            }
            for i, q in enumerate(questions)
        ],
        "suggestions": [
            "Practice reducing filler words like 'um' and 'uh'" if avg_fillers > 3 else "Maintain your clear speaking style",
            "Speak with more confidence and volume" if avg_loudness < 30 else "Good vocal projection",
            "Maintain better eye contact with the camera" if avg_eye < 0.5 else "Excellent eye contact",
            "Provide more specific examples from your experience",
            "Practice common interview questions to improve fluency",
        ],
    }

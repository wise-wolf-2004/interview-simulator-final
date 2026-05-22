import time
import random
import string
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import io

from models import (
    StartSessionRequest, AppendResponseRequest,
    NextQuestionRequest, GenerateReportRequest,
)
from storage import (
    create_session, find_session_by_id, update_session, find_sessions_by_user,
    create_report, find_report_by_id, find_reports_by_user,
)
from ai_service import generate_questions, generate_interviewer_response, generate_report

router = APIRouter()


def new_id(prefix: str) -> str:
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=9))
    return f"{prefix}_{int(time.time() * 1000)}_{suffix}"


# ── Generate Questions ────────────────────────────────────────────────────────

@router.post("/generate-questions")
async def api_generate_questions(
    resume: Optional[UploadFile] = File(None),
    resumeText: str = Form(""),
    role: str = Form("Software Engineer"),
    difficulty: str = Form("medium"),
    numQuestions: int = Form(5),
):
    text = resumeText

    if resume:
        content = await resume.read()
        if resume.content_type == "application/pdf":
            import pdfplumber
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                text = "\n".join(p.extract_text() or "" for p in pdf.pages)
        else:
            text = content.decode("utf-8", errors="ignore")

    questions = await generate_questions(text, role, difficulty, numQuestions)
    return {"questions": questions, "resumeText": text}


# ── Session ───────────────────────────────────────────────────────────────────

@router.post("/session/start")
async def start_session(body: StartSessionRequest):
    session_id = new_id("s")
    data = {
        "sessionId": session_id,
        "userId": body.userId or "guest",
        "role": body.role,
        "questions": body.questions,
        "responses": [],
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    await create_session(data)
    print(f"✅ Session created: {session_id} for user: {data['userId']}")
    return {"sessionId": session_id, "resumeText": body.resumeText}


@router.get("/sessions/history")
async def sessions_history(userId: str):
    if not userId:
        raise HTTPException(400, "userId required")
    sessions = await find_sessions_by_user(userId)
    return {
        "sessions": [
            {
                "sessionId": s["sessionId"],
                "role": s["role"],
                "createdAt": s.get("createdAt"),
                "questionCount": len(s.get("questions", [])),
                "responseCount": len(s.get("responses", [])),
            }
            for s in sessions
        ]
    }


@router.post("/session/append-response")
async def append_response(body: AppendResponseRequest):
    print(f"📝 Appending response to session: {body.sessionId}, question: {body.questionId}")
    session = await find_session_by_id(body.sessionId)
    if not session:
        raise HTTPException(404, "Session not found")

    response = {
        "questionId": body.questionId,
        "transcription": body.transcription,
        "timestamp": body.timestamp,
        "audioMetrics": body.audioMetrics,
        "faceMetrics": body.faceMetrics,
    }
    responses = session.get("responses", [])
    responses.append(response)
    await update_session(body.sessionId, {"responses": responses})

    print(f"✅ Response saved - Total: {len(responses)}")
    return {"saved": True}


# ── Chat ──────────────────────────────────────────────────────────────────────

@router.post("/chat/next-question")
async def next_question(body: NextQuestionRequest):
    print(f"🤔 Generating next question for session: {body.sessionId}")
    session = await find_session_by_id(body.sessionId)
    if not session:
        raise HTTPException(404, "Session not found")

    print(f"📚 Session found, role: {session['role']}, history length: {len(body.conversationHistory)}")
    question = await generate_interviewer_response(
        session["role"], body.conversationHistory, body.resumeText or ""
    )
    print(f"✅ Next question: {question[:100]}")
    return {"question": question}


# ── Reports ───────────────────────────────────────────────────────────────────

@router.post("/generate-report")
async def api_generate_report(body: GenerateReportRequest):
    session = await find_session_by_id(body.sessionId)
    if not session:
        raise HTTPException(404, "Session not found")

    report = await generate_report(
        body.sessionId,
        session["role"],
        session.get("responses", []),
        session.get("questions", []),
        body.resumeText or "No resume provided",
    )

    report_id = new_id("r")
    report_data = {**report, "reportId": report_id, "userId": session.get("userId", "guest")}
    await create_report(report_data)
    print(f"✅ Report saved: {report_id}")
    return {"reportId": report_id, "report": report_data}


@router.get("/reports/history")
async def reports_history(userId: str):
    if not userId:
        raise HTTPException(400, "userId required")
    reports = await find_reports_by_user(userId)
    return {
        "reports": [
            {
                "reportId": r["reportId"],
                "sessionId": r["sessionId"],
                "role": r["role"],
                "timestamp": r.get("timestamp"),
                "overallScore": r.get("overallScore"),
            }
            for r in reports
        ]
    }


@router.get("/report/{report_id}")
async def get_report(report_id: str):
    report = await find_report_by_id(report_id)
    if not report:
        raise HTTPException(404, "Report not found")
    return report

from fastapi import APIRouter
from pydantic import BaseModel

from backend.core.llm import get_llm

from backend.agents.severity_agent import detect_severity
from backend.core.specialist_mapper import map_specialist
from backend.tools.doctor_tool import fetch_doctors_by_speciality
from backend.agents.appointment_agent import get_appointment_agent

router = APIRouter()


# ---------- REQUEST SCHEMA ----------

class ChatRequest(BaseModel):
    symptoms: str
    book: bool = False


# ---------- ENDPOINT ----------

@router.post("/chat")
def chat_endpoint(payload: ChatRequest):

    # 1️⃣ Load REAL Gemini LLM
    llm = get_llm()

    # 2️⃣ Detect severity using RunnableSequence
    severity_result = detect_severity(llm, payload.symptoms)

    # Safety check (LLM output string → dict if needed)
    if isinstance(severity_result, str):
        import json
        severity_result = json.loads(severity_result)

    # 3️⃣ Map severity → specialists
    specialists = map_specialist(severity_result)

    # 4️⃣ Fetch doctors from MongoDB
    doctors = fetch_doctors_by_speciality(specialists)
    print("Doctors fetched:", doctors)

    response = {
        "severity": severity_result,
        "recommended_specialists": specialists,
        "recommended_doctors": doctors
    }

    # 5️⃣ 🔥 Agentic flow (ONLY if severe + user consent)
    if severity_result.get("severity", "").lower() == "severe" and payload.book:

        if not doctors:
            response["booking_status"] = "No doctors available for booking"
            return response

        agent = get_appointment_agent(llm)

        agent_input = f"""
Patient symptoms: {payload.symptoms}
Available doctors: {doctors}
Book an appointment with the best suitable doctor.
"""

        agent_response = agent.invoke({"input": agent_input})

        response["agent_action"] = agent_response

    return response

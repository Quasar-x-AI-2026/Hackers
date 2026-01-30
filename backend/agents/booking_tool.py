from langchain.tools import tool

@tool
def book_appointment(doctor_name: str) -> str:
    return f"✅ Appointment booked successfully with {doctor_name}"

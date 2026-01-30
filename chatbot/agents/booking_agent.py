from backend.core.db import appointments_collection

def book_appointment(doctor_name: str, patient_name="Patient"):
    appointment = {
        "doctor": doctor_name,
        "patient": patient_name,
        "status": "BOOKED",
        "source": "AI_AGENT"
    }

    appointments_collection.insert_one(appointment)

    appointment["_id"] = str(appointment.get("_id", ""))

    return appointment

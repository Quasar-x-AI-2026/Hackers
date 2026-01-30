from chatbot.core.db import appointments_collection

def book_appointment(doctor_name: str, symptoms: str):
    appointment = {
        "doctor_name": doctor_name,
        "symptoms": symptoms,
        "status": "Booked"
    }

    appointments_collection.insert_one(appointment)
    return appointment

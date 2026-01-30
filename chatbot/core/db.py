from pymongo import MongoClient
import os

client = MongoClient(os.getenv("MONGODB_URI"))
db = client["prescripto"]
doctors_collection = db["doctors"]
appointments_collection = db["appointments"]
def fetch_doctors_by_specialist(specialist: str):
    doctors = list(doctors_collection.find(
        {"speciality": specialist},
        {"_id": 0}
    ))
    return doctors


def book_appointment_in_db(appointment_data: dict):
    appointments_collection.insert_one(appointment_data)
    return {"status": "success", "details": appointment_data}
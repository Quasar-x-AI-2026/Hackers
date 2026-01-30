from backend.core.db import doctors_collection

def recommend_doctors(specialist: str, location="Delhi", limit=3):
    cursor = doctors_collection.find(
        {
            "speciality": {"$regex": specialist, "$options": "i"},
            "location": location
        }
    ).sort("experience", -1).limit(limit)

    doctors = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doctors.append(doc)

    return doctors

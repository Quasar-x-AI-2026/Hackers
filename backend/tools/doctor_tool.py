from backend.core.db import doctors_collection

def fetch_doctors_by_speciality(specialities):
    """
    Fetch top 3 doctors based on speciality list
    """
    # If user passes a single string, convert it to a list
    if isinstance(specialities, str):
        specialities = [specialities]

    doctors = list(
        doctors_collection.find(
            {"speciality": {"$in": specialities}},
            {"_id": 0}
        ).limit(3)
    )
    return doctors


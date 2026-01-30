def map_specialist(severity_result: dict):
    if severity_result["severity"] == "Severe":
        return severity_result["recommended_specialist"]

    if severity_result["severity"] == "Moderate":
        return severity_result["recommended_specialist"]

    return "General Physician"

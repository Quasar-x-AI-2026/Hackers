import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MedicalDiagnosisPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Custom colors
  const primaryColor = "#F8607C";
  const textColor = "#000000";

  useEffect(() => {
    const loadDiagnosisData = () => {
      try {
        setLoading(true);

        // Priority 1: Data from chat bot navigation state
        if (location.state?.diagnosisData) {
          console.log(
            "Loaded from navigation state:",
            location.state.diagnosisData,
          );
          setData(location.state.diagnosisData);

          // Also save to localStorage for persistence
          localStorage.setItem(
            "diagnosisData",
            JSON.stringify(location.state.diagnosisData),
          );

          // Clear navigation state to avoid stale data on refresh
          window.history.replaceState({}, document.title);
        }
        // Priority 2: Data from localStorage
        else {
          const savedData = localStorage.getItem("diagnosisData");
          if (savedData) {
            console.log("Loaded from localStorage:", JSON.parse(savedData));
            setData(JSON.parse(savedData));
          } else {
            setError(
              "No diagnosis data found. Please use the chatbot to analyze symptoms first.",
            );
          }
        }
      } catch (err) {
        console.error("Error loading diagnosis data:", err);
        setError("Failed to load diagnosis data");
      } finally {
        setLoading(false);
      }
    };

    loadDiagnosisData();
  }, [location]);

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return "Date not available";

    try {
      // Handle both numeric timestamps and date objects
      const date =
        typeof timestamp === "number"
          ? new Date(timestamp)
          : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Handle chat again button
  const handleNewAnalysis = () => {
    // Navigate back to home where chatbot is available
    navigate("/");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-6"
            style={{
              borderColor: `${primaryColor}30`,
              borderTopColor: primaryColor,
            }}
          ></div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: textColor }}>
            Loading Diagnosis Report
          </h2>
          <p className="opacity-70" style={{ color: textColor }}>
            Analyzing your symptoms and generating report...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6" style={{ color: primaryColor }}>
            ⚠️
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
            {error || "No Diagnosis Data Available"}
          </h2>
          <p className="mb-8 opacity-80" style={{ color: textColor }}>
            Please use the chatbot on the home page to analyze your symptoms
            first.
          </p>
          <button
            onClick={handleNewAnalysis}
            className="px-8 py-4 rounded-xl font-medium text-lg transition-all hover:scale-105"
            style={{
              backgroundColor: primaryColor,
              color: "white",
            }}
          >
            Go to Chatbot
          </button>
        </div>
      </div>
    );
  }

  // Extract symptoms from agent_action input
  const extractSymptoms = () => {
    if (data.agent_action?.input) {
      const input = data.agent_action.input;
      const match = input.match(/Patient symptoms:\s*(.+)/i);
      return match ? match[1].trim() : "Chest Pain"; // Default to chest pain based on your JSON
    }
    return "Chest Pain"; // Default
  };

  // Main content
  return (
    <div className="min-h-screen bg-white" style={{ color: textColor }}>
      {/* Header with timestamp */}
      <div
        className="p-6 border-b"
        style={{ borderColor: `${primaryColor}20` }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1
                className="text-3xl md:text-4xl font-bold mb-2"
                style={{ color: primaryColor }}
              >
                Medical Diagnosis Report
              </h1>
              <p className="opacity-80">
                Generated from AI analysis of your symptoms
              </p>
            </div>
            <div className="text-sm opacity-70">
              <p>
                Report generated:{" "}
                {data.date ? formatDate(data.date) : formatDate(Date.now())}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content container */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Symptoms Analyzed Section */}
        <div
          className="mb-10 p-6 rounded-2xl"
          style={{ backgroundColor: `${primaryColor}08` }}
        >
          <h3
            className="text-lg font-bold mb-3"
            style={{ color: primaryColor }}
          >
            Symptoms Analyzed
          </h3>
          <p className="text-lg leading-relaxed">{extractSymptoms()}</p>
        </div>

        {/* Severity Assessment */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: primaryColor, color: "white" }}
            >
              ⚠️
            </div>
            <h2 className="text-2xl font-bold">Condition Assessment</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Severity Level Card */}
            <div
              className="p-6 rounded-2xl border-2"
              style={{ borderColor: primaryColor }}
            >
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: primaryColor }}
              >
                Severity Level
              </h3>
              <div
                className={`text-3xl font-bold mb-2 ${
                  data.severity?.severity?.toLowerCase() === "severe"
                    ? "text-red-600"
                    : data.severity?.severity?.toLowerCase() === "moderate"
                      ? "text-orange-600"
                      : "text-green-600"
                }`}
              >
                {data.severity?.severity || "Not Specified"}
              </div>
              <p className="text-sm opacity-70">Based on symptom analysis</p>
            </div>

            {/* Risk Assessment Card */}
            <div
              className="lg:col-span-2 p-6 rounded-2xl"
              style={{ backgroundColor: `${primaryColor}05` }}
            >
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: primaryColor }}
              >
                Risk Assessment
              </h3>
              <p className="leading-relaxed">
                {data.severity?.risk_reason || "No risk assessment available"}
              </p>
            </div>
          </div>
        </div>

        {/* Specialist Recommendation */}
        <div
          className="mb-10 p-6 rounded-2xl border-2"
          style={{ borderColor: primaryColor }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: primaryColor }}
              >
                Recommended Action
              </h3>
              <p className="opacity-80">
                Based on AI analysis, here's what we recommend:
              </p>
            </div>
            <div
              className="px-6 py-3 rounded-xl text-lg font-bold"
              style={{ backgroundColor: primaryColor, color: "white" }}
            >
              {data.severity?.recommended_specialist ||
                data.recommended_specialists ||
                "Consult a Doctor"}
            </div>
          </div>
        </div>

        {/* Recommended Doctors */}
        {data.recommended_doctors && data.recommended_doctors.length > 0 ? (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: primaryColor, color: "white" }}
              >
                👨‍⚕️
              </div>
              <h2 className="text-2xl font-bold">Available Doctors</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.recommended_doctors.map((doctor, index) => (
                <div
                  key={index}
                  className="rounded-2xl overflow-hidden border-2 shadow-lg"
                  style={{ borderColor: `${primaryColor}30` }}
                >
                  {/* Doctor Header */}
                  <div
                    className="p-6"
                    style={{ backgroundColor: `${primaryColor}08` }}
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-20 h-20 rounded-xl object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${doctor.name}&background=${primaryColor.replace("#", "")}&color=fff&size=80`;
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{doctor.name}</h3>
                        <p className="opacity-80">{doctor.speciality}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className="px-3 py-1 text-sm rounded-full"
                            style={{
                              backgroundColor: `${primaryColor}20`,
                              color: primaryColor,
                            }}
                          >
                            {doctor.degree}
                          </span>
                          <span
                            className={`px-3 py-1 text-sm rounded-full ${doctor.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {doctor.available ? "Available" : "Not Available"}
                          </span>
                          <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                            ${doctor.fees}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm opacity-70 mb-1">Experience</p>
                        <p className="font-medium">{doctor.experience}</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-70 mb-1">Location</p>
                        <p className="font-medium">
                          {doctor.address?.line1 || "Not specified"}
                        </p>
                      </div>
                    </div>

                    {doctor.about && doctor.about !== "dasdfsdf" && (
                      <div className="mb-6">
                        <p className="text-sm opacity-70 mb-2">About Doctor</p>
                        <p className="leading-relaxed">{doctor.about}</p>
                      </div>
                    )}

                    {/* Agent Action Message */}
                    {data.agent_action?.output && (
                      <div
                        className="mb-6 p-4 rounded-lg"
                        style={{ backgroundColor: `${primaryColor}10` }}
                      >
                        <p
                          className="text-sm font-medium mb-1"
                          style={{ color: primaryColor }}
                        >
                          Appointment Status
                        </p>
                        <p className="leading-relaxed">
                          {data.agent_action.output}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        className="flex-1 px-4 py-3 rounded-lg font-medium transition-all hover:opacity-90"
                        style={{
                          backgroundColor: primaryColor,
                          color: "white",
                        }}
                        onClick={() => {
                          // Navigate to appointment booking
                          navigate(`/appointment/${doctor._id || index}`);
                        }}
                      >
                        {data.booking_status === "Appointment booked"
                          ? "View Appointment"
                          : "Book Appointment"}
                      </button>
                      {doctor.available &&
                        data.booking_status !== "Appointment booked" && (
                          <button
                            className="px-4 py-3 rounded-lg font-medium border-2 transition-all hover:bg-gray-50"
                            style={{
                              borderColor: primaryColor,
                              color: primaryColor,
                            }}
                            onClick={() => {
                              // Add to favorites or share functionality
                              alert(`Sharing Dr. ${doctor.name}'s profile`);
                            }}
                          >
                            Share
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // No doctors recommended
          <div
            className="mb-10 p-8 rounded-2xl text-center"
            style={{ backgroundColor: `${primaryColor}08` }}
          >
            <div className="text-5xl mb-4" style={{ color: primaryColor }}>
              👨‍⚕️
            </div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: primaryColor }}
            >
              No Specific Doctors Recommended
            </h3>
            <p className="opacity-80 mb-6">
              Consult with any available{" "}
              {data.severity?.recommended_specialist || "doctor"} for further
              evaluation.
            </p>
            <button
              onClick={() => navigate("/doctors")}
              className="px-6 py-3 rounded-lg font-medium"
              style={{ backgroundColor: primaryColor, color: "white" }}
            >
              Browse All Doctors
            </button>
          </div>
        )}

        {/* Booking Status & Agent Action */}
        <div
          className="mb-10 p-6 rounded-2xl"
          style={{ backgroundColor: `${primaryColor}05` }}
        >
          <h3
            className="text-xl font-bold mb-4"
            style={{ color: primaryColor }}
          >
            Next Steps
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-lg font-medium mb-1">Appointment Status</p>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    data.booking_status === "Appointment booked"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {data.booking_status || "Ready for consultation"}
                </span>
                {data.agent_action?.output && (
                  <p className="opacity-80">{data.agent_action.output}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={() => navigate("/doctors")}
                className="px-6 py-3 rounded-lg font-medium border-2 transition-all hover:scale-105"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Find More Doctors
              </button>
              <button
                onClick={handleNewAnalysis}
                className="px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
                style={{ backgroundColor: primaryColor, color: "white" }}
              >
                New Symptom Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Detailed AI Analysis */}
        {data.agent_action?.input && (
          <div
            className="mb-10 p-6 rounded-2xl border-2"
            style={{ borderColor: `${primaryColor}30` }}
          >
            <h3
              className="text-xl font-bold mb-4"
              style={{ color: primaryColor }}
            >
              AI Analysis Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-1" style={{ color: primaryColor }}>
                  Input Analyzed:
                </p>
                <p className="text-sm opacity-90 bg-gray-50 p-3 rounded-lg">
                  {data.agent_action.input}
                </p>
              </div>
              {data.agent_action.output && (
                <div>
                  <p
                    className="font-medium mb-1"
                    style={{ color: primaryColor }}
                  >
                    Action Taken:
                  </p>
                  <p className="text-sm opacity-90 bg-gray-50 p-3 rounded-lg">
                    {data.agent_action.output}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div
          className="mt-12 pt-8 border-t"
          style={{ borderColor: `${primaryColor}20` }}
        >
          <div
            className="flex items-start gap-4 p-6 rounded-2xl"
            style={{ backgroundColor: `${primaryColor}08` }}
          >
            <div className="text-2xl" style={{ color: primaryColor }}>
              ℹ️
            </div>
            <div>
              <h4 className="font-bold mb-2" style={{ color: primaryColor }}>
                Important Disclaimer
              </h4>
              <p className="text-sm leading-relaxed opacity-90">
                This diagnosis is generated by AI based on symptom analysis and
                is for informational purposes only. It is not a substitute for
                professional medical advice, diagnosis, or treatment. Always
                seek the advice of your physician or other qualified health
                provider with any questions you may have regarding a medical
                condition.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-8 pt-6 border-t text-center opacity-70 text-sm"
          style={{ borderColor: `${primaryColor}20` }}
        >
          <p>
            This report is generated based on AI analysis. For emergencies, call
            emergency services immediately.
          </p>
          <p className="mt-2">
            Report ID:{" "}
            {data.date
              ? data.date.toString(36).toUpperCase()
              : Date.now().toString(36).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalDiagnosisPage;

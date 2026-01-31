import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaStethoscope,
  FaUserMd,
  FaCalendarCheck,
  FaExclamationTriangle,
  FaHeartbeat,
  FaInfoCircle,
  FaClock,
  FaIdCard,
  FaStar,
  FaMapMarkerAlt,
  FaShieldAlt,
} from "react-icons/fa";

const MedicalDiagnosisPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDoctor, setActiveDoctor] = useState(0);

  // Custom colors (keeping your original scheme)
  const primaryColor = "#F8607C";
  const secondaryColor = "#FF90A4";
  const accentColor = "#FFE5EA";
  const textColor = "#000000";
  const darkText = "#333333";
  const lightText = "#666666";

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
          localStorage.setItem(
            "diagnosisData",
            JSON.stringify(location.state.diagnosisData),
          );
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
      const date =
        typeof timestamp === "number"
          ? new Date(timestamp)
          : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
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
    navigate("/");
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "severe":
        return "#EF4444";
      case "moderate":
        return "#F97316";
      case "low":
        return "#10B981";
      default:
        return primaryColor;
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case "severe":
        return <FaExclamationTriangle className="text-white" />;
      case "moderate":
        return <FaInfoCircle className="text-white" />;
      case "low":
        return <FaHeartbeat className="text-white" />;
      default:
        return <FaStethoscope className="text-white" />;
    }
  };

  // Extract symptoms from agent_action input
  const extractSymptoms = () => {
    if (data?.agent_action?.input) {
      const input = data.agent_action.input;
      const match = input.match(/Patient symptoms:\s*(.+)/i);
      return match ? match[1].trim() : "Not specified";
    }
    return "Symptoms not specified";
  };

  // Handle navigation to appointment page
  const navigateToAppointment = (doctor, index) => {
    // Create a complete doctor object with all required fields
    const doctorData = {
      _id: doctor._id || `mock_${index + 1}`,
      name: doctor.name,
      speciality: doctor.speciality,
      degree: doctor.degree || "MD, MBBS",
      experience: doctor.experience || "10+ years",
      image: doctor.image || `https://ui-avatars.com/api/?name=${doctor.name}&background=F8607C&color=fff&size=400`,
      available: doctor.available !== undefined ? doctor.available : true,
      fees: doctor.fees || 150,
      about: doctor.about || `Specialized in ${doctor.speciality} with extensive experience.`,
      address: doctor.address || {
        line1: "123 Medical Center",
        line2: "Suite 101",
        city: "New York",
        state: "NY",
        pincode: "10001"
      }
    };

    // Navigate to appointment page with doctor data
    navigate(`/appointment/${doctorData._id}`, {
      state: { 
        doctor: doctorData,
        fromDiagnosis: true 
      }
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 p-6">
        <div className="text-center max-w-md">
          <div className="relative mb-8">
            <div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <FaStethoscope
                className="text-4xl"
                style={{ color: primaryColor }}
              />
            </div>
            <div
              className="absolute -top-2 -right-2 w-10 h-10 rounded-full animate-ping"
              style={{ backgroundColor: `${primaryColor}30` }}
            ></div>
          </div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: darkText }}>
            Analyzing Symptoms
          </h2>
          <p className="mb-8 text-lg opacity-80" style={{ color: lightText }}>
            Our AI is carefully analyzing your symptoms and generating a
            comprehensive report...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full animate-pulse"
              style={{
                backgroundColor: primaryColor,
                width: "70%",
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 p-8">
        <div className="text-center max-w-md">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <FaExclamationTriangle
              className="text-5xl"
              style={{ color: primaryColor }}
            />
          </div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: darkText }}>
            {error || "No Diagnosis Data Available"}
          </h2>
          <p className="mb-8 text-lg opacity-80" style={{ color: lightText }}>
            Please use the medical assistant chatbot on the home page to analyze
            your symptoms first.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleNewAnalysis}
              className="w-full px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              style={{
                backgroundColor: primaryColor,
                color: "white",
                boxShadow: `0 10px 30px ${primaryColor}40`,
              }}
            >
              <FaStethoscope className="inline mr-3" />
              Start New Analysis
            </button>
            <button
              onClick={() => navigate("/doctors")}
              className="w-full px-8 py-4 rounded-xl font-semibold text-lg border-2 transition-all"
              style={{
                borderColor: primaryColor,
                color: primaryColor,
              }}
            >
              Browse Available Doctors
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-white to-gray-50"
      style={{ color: textColor }}
    >
      {/* Header */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: `${primaryColor}08` }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32"
          style={{ backgroundColor: `${primaryColor}05` }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full -ml-24 -mb-24"
          style={{ backgroundColor: `${primaryColor}05` }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-3 mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <FaStethoscope className="text-2xl text-white" />
                </div>
                <div>
                  <h1
                    className="text-4xl lg:text-5xl font-bold mb-2"
                    style={{ color: darkText }}
                  >
                    Medical Diagnosis Report
                  </h1>
                  <p
                    className="text-lg opacity-80"
                    style={{ color: lightText }}
                  >
                    AI-powered analysis and recommendations
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <FaClock
                        className="text-lg"
                        style={{ color: primaryColor }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-sm opacity-70"
                        style={{ color: lightText }}
                      >
                        Report Generated
                      </p>
                      <p className="font-semibold">
                        {data.date
                          ? formatDate(data.date)
                          : formatDate(Date.now())}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <FaIdCard
                        className="text-lg"
                        style={{ color: primaryColor }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-sm opacity-70"
                        style={{ color: lightText }}
                      >
                        Report ID
                      </p>
                      <p className="font-semibold font-mono">
                        {data.date
                          ? data.date.toString(36).toUpperCase()
                          : Date.now().toString(36).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <FaShieldAlt
                        className="text-lg"
                        style={{ color: primaryColor }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-sm opacity-70"
                        style={{ color: lightText }}
                      >
                        Status
                      </p>
                      <p className="font-semibold">
                        {data.booking_status || "Ready for consultation"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Symptoms & Severity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Symptoms Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <FaHeartbeat
                    className="text-xl"
                    style={{ color: primaryColor }}
                  />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: darkText }}>
                  Symptoms Analyzed
                </h2>
              </div>
              <div
                className="p-6 rounded-xl mb-6"
                style={{ backgroundColor: `${primaryColor}08` }}
              >
                <p className="text-lg leading-relaxed">{extractSymptoms()}</p>
              </div>

              <div className="mt-8">
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: darkText }}
                >
                  AI Analysis Details
                </h3>
                {data.agent_action?.input && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gray-50">
                      <p
                        className="text-sm font-medium mb-2"
                        style={{ color: primaryColor }}
                      >
                        Input Analyzed:
                      </p>
                      <p className="opacity-90">{data.agent_action.input}</p>
                    </div>
                    {data.agent_action.output && (
                      <div className="p-4 rounded-xl bg-gray-50">
                        <p
                          className="text-sm font-medium mb-2"
                          style={{ color: primaryColor }}
                        >
                          AI Assessment:
                        </p>
                        <p className="opacity-90">{data.agent_action.output}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Severity & Recommendation Card */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
              <div className="flex items-center gap-3 mb-8">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  {getSeverityIcon(data.severity?.severity)}
                </div>
                <h2 className="text-2xl font-bold" style={{ color: darkText }}>
                  Condition Assessment
                </h2>
              </div>

              {/* Severity Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium" style={{ color: darkText }}>
                    Severity Level
                  </span>
                  <span
                    className="text-lg font-bold px-4 py-1 rounded-full"
                    style={{
                      backgroundColor: `${getSeverityColor(data.severity?.severity)}20`,
                      color: getSeverityColor(data.severity?.severity),
                    }}
                  >
                    {data.severity?.severity || "Not Specified"}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width:
                        data.severity?.severity?.toLowerCase() === "severe"
                          ? "90%"
                          : data.severity?.severity?.toLowerCase() ===
                              "moderate"
                            ? "60%"
                            : "30%",
                      backgroundColor: getSeverityColor(
                        data.severity?.severity,
                      ),
                    }}
                  ></div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4" style={{ color: darkText }}>
                  Risk Assessment
                </h3>
                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: `${getSeverityColor(data.severity?.severity)}10`,
                  }}
                >
                  <p className="leading-relaxed">
                    {data.severity?.risk_reason ||
                      "No risk assessment available"}
                  </p>
                </div>
              </div>

              {/* Recommended Action */}
              <div
                className="p-6 rounded-xl border-2"
                style={{
                  borderColor: primaryColor,
                  backgroundColor: `${primaryColor}05`,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <FaUserMd
                    className="text-xl"
                    style={{ color: primaryColor }}
                  />
                  <h3 className="text-lg font-bold" style={{ color: darkText }}>
                    Recommended Action
                  </h3>
                </div>
                <div
                  className="px-4 py-3 rounded-lg font-bold text-center mb-4"
                  style={{ backgroundColor: primaryColor, color: "white" }}
                >
                  {data.severity?.recommended_specialist ||
                    data.recommended_specialists ||
                    "Consult a Doctor"}
                </div>
                <p className="text-sm opacity-80">
                  Based on AI analysis of your symptoms
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Doctors Section */}
        {data.recommended_doctors && data.recommended_doctors.length > 0 ? (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <FaUserMd className="text-2xl text-white" />
                </div>
                <div>
                  <h2
                    className="text-3xl font-bold"
                    style={{ color: darkText }}
                  >
                    Available Doctors
                  </h2>
                  <p className="opacity-80" style={{ color: lightText }}>
                    Verified specialists for your condition
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/doctors")}
                className="px-6 py-3 rounded-xl font-semibold border-2 transition-all hover:bg-gray-50"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                View All Doctors
              </button>
            </div>

            {/* Doctor Tabs */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
              {data.recommended_doctors.map((doctor, index) => (
                <button
                  key={doctor._id || index}
                  onClick={() => setActiveDoctor(index)}
                  className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all ${activeDoctor === index ? "" : "opacity-70 hover:opacity-100"}`}
                  style={{
                    backgroundColor:
                      activeDoctor === index
                        ? primaryColor
                        : `${primaryColor}10`,
                    color: activeDoctor === index ? "white" : primaryColor,
                  }}
                >
                  {doctor.name.split(" ")[1]} {/* Last name only */}
                </button>
              ))}
            </div>

            {/* Doctor Details */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {data.recommended_doctors.map((doctor, index) => (
                <div
                  key={doctor._id || index}
                  className={`${activeDoctor === index ? "block" : "hidden"}`}
                >
                  {/* Doctor Header */}
                  <div
                    className="p-8"
                    style={{ backgroundColor: `${primaryColor}08` }}
                  >
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex-shrink-0">
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${doctor.name}&background=${primaryColor.replace("#", "")}&color=fff&size=128`;
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-2xl font-bold mb-2">
                              {doctor.name}
                            </h3>
                            <p className="text-lg opacity-80">
                              {doctor.speciality}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="px-4 py-2 rounded-full font-semibold text-sm"
                              style={{
                                backgroundColor: `${primaryColor}20`,
                                color: primaryColor,
                              }}
                            >
                              {doctor.degree}
                            </span>
                            <span
                              className={`px-4 py-2 rounded-full font-semibold text-sm ${doctor.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                            >
                              {doctor.available ? "Available" : "Not Available"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <p className="text-sm opacity-70 mb-1">
                              Experience
                            </p>
                            <p className="font-semibold">{doctor.experience}</p>
                          </div>
                          <div>
                            <p className="text-sm opacity-70 mb-1">
                              Consultation Fee
                            </p>
                            <p className="font-semibold">${doctor.fees}</p>
                          </div>
                          <div>
                            <p className="text-sm opacity-70 mb-1">Rating</p>
                            <div className="flex items-center">
                              <FaStar className="text-yellow-500 mr-1" />
                              <span className="font-semibold">4.8</span>
                              <span className="text-sm opacity-70 ml-1">
                                (120 reviews)
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm opacity-70 mb-1">Location</p>
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="mr-2 opacity-70" />
                              <span className="font-semibold">
                                {doctor.address?.city || "New York"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Details & Actions */}
                  <div className="p-8">
                    {doctor.about && doctor.about !== "dasdfsdf" && (
                      <div className="mb-8">
                        <h4
                          className="text-lg font-semibold mb-4"
                          style={{ color: darkText }}
                        >
                          About Doctor
                        </h4>
                        <p className="leading-relaxed opacity-90">
                          {doctor.about}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <h4
                            className="text-lg font-semibold mb-4"
                            style={{ color: darkText }}
                          >
                            Services
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {[
                              "Consultation",
                              "Diagnosis",
                              "Treatment Planning",
                              "Follow-up",
                            ].map((service) => (
                              <span
                                key={service}
                                className="px-4 py-2 rounded-full text-sm"
                                style={{
                                  backgroundColor: `${primaryColor}10`,
                                  color: primaryColor,
                                }}
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4
                            className="text-lg font-semibold mb-4"
                            style={{ color: darkText }}
                          >
                            Languages
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {["English", "Spanish", "French"].map((lang) => (
                              <span
                                key={lang}
                                className="px-4 py-2 rounded-full text-sm bg-gray-100"
                              >
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Appointment Actions */}
                      <div className="space-y-6">
                        <div
                          className="p-6 rounded-xl"
                          style={{ backgroundColor: `${primaryColor}08` }}
                        >
                          <h4
                            className="font-semibold mb-3"
                            style={{ color: primaryColor }}
                          >
                            Next Available Slot
                          </h4>
                          <p className="text-lg font-bold mb-2">
                            Tomorrow, 10:00 AM
                          </p>
                          <p className="text-sm opacity-80">
                            Online consultation available
                          </p>
                        </div>

                        <div className="flex gap-4">
                          <button
                            className="flex-1 px-6 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                              backgroundColor: primaryColor,
                              color: "white",
                              boxShadow: `0 6px 20px ${primaryColor}40`,
                            }}
                            onClick={() => navigateToAppointment(doctor, index)}
                          >
                            {data.booking_status === "Appointment booked"
                              ? "View Appointment"
                              : "Book Appointment"}
                          </button>

                          {doctor.available &&
                            data.booking_status !== "Appointment booked" && (
                              <button
                                className="px-6 py-4 rounded-xl font-semibold border-2 transition-all hover:bg-gray-50"
                                style={{
                                  borderColor: primaryColor,
                                  color: primaryColor,
                                }}
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    window.location.href,
                                  );
                                  alert(
                                    `Dr. ${doctor.name}'s profile link copied!`,
                                  );
                                }}
                              >
                                Share Profile
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // No doctors recommended
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center mb-12">
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <FaUserMd className="text-5xl" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: darkText }}>
              No Specific Doctors Recommended
            </h3>
            <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto">
              Consult with any available{" "}
              {data.severity?.recommended_specialist || "doctor"} in your area
              for further evaluation. You can browse all available specialists
              through our directory.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/doctors")}
                className="px-8 py-4 rounded-xl font-semibold text-lg"
                style={{ backgroundColor: primaryColor, color: "white" }}
              >
                Browse All Doctors
              </button>
              <button
                onClick={handleNewAnalysis}
                className="px-8 py-4 rounded-xl font-semibold text-lg border-2"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                New Symptom Analysis
              </button>
            </div>
          </div>
        )}

        {/* Next Steps & Actions */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-4 mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <FaCalendarCheck className="text-2xl text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: darkText }}>
                  Next Steps & Actions
                </h2>
                <p className="opacity-80" style={{ color: lightText }}>
                  Recommended actions based on your diagnosis
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div
                className="p-6 rounded-xl border-2"
                style={{ borderColor: `${primaryColor}30` }}
              >
                <div
                  className="text-3xl font-bold mb-3"
                  style={{ color: primaryColor }}
                >
                  1
                </div>
                <h4
                  className="text-lg font-semibold mb-3"
                  style={{ color: darkText }}
                >
                  Schedule Appointment
                </h4>
                <p className="opacity-80">
                  Book with a recommended specialist for proper evaluation.
                </p>
              </div>

              <div
                className="p-6 rounded-xl border-2"
                style={{ borderColor: `${primaryColor}30` }}
              >
                <div
                  className="text-3xl font-bold mb-3"
                  style={{ color: primaryColor }}
                >
                  2
                </div>
                <h4
                  className="text-lg font-semibold mb-3"
                  style={{ color: darkText }}
                >
                  Monitor Symptoms
                </h4>
                <p className="opacity-80">
                  Keep track of any changes or new symptoms that develop.
                </p>
              </div>

              <div
                className="p-6 rounded-xl border-2"
                style={{ borderColor: `${primaryColor}30` }}
              >
                <div
                  className="text-3xl font-bold mb-3"
                  style={{ color: primaryColor }}
                >
                  3
                </div>
                <h4
                  className="text-lg font-semibold mb-3"
                  style={{ color: darkText }}
                >
                  Follow-up
                </h4>
                <p className="opacity-80">
                  Schedule follow-up appointments as recommended by your doctor.
                </p>
              </div>
            </div>

            <div
              className="flex flex-wrap gap-4 pt-6 border-t"
              style={{ borderColor: `${primaryColor}20` }}
            >
              <button
                onClick={handleNewAnalysis}
                className="px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02]"
                style={{
                  backgroundColor: primaryColor,
                  color: "white",
                  boxShadow: `0 6px 20px ${primaryColor}40`,
                }}
              >
                New Symptom Analysis
              </button>
              <button
                onClick={() => navigate("/doctors")}
                className="px-8 py-4 rounded-xl font-semibold text-lg border-2 transition-all hover:bg-gray-50"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Find More Doctors
              </button>
              <button
                onClick={() => window.print()}
                className="px-8 py-4 rounded-xl font-semibold text-lg border-2 transition-all hover:bg-gray-50"
                style={{ borderColor: lightText, color: lightText }}
              >
                Print Report
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <FaExclamationTriangle
                  className="text-2xl"
                  style={{ color: primaryColor }}
                />
              </div>
            </div>
            <div>
              <h4
                className="text-xl font-bold mb-4"
                style={{ color: darkText }}
              >
                Important Medical Disclaimer
              </h4>
              <p className="leading-relaxed opacity-90 mb-4">
                This AI-generated diagnosis is based on the symptoms provided
                and is for informational purposes only. It is not a substitute
                for professional medical advice, diagnosis, or treatment. Always
                seek the advice of your physician or other qualified health
                provider with any questions you may have regarding a medical
                condition.
              </p>
              <p className="text-sm opacity-70">
                <strong>Emergency Notice:</strong> If you are experiencing chest
                pain, difficulty breathing, severe bleeding, or any other
                life-threatening symptoms, call emergency services immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-12 pt-8 text-center opacity-70 text-sm"
          style={{ borderTop: `1px solid ${primaryColor}20` }}
        >
          <p className="mb-2">
            This report was generated by AI HealthCare Assistant. For
            emergencies, call 911 immediately.
          </p>
          <p>
            Report ID:{" "}
            {data.date
              ? data.date.toString(36).toUpperCase()
              : Date.now().toString(36).toUpperCase()}{" "}
            • Generated:{" "}
            {data.date ? formatDate(data.date) : formatDate(Date.now())}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalDiagnosisPage;
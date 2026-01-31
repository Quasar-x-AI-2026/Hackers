import React, { useState, useRef, useEffect } from "react";
import { FiMessageSquare, FiSend, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { assets } from "../assets/assets";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your medical assistant. Describe your symptoms and I'll analyze them for you.",
      sender: "bot",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Your API endpoints
  const API_BASE_URL = "https://hackers-4.onrender.com";
  const API_TEST_ENDPOINT = "/"; // GET endpoint
  const API_CHAT_ENDPOINT = "/chat"; // POST endpoint

  // Test API connection on component mount
  useEffect(() => {
    testAPIConnection();
  }, []);

  const testAPIConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${API_TEST_ENDPOINT}`, {
        timeout: 10000,
      });
      console.log("API Connection Test Response:", response.data);
      setApiConnected(true);
      
      // Update welcome message if API is connected
      if (response.data && response.data.status === "ok") {
        setMessages([
          {
            text: "Hello! I'm your AI medical assistant, connected and ready to help. Describe your symptoms and I'll analyze them for you.",
            sender: "bot",
          },
        ]);
      }
    } catch (error) {
      console.warn("API Connection Test Failed:", error.message);
      setApiConnected(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Call your LLM API - POST to /chat
  const callLLMAPI = async (userMessage) => {
    setIsLoading(true);

    try {
      // Prepare request for your API - Adjust based on your API's expected format
      const requestBody = {
        // Try different formats based on what your API expects
        message: userMessage,
        // OR if your API expects a different field name:
        // prompt: userMessage,
        // query: userMessage,
        // symptoms: userMessage,
        
        // Add any additional parameters your API might need
        timestamp: new Date().toISOString(),
        user_id: "user_" + Date.now(), // Temporary user ID
      };

      console.log("Sending to /chat endpoint:", requestBody);

      // Make POST request to your /chat endpoint
      const response = await axios.post(
        `${API_BASE_URL}${API_CHAT_ENDPOINT}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            // Add if your API requires authentication:
            // "Authorization": `Bearer YOUR_TOKEN`,
            // "X-API-Key": "YOUR_KEY",
          },
          timeout: 45000, // 45 seconds timeout for LLM processing
        }
      );

      console.log("API Response from /chat:", response.data);

      // Process the API response
      return processAPIResponse(response.data, userMessage);

    } catch (error) {
      console.error("API Error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      // Show error to user
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.typing),
        {
          text: "I'm having trouble connecting to the diagnosis service. Using mock data for demonstration...",
          sender: "bot",
        },
      ]);

      // Fallback to mock data
      return getMockDiagnosisData(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Process different API response formats
  const processAPIResponse = (apiData, originalSymptoms) => {
    // CASE 1: API returns a plain text string
    if (typeof apiData === "string") {
      return createDiagnosisFromText(apiData, originalSymptoms);
    }

    // CASE 2: API returns JSON with text response
    if (apiData.response || apiData.message || apiData.result) {
      const responseText = apiData.response || apiData.message || apiData.result;
      return createDiagnosisFromText(responseText, originalSymptoms);
    }

    // CASE 3: API returns structured medical data
    if (apiData.diagnosis || apiData.severity || apiData.recommendation) {
      return formatStructuredDiagnosis(apiData, originalSymptoms);
    }

    // CASE 4: Unknown format - use mock data
    console.warn("Unknown API response format:", apiData);
    return getMockDiagnosisData(originalSymptoms);
  };

  // Create diagnosis data from text response
  const createDiagnosisFromText = (text, symptoms) => {
    // Analyze text to extract medical information
    const textLower = text.toLowerCase();
    
    // Determine severity from text
    let severityLevel = "Moderate";
    if (textLower.includes("emergency") || textLower.includes("immediately") || textLower.includes("911")) {
      severityLevel = "Severe";
    } else if (textLower.includes("mild") || textLower.includes("minor")) {
      severityLevel = "Low";
    }

    // Determine specialist from text
    let specialist = "General Physician";
    const specialistMapping = [
      { keywords: ["heart", "chest", "cardiac"], specialist: "Cardiologist" },
      { keywords: ["head", "brain", "neuro", "migraine"], specialist: "Neurologist" },
      { keywords: ["stomach", "abdominal", "digest", "gut"], specialist: "Gastroenterologist" },
      { keywords: ["skin", "rash", "dermat"], specialist: "Dermatologist" },
      { keywords: ["bone", "joint", "muscle", "ortho"], specialist: "Orthopedist" },
      { keywords: ["child", "pediatric", "baby"], specialist: "Pediatrician" },
      { keywords: ["mental", "anxiety", "depress", "psych"], specialist: "Psychiatrist" },
    ];

    for (const mapping of specialistMapping) {
      if (mapping.keywords.some(keyword => textLower.includes(keyword))) {
        specialist = mapping.specialist;
        break;
      }
    }

    return {
      severity: {
        severity: severityLevel,
        risk_reason: text.length > 200 ? `${text.substring(0, 200)}...` : text,
        recommended_specialist: specialist,
      },
      recommended_specialists: specialist,
      recommended_doctors: getMockDoctors(specialist),
      booking_status: "Ready for consultation",
      date: Date.now(),
      agent_action: {
        input: `Patient symptoms: ${symptoms}`,
        output: text,
      },
    };
  };

  // Format structured diagnosis from API
  const formatStructuredDiagnosis = (apiData, symptoms) => {
    return {
      severity: {
        severity: apiData.severity?.level || apiData.severity || "Moderate",
        risk_reason: apiData.severity?.reason || 
                    apiData.explanation || 
                    apiData.risk_assessment || 
                    "Based on AI analysis of symptoms.",
        recommended_specialist: apiData.recommended_specialist || 
                              apiData.specialist || 
                              "General Physician",
      },
      recommended_specialists: apiData.recommended_specialist || 
                             apiData.specialist || 
                             "General Physician",
      recommended_doctors: apiData.doctors || 
                         apiData.recommended_doctors || 
                         getMockDoctors(apiData.recommended_specialist || "General Physician"),
      booking_status: apiData.booking_status || "Ready for consultation",
      date: Date.now(),
      agent_action: {
        input: `Patient symptoms: ${symptoms}`,
        output: apiData.advice || 
               apiData.recommendation || 
               "Please consult with a specialist for proper diagnosis.",
      },
    };
  };

  // Mock data for development/fallback
  const getMockDiagnosisData = (symptoms) => {
    const symptomsLower = symptoms.toLowerCase();
    let severity = "Moderate";
    let specialist = "General Physician";
    let riskReason = "Based on your symptoms, professional medical consultation is recommended.";

    if (symptomsLower.includes("chest") || symptomsLower.includes("shortness") || symptomsLower.includes("pressure")) {
      severity = "Severe";
      specialist = "Cardiologist";
      riskReason = "Chest-related symptoms may indicate serious cardiac issues requiring immediate attention.";
    } else if (symptomsLower.includes("headache") && symptomsLower.includes("blurred")) {
      severity = "Severe";
      specialist = "Neurologist";
      riskReason = "Headache with vision changes requires urgent neurological evaluation.";
    }

    return {
      severity: {
        severity: severity,
        risk_reason: riskReason,
        recommended_specialist: specialist,
      },
      recommended_specialists: specialist,
      recommended_doctors: getMockDoctors(specialist),
      booking_status: "Ready for consultation",
      date: Date.now(),
      agent_action: {
        input: `Patient symptoms: ${symptoms}`,
        output: `Based on your symptoms "${symptoms}", I recommend consulting a ${specialist}.`,
      },
    };
  };

  // Get mock doctors based on specialty
  const getMockDoctors = (specialty) => [
    {
      _id: "1",
      name: "Dr. Sarah Johnson",
      speciality: specialty,
      degree: "MD, MBBS",
      experience: "15 years",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
      available: true,
      fees: 150,
      about: `Specialized in ${specialty.toLowerCase()} with extensive experience in diagnosis and treatment.`,
      address: { line1: "123 Medical Center", city: "New York" },
    },
    {
      _id: "2",
      name: "Dr. Michael Chen",
      speciality: specialty,
      degree: "MD, PhD",
      experience: "12 years",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
      available: true,
      fees: 180,
      about: `Expert in ${specialty.toLowerCase()} with research background and patient-centered care.`,
      address: { line1: "456 Health Plaza", city: "New York" },
    },
  ];

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // Add user message
    const userMessage = { text: inputText, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    // Add bot typing indicator
    setMessages((prev) => [
      ...prev,
      { text: "...", sender: "bot", typing: true },
    ]);

    // Call your LLM API
    const diagnosisData = await callLLMAPI(inputText);

    // Remove typing indicator and add bot response
    setMessages((prev) => {
      const newMessages = prev.filter((msg) => !msg.typing);
      return [
        ...newMessages,
        {
          text: "I've analyzed your symptoms. Preparing your diagnosis report...",
          sender: "bot",
        },
      ];
    });

    // Navigate to diagnosis page with data
    setTimeout(() => {
      localStorage.setItem("diagnosisData", JSON.stringify(diagnosisData));
      navigate("/diagnosis", { state: { diagnosisData } });
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 overflow-hidden bg-transparent"
      >
        {isOpen ? (
          <FiX size={28} className="text-gray-700" />
        ) : (
          <img
            src={assets.chatbot_icon}
            alt="Medical Assistant"
            className="w-20 h-20 object-contain"
          />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col bg-white overflow-hidden border-2"
          style={{ borderColor: "#F8607C" }}
        >
          {/* Chat Header with API status */}
          <div
            className="p-4 flex items-center justify-between border-b"
            style={{
              borderColor: "#F8607C",
              backgroundColor: `${"#F8607C"}10`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#F8607C", color: "white" }}
              >
                <FiMessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-bold" style={{ color: "black" }}>
                  Medical Assistant
                </h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <p className="text-xs opacity-70" style={{ color: "black" }}>
                    {apiConnected ? 'API Connected • ' : 'API Offline • '}
                    Powered by AI
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
              style={{ color: "black" }}
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === "user"
                      ? "rounded-br-none"
                      : "rounded-bl-none"
                  }`}
                  style={{
                    backgroundColor:
                      message.sender === "user" ? "#F8607C" : `${"#F8607C"}15`,
                    color: message.sender === "user" ? "white" : "black",
                  }}
                >
                  {message.typing ? (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-current animate-bounce"></div>
                      <div
                        className="w-2 h-2 rounded-full bg-current animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-current animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            className="p-4 border-t"
            style={{ borderColor: `${"#F8607C"}30` }}
          >
            <div className="flex gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your symptoms here..."
                className="flex-1 border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{
                  borderColor: "#F8607C",
                  color: "black",
                  minHeight: "60px",
                  maxHeight: "120px",
                }}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="self-end w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#F8607C",
                  color: "white",
                }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiSend size={20} />
                )}
              </button>
            </div>
            <p
              className="text-xs mt-2 text-center opacity-60"
              style={{ color: "black" }}
            >
              {apiConnected ? 
                "API Connected • Press Enter to send" : 
                "Using demo mode • API is offline"}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
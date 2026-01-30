import express from "express";
import cors from "cors"; // Add this import
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import admintRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoutes.js";
import dotenv from 'dotenv';
dotenv.config();

// app config
const app = express();
const port = process.env.PORT || 4000;

// connect DB + Cloudinary
connectDB();
connectCloudinary();

// Remove favicon 404
app.get('/favicon.ico', (req, res) => res.status(204).end());

// CORS Configuration - COMBINED VERSION
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:5174", 
  "http://localhost:5175",
  "https://mentalhealthwebapp-backend.onrender.com",
  "https://mentalhealthwebapp-admin.onrender.com",
  "https://mentalhealthwebapp-frontend.onrender.com"
];

// Use both approaches for maximum compatibility
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "token", "atoken", "dtoken"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
}));

// Additional manual CORS headers as backup
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, token, atoken, dtoken, x-auth-token, Accept, Origin, X-Requested-With');
  res.setHeader('Access-Control-Expose-Headers', 'token, atoken, dtoken');
  res.setHeader('Vary', 'Origin');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// middlewares
app.use(express.json());

// api endpoints
app.use("/api/admin", admintRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

// health check
app.get("/", (req, res) => {
  res.send("API WORKING GREAT");
});

app.listen(port, () => {
  console.log("Server Started on port", port);
});
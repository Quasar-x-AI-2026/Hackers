from fastapi import FastAPI
from backend.routers.chat import router as chat_router


app = FastAPI(title="AI HealthCare Chatbot")
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
   allow_origins=[
        "http://localhost:5173",      # VITE DEFAULT PORT
        "http://127.0.0.1:5173",      # VITE ALTERNATIVE
        "http://localhost:3000",      # REACT DEFAULT
        "http://127.0.0.1:3000",      # REACT ALTERNATIVE
        "http://192.168.38.1:5173",   # AGAR FRONTEND BHI SAME LAPTOP PE HO
        "*",                          # TEMPORARY - SAB ALLOW KAREN
    ],  # hackathon ke liye ok
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)

@app.get("/")
def root():
    return {"status": "Server running"}



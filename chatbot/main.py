from fastapi import FastAPI
from chatbot.routers.chat import router as chat_router


app = FastAPI(title="AI HealthCare Chatbot")

app.include_router(chat_router)

@app.get("/")
def root():
    return {"status": "Server running"}



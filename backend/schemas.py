from pydantic import BaseModel


class ChatRequest(BaseModel):
    symptoms: str
    confirm: bool = False

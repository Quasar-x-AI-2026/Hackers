from pydantic import BaseModel


class ChatRequest(BaseModel):
    symptoms: str
    book: bool = False

from langchain_classic.agents import AgentExecutor, create_tool_calling_agent


from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool

from backend.tools.doctor_tool import fetch_doctors_by_speciality
from backend.tools.appointment_tool import book_appointment


# ---------- TOOLS ----------

@tool
def fetch_doctors_tool(specialities: list):
    """Fetch doctors based on medical specialities"""
    return fetch_doctors_by_speciality(specialities)


@tool
def book_appointment_tool(doctor_name: str, symptoms: str):
    """Book appointment with a doctor"""
    return book_appointment(doctor_name, symptoms)


# ---------- AGENT ----------

def get_appointment_agent(llm):

    tools = [fetch_doctors_tool, book_appointment_tool]

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a healthcare assistant that books doctor appointments."),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}")
    ])

    agent = create_tool_calling_agent(
        llm=llm,
        tools=tools,
        prompt=prompt
    )

    return AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True
    )

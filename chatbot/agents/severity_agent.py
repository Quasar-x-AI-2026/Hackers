from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.runnables import RunnableSequence


# 1️⃣ Prompt
severity_prompt = PromptTemplate(
    input_variables=["symptoms"],
    template="""
You are a medical triage assistant.

Classify the patient's condition severity strictly as:
- Mild
- Moderate
- Severe

Based on the symptoms, respond ONLY in valid JSON format.

{{
  "severity": "Mild | Moderate | Severe",
  "risk_reason": "short explanation",
  "recommended_specialist": "specialist name"
}}

Symptoms:
{symptoms}
"""
)


# 2️⃣ JSON Parser (IMPORTANT)
severity_parser = JsonOutputParser()


# 3️⃣ Runnable Chain (LCEL)
def detect_severity(llm, symptoms: str):
    chain: RunnableSequence = (
        severity_prompt
        | llm
        | severity_parser
    )

    return chain.invoke({"symptoms": symptoms})

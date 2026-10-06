import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

response = client.chat.completions.create(
    model="openai/gpt-oss-120b",

    messages=[
        {
            "role": "system",
            "content": "Extract technical skills from the resume."
        },
        {
            "role": "user",
            "content": """
            I am a Python developer with experience in FastAPI,
            React, PostgreSQL, Docker, Pandas and Machine Learning.
            """
        }
    ],

    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "resume_skills",
            "schema": {
                "type": "object",
                "properties": {
                    "skills": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "required": ["skills"],
                "additionalProperties": False
            }
        }
    }
)

print(response.choices[0].message.content)
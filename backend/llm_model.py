import os
import json

from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel


load_dotenv()




class ResumeInfo(BaseModel):
    skills: list[str]
    expertise: str


class JDInfo(BaseModel):
    skills: list[str]


class MatchAnalysis(BaseModel):
    summary: str
    strengths : list[str]
    skill_gaps : list[str]
    recommendations : list[str]

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL_NAME = "openai/gpt-oss-120b"



def extract_resume_info(resume_text):

    prompt = f"""
You are a professional resume analysis system.

Extract ONLY concrete technical skills.

Include:
- Programming languages
- Frameworks
- Libraries
- Databases
- Cloud platforms
- Developer tools
- Data/BI tools
- AI/ML technologies
- APIs and technical protocols
- Technical platforms
- Technical concepts that represent a specific skill

DO NOT include soft skills or personal attributes.

Do NOT include:
- Communication
- Teamwork
- Problem Solving
- Analytical Thinking
- Logical Thinking
- Leadership
- Creativity
- Adaptability
- Learning Ability
- User-Centric Design
- Time Management

Do NOT include:
- Job titles
- Company names
- College names
- Section headings
- Project names
- Generic concepts such as "development", "experience",
  "projects", "programming"

The rules above for concrete skills apply to the `skills` list.

For the `expertise` field, write one concise professional profile
sentence (about 12-24 words) describing the candidate's demonstrated
technical focus. Synthesize the strongest areas from the resume and
name supporting technologies only when they appear in the resume.
Describe the candidate's expertise, not the extraction process.

Good style: "Software development with Python, AI/ML, and full-stack
web applications." Use wording that is accurate for this resume; do not
copy the example unless it fits. Avoid generic meta text such as
"Technical skills extracted from the resume." Do not invent experience,
seniority, or technologies that are not supported by the resume.

RESUME:
{resume_text}
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": "You are a professional resume analysis system."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "resume_info",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "skills": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        },
                        "expertise": {
                            "type": "string",
                            "description": "One concise, resume-grounded sentence describing the candidate's demonstrated technical focus; do not describe the extraction process."
                        }
                    },
                    "required": [
                        "skills",
                        "expertise"
                    ],
                    "additionalProperties": False
                }
            }
        }
    )

    result = json.loads(
        response.choices[0].message.content
    )

    return ResumeInfo.model_validate(result)




def extract_jd_skills(job_description):

    prompt = f"""
You are a Job Description skill extraction system.

Extract the genuine skills required or preferred by this
job description.

Include:
- Programming languages
- Frameworks
- Libraries
- Databases
- Cloud technologies
- Data/BI tools
- AI/ML technologies
- Developer tools
- Relevant technical concepts

Do NOT include:
- Company names
- Job titles
- Locations
- Salary information
- Generic words such as "experience", "responsibilities",
  "development", "candidate"

Normalize technology names to their canonical form.

Examples:

React.js -> React
ReactJS -> React
React JS -> React

CSS3 -> CSS
CSS 3 -> CSS

HTML5 -> HTML
HTML 5 -> HTML

JavaScript -> JavaScript
JS -> JavaScript

TypeScript -> TypeScript
TS -> TypeScript

Node.js -> Node.js
NodeJS -> Node.js

Postgres -> PostgreSQL
PostgreSQL Database -> PostgreSQL

Mongo -> MongoDB

GitHub -> GitHub
GitLab -> GitLab

REST API -> REST APIs
RESTful API -> REST APIs

PowerBI -> Power BI
Power BI Dashboard -> Power BI

PyTorch Framework -> PyTorch
TensorFlow Framework -> TensorFlow

Scikit Learn -> Scikit-learn
Sklearn -> Scikit-learn

React Hooks -> React

Remove duplicates.

JOB DESCRIPTION:
{job_description}
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": "You are a Job Description skill extraction system."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "jd_info",
                "strict": True,
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
                    "required": [
                        "skills"
                    ],
                    "additionalProperties": False
                }
            }
        }
    )

    result = json.loads(
        response.choices[0].message.content
    )

    return JDInfo.model_validate(result)



def analyze_match(
    resume_skills,
    jd_skills,
    exact_matches,
    related_matches,
    missing_skills,
    match_percentage,
    expertise
):
    prompt = f"""
    You are an AI career analysis system.

Analyze how well this candidate's resume aligns with
the provided job requirements.

IMPORTANT:
- Only use information provided below.
- Do not invent skills.
- Do not assume a skill exists unless it appears in
  the resume skills.
- Distinguish exact matches from related matches.
- Focus primarily on technical/job-relevant skills.
- Do not make claims about hiring probability.

CANDIDATE EXPERTISE:
{expertise}

RESUME SKILLS:
{resume_skills}

JOB DESCRIPTION SKILLS:
{jd_skills}

EXACT MATCHES:
{exact_matches}

RELATED MATCHES:
{related_matches}

MISSING SKILLS:
{missing_skills}

CALCULATED SKILL MATCH:
{match_percentage}%

Provide:

1. A concise summary of the candidate's alignment.
2. The strongest relevant skills.
3. The most important skill gaps.
4. Practical recommendations for improving alignment.

Do NOT recalculate the percentage.
The provided percentage was calculated by the application.
    
    """
    response = client.chat.completions.create(
        model = MODEL_NAME,
        
        messages=[
            {
                "role" : "system",
                "content" : "You are an AI career analysis system"
            },
            {
                "role" : "user",
                "content" : prompt
            }
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "match_analysis",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "summary": {
                            "type": "string"
                        },
                        "strengths": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        },
                        "skill_gaps": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        },
                        "recommendations": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        }
                    },
                    "required": [
                        "summary",
                        "strengths",
                        "skill_gaps",
                        "recommendations"
                    ],
                    "additionalProperties": False
                }
            }
        }
    )
    
    result = json.loads(
        response.choices[0].message.content
    )
    
    return MatchAnalysis.model_validate(result)

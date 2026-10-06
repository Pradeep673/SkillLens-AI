import re

SKILLS = [
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "FastAPI",
    "Flask",
    "Django",
    "SQL",
    "PostgreSQL",
    "MongoDB",
    "MySQL",
    "Power BI",
    "Tableau",
    "Excel",
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "Git",
    "GitHub",
    "PySpark",
    "Spark",
    "Pandas",
    "NumPy",
    "TensorFlow",
    "PyTorch",
    "Scikit-learn",
]


def extract_skills(text):
    found_skills = set()
    
    for sk in SKILLS:
        pattern = r"\b" + re.escape(sk) + r"\b"
        
        if re.search(pattern,text,re.IGNORECASE):
            found_skills.add(sk)
    
    return list(found_skills)
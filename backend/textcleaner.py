import re

def clean_text(text):
    
    text = text.replace("\r","")
    
    text = text.replace("\t","")
    
    text = re.sub(r" +"," ",text)
    
    
    text = re.sub(r"\n\s*\n","\n\n",text)
    
    lines = [line.strip() for line in text.split("\n")]
    
    lines = [line for line in lines if line]
    
    text = "\n".join(lines)
    
    return text
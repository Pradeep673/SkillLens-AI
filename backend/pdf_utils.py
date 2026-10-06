import fitz

def extract_text_from_pdf(file_data):

    pdf = fitz.open(
        stream=file_data,
        filetype="pdf"
    )

    text = ""

    for page in pdf:
        text += page.get_text()

    pdf.close()

    return text
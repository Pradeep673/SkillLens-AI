from transformers import pipeline

ner_model = pipeline(
    "ner",
    model="Nucha/Nucha_ITSkillNER_BERT",
    aggregation_strategy="simple"
)


def extract_entities(text):

    results = ner_model(text)

    cleaned_results = []

    for entity in results:
        cleaned_results.append({
            "entity_group": entity["entity_group"],
            "score": float(entity["score"]),
            "word": entity["word"],
            "start": int(entity["start"]),
            "end": int(entity["end"])
        })

    return cleaned_results
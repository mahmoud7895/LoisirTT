from fastapi import FastAPI
from transformers import pipeline
import uvicorn

app = FastAPI()

# Charger le modèle au démarrage
print("Chargement du modèle de sentiment...")
classifier = pipeline('sentiment-analysis', model='nlptown/bert-base-multilingual-uncased-sentiment')
print("Modèle chargé avec succès.")

@app.post("/analyze")
async def analyze_sentiment(data: dict):
    text = data.get("text")
    if not text:
        return {"error": "Le texte est requis."}
    
    try:
        result = classifier(text)[0]
        stars = int(result["label"].split()[0])
        
        # Conversion des étoiles en sentiment
        if stars >= 4:
            sentiment_label = "POSITIVE"
        elif stars <= 2:
            sentiment_label = "NEGATIVE"
        else:
            sentiment_label = "NEUTRAL"
        
        return {
            "label": sentiment_label,  # POSITIVE/NEGATIVE/NEUTRAL
            "score": result["score"],
            "stars": stars  # Conserver l'info originale
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
import os
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

import openai
import logging
from openai import AuthenticationError, RateLimitError, APIConnectionError, Timeout
from google.cloud import language_v1, firestore, texttospeech, storage

# Load environment variables
load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Expect environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME")

# Validate environment setup
if not OPENAI_API_KEY:
    raise EnvironmentError("Please set the OPENAI_API_KEY environment variable.")
if not GCS_BUCKET_NAME:
    raise EnvironmentError("Please set the GCS_BUCKET_NAME environment variable.")

# OpenAI API Key setup
openai.api_key = OPENAI_API_KEY

# Initialize Google Cloud clients WITHOUT JSON key
# Cloud Run automatically uses the default service account credentials
language_client = language_v1.LanguageServiceClient()
firestore_client = firestore.Client()
tts_client = texttospeech.TextToSpeechClient()
storage_client = storage.Client()
bucket = storage_client.bucket(GCS_BUCKET_NAME)

# Root route to prevent 404 errors
@app.route('/favicon.ico')
def favicon():
    return '', 204  # No Content

@app.route("/")
def index():
    return jsonify({"message": "Welcome to Milo Mindful Garden API!"})

@app.after_request
def add_headers(response):
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

# --- Routes ---

@app.route("/api/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return '', 204  # Respond to preflight requests

    data = request.get_json()
    user_message = data.get("message")
    if not user_message:
        return jsonify({"error": "Missing 'message'"}), 400
    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": user_message}],
            max_tokens=150,
        )
        content = response.choices[0].message.content
        return jsonify({"response": content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/sentiment", methods=["POST"])
def sentiment():
    data = request.get_json()
    text = data.get("text")
    if not text:
        return jsonify({"error": "Missing 'text'"}), 400
    document = language_v1.Document(content=text, type_=language_v1.Document.Type.PLAIN_TEXT)
    try:
        sentiment_result = language_client.analyze_sentiment(request={"document": document}).document_sentiment
        return jsonify({
            "score": sentiment_result.score,
            "magnitude": sentiment_result.magnitude
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/tts", methods=["POST"])
def tts():
    data = request.get_json()
    text = data.get("text")
    if not text:
        return jsonify({"error": "Missing 'text'"}), 400
    synthesis_input = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US", ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
    )
    audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)
    try:
        response = tts_client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)
        filename = f"audio/{uuid.uuid4()}.mp3"
        blob = bucket.blob(filename)
        blob.upload_from_string(response.audio_content, content_type="audio/mpeg")
        audio_url = f"https://storage.googleapis.com/{GCS_BUCKET_NAME}/{filename}"
        return jsonify({"audio_url": audio_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/mood", methods=["POST"])
def save_mood():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing mood data"}), 400
    try:
        doc_ref = firestore_client.collection("moods").document()
        doc_ref.set(data)
        return jsonify({"id": doc_ref.id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/mood", methods=["GET"])
def get_moods():
    try:
        moods = []
        docs = firestore_client.collection("moods").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(10).stream()
        for doc in docs:
            mood = doc.to_dict()
            mood["id"] = doc.id
            moods.append(mood)
        return jsonify(moods)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Run app ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)

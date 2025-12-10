# ml-service/app.py

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

# --- 1. Initialize Flask App and CORS ---
app = Flask(__name__)
# Allow your Node.js backend to make requests to this API
CORS(app, resources={r"/analyze": {"origins": "http://localhost:5000"}}) 

# --- 2. Load the Pre-trained AI Model ---
# The model is loaded once when the application starts for better performance.
print("Loading Hugging Face sentiment model (DistilBERT)...")
try:
    sentiment_pipeline = pipeline(
        "sentiment-analysis", 
        model="distilbert-base-uncased-finetuned-sst-2-english"
    )
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    sentiment_pipeline = None

# --- 3. Define the API Routes ---
@app.route('/')
def home():
    """A simple route to check if the service is running."""
    return "Upgraded ML Sentiment API is running!"

@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    """The main endpoint for analyzing text sentiment."""
    if not sentiment_pipeline:
        return jsonify({'error': 'Model is not available'}), 503

    data = request.get_json()
    if not data or 'text' not in data or not data['text'].strip():
        return jsonify({'error': 'No text provided in the request body'}), 400

    text = data['text']

    try:
        results = sentiment_pipeline(text)
        result = results[0]  # The pipeline returns a list

        sentiment = result['label'].lower()
        score = result['score']

        # If the model's confidence is not very high, classify as 'neutral'.
        # This threshold (0.70) can be adjusted based on testing.
        if score < 0.70:
            sentiment = "neutral"

        print(f"Analyzed sentiment as '{sentiment}' with score {score:.2f}")
        return jsonify({"sentiment": sentiment})

    except Exception as e:
        print(f"Error during sentiment analysis: {e}")
        return jsonify({'error': 'Failed to process the text'}), 500

# --- 4. Run the Server ---
if __name__ == '__main__':
    # This block runs the app with the development server (python app.py)
    print("Starting Flask app in development mode...")
    app.run(host="0.0.0.0", port=5001)
# ml-service/app.py

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

# --- 1. Initialize Flask App ---
app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# --- 2. Load the Pre-trained AI Models ---
# We load these once at startup. This requires ~2GB RAM.

print("Loading AI Models...")

# A. Sentiment Model (Same as before)
try:
    sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
    print("Sentiment Model Loaded!")
except Exception as e:
    print(f"Error loading Sentiment: {e}")
    sentiment_pipeline = None

# B. Topic Modeling (Zero-Shot Classification)
# This model can classify text into ANY categories we define dynamically.
try:
    classifier_pipeline = pipeline("zero-shot-classification", model="valhalla/distilbart-mnli-12-3")
    print("Topic Modeling Model Loaded!")
except Exception as e:
    print(f"Error loading Topic Model: {e}")
    classifier_pipeline = None

# C. Summarization Model
try:
    summarizer_pipeline = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
    print("Summarization Model Loaded!")
except Exception as e:
    print(f"Error loading Summarizer: {e}")
    summarizer_pipeline = None


# --- 3. Helper Function for Aspect-Based Analysis ---
def simple_aspect_analysis(text):
    """
    Simulates Aspect-Based Analysis by splitting sentences 
    specifically around contrast words like 'but', 'however'.
    """
    aspects = []
    # Split by common contrast words to isolate opinions
    chunks = text.replace(" but ", "|").replace(" however ", "|").replace(" and ", "|").split("|")
    
    for chunk in chunks:
        chunk = chunk.strip()
        if len(chunk) > 5: # Ignore tiny fragments
            result = sentiment_pipeline(chunk)[0]
            aspects.append({
                "segment": chunk,
                "sentiment": result['label'],
                "score": round(result['score'], 2)
            })
    return aspects

# --- 4. API Routes ---

@app.route('/')
def home():
    return "Advanced ML Service with Topics & Summarization is Running!"

@app.route('/analyze', methods=['POST'])
def analyze_feedback():
    """
    Analyzes a SINGLE feedback for:
    1. Overall Sentiment
    2. Topic Categorization (Teaching, Infrastructure, Canteen, etc.)
    3. Aspect Breakdown
    """
    data = request.get_json()
    text = data.get('text', '')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    response_data = {}

    # 1. Overall Sentiment
    if sentiment_pipeline:
        result = sentiment_pipeline(text)[0]
        response_data['sentiment'] = result['label']
        response_data['sentiment_score'] = round(result['score'], 2)

    # 2. Topic Modeling (Zero-Shot)
    # We define the candidate labels we care about
    labels = ["Teaching Quality", "Infrastructure", "Canteen Food", "Curriculum", "Lab Facilities"]
    if classifier_pipeline:
        topic_result = classifier_pipeline(text, candidate_labels=labels)
        # Get the top predicted topic
        response_data['primary_topic'] = topic_result['labels'][0]
        response_data['topic_confidence'] = round(topic_result['scores'][0], 2)

    # 3. Aspect-Based Analysis (Clause Splitting)
    if sentiment_pipeline:
        response_data['aspects'] = simple_aspect_analysis(text)

    return jsonify(response_data)


@app.route('/summarize', methods=['POST'])
def summarize_feedback():
    """
    Takes a LIST of feedback texts and generates a single summary.
    Useful for Admin Dashboards.
    """
    data = request.get_json()
    texts = data.get('texts', []) # Expecting a list ["feedback 1", "feedback 2"]

    if not texts or len(texts) == 0:
        return jsonify({'error': 'No texts provided'}), 400

    # Combine texts into one big block (truncate to 1024 chars for safety)
    combined_text = " ".join(texts)[:2000] 

    if summarizer_pipeline:
        try:
            # Generate summary (min_length ensures it's not too short)
            summary_result = summarizer_pipeline(combined_text, max_length=60, min_length=20, do_sample=False)
            summary_text = summary_result[0]['summary_text']
            return jsonify({'summary': summary_text})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Summarizer model not loaded'}), 503

if __name__ == '__main__':
    # Run on port 5001
    print("Starting Server...")
    app.run(host="0.0.0.0", port=5001)
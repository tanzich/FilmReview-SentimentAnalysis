from flask import Flask, jsonify, request, render_template
from flask_cors import CORS, cross_origin
from transformers import pipeline
import nltk
import sys
import json
import requests

app = Flask(__name__)
CORS(app, resources={r"*": {"origins": "*"}})

@app.route('/')
def index():
  return render_template('index.html')


API_TOKEN = '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'
API_URL = "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english"
headers = {"Authorization": f"Bearer {API_TOKEN}", "Access-Control-Allow-Origin" : API_URL}

@app.route('/sentiment', methods=['GET','OPTIONS','POST'])
def sentiment():
    data = request.get_data()
    response = requests.request("POST", API_URL, headers=headers, data=data)
    return jsonify(json.loads(response.content.decode("utf-8")))



API_URL_Emotion = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-emotion"
headers_emotion = {"Authorization": f"Bearer {API_TOKEN}", "Access-Control-Allow-Origin" : API_URL_Emotion}

@app.route('/emotion', methods=['OPTIONS','POST'])
def emotion():
    data_emo = request.get_data()
    response_emo = requests.request("POST", API_URL_Emotion, headers=headers_emotion, data=data_emo)
    return jsonify(json.loads(response_emo.content.decode("utf-8")))


API_URL_Stars = "https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment"
headers_emotion = {"Authorization": f"Bearer {API_TOKEN}", "Access-Control-Allow-Origin" : API_URL_Emotion}

@app.route('/star', methods=['OPTIONS','POST'])
def star():
    data_emo = request.get_data()
    response_emo = requests.request("POST", API_URL_Stars, headers=headers_emotion, data=data_emo)
    return jsonify(json.loads(response_emo.content.decode("utf-8")))


@app.route('/dataCleaning', methods=['OPTIONS','POST'])
def dataCleaning():
    data = request.get_data()
    word_list = []
    nltk.download('words')
    words = set(nltk.corpus.words.words())
    cleaned_input = (w for w in nltk.wordpunct_tokenize(data.decode('utf-8')) if w.lower() in words)
    for w in nltk.wordpunct_tokenize(data.decode('utf-8')):
      if w.lower() in words:
        word_list.append(w)
    return " ".join(word_list)

if __name__ == '__main__':
  app.run(debug=True)

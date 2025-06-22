from flask import Flask, request, jsonify
from flasgger import Swagger
import pandas as pd
import pickle

app = Flask(__name__)
swagger = Swagger(app)

# Load trained model
with open('results/model.pkl', 'rb') as f:
    model = pickle.load(f)

FEATURES = ["Retweet Count", "Mention Count", "Follower Count", "Verified", "Tweet_Length", "Hashtag_Count"]


def prepare_features(data: dict) -> pd.DataFrame:
    tweet = data.get("Tweet", "")
    hashtags = data.get("Hashtags", "")
    row = {
        "Retweet Count": data.get("Retweet Count", 0),
        "Mention Count": data.get("Mention Count", 0),
        "Follower Count": data.get("Follower Count", 0),
        "Verified": int(bool(data.get("Verified", False))),
        "Tweet_Length": len(tweet),
        "Hashtag_Count": len(str(hashtags).split()),
    }
    return pd.DataFrame([row])


@app.route('/predict', methods=['POST'])
def predict():
    """Predict whether a tweet is from a bot
    ---
    consumes:
      - application/json
    parameters:
      - in: body
        name: payload
        required: true
        schema:
          type: object
          properties:
            Tweet:
              type: string
            Retweet Count:
              type: integer
            Mention Count:
              type: integer
            Follower Count:
              type: integer
            Verified:
              type: boolean
            Hashtags:
              type: string
    responses:
      200:
        description: Prediction result
        schema:
          type: object
          properties:
            bot:
              type: boolean
    """
    data = request.get_json(force=True)
    df = prepare_features(data)
    pred = model.predict(df)[0]
    return jsonify({'bot': bool(pred)})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
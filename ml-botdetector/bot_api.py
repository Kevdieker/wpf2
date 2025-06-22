from flask import Flask, request, jsonify
from flasgger import Swagger
import pandas as pd
import pickle
from textblob import TextBlob
import re

app = Flask(__name__)
swagger = Swagger(app)

# Load trained model
with open('results/model.pkl', 'rb') as f:
    model = pickle.load(f)

FEATURES = [
    "Retweet Count",
    "Mention Count",
    "Follower Count",
    "Verified",
    "Tweet_Length",
    "Hashtag_Count",
    "Follower_Following_Ratio",
    "Account_Age_Days",
    "Tweets_Per_Day",
    "Sentiment",
    "Unique_Word_Ratio",
    "Emoji_Count",
    "URL_Count",
    "Exclamation_Count",
    "Question_Count",
    "Uppercase_Ratio",
    "Tweet_Hour",
    "Tweet_DayOfWeek",
    "Username_Length",
    "Username_Digit_Ratio",
]


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
        "Follower_Following_Ratio": data.get("Follower Count", 0)
                                    / (data.get("Following Count", 1) or 1),
        "Account_Age_Days": data.get("Account Age Days", 0),
        "Tweets_Per_Day": data.get("Statuses Count", 0) / (data.get("Account Age Days", 1) or 1),
        "Sentiment": TextBlob(tweet).sentiment.polarity,
        "Unique_Word_Ratio": len(set(tweet.split())) / len(tweet.split()) if tweet.split() else 0,
        "Emoji_Count": len(re.findall(r"[\U0001F600-\U0001F64F]|[\U0001F300-\U0001F5FF]|[\U0001F680-\U0001F6FF]|[\U0001F1E0-\U0001F1FF]", tweet)),
        "URL_Count": len(re.findall(r"https?://\S+", tweet)),
        "Exclamation_Count": tweet.count("!"),
        "Question_Count": tweet.count("?"),
        "Uppercase_Ratio": sum(1 for c in tweet if c.isupper()) / len(tweet) if tweet else 0,
        "Tweet_Hour": pd.to_datetime(data.get("Created At"), errors="coerce").hour if data.get("Created At") else 0,
        "Tweet_DayOfWeek": pd.to_datetime(data.get("Created At"), errors="coerce").dayofweek if data.get("Created At") else 0,
        "Username_Length": len(data.get("Username", "")),
        "Username_Digit_Ratio": (sum(1 for c in data.get("Username", "") if c.isdigit()) / len(data.get("Username", ""))) if data.get("Username") else 0,
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
import argparse
import os
import re
import kagglehub
import pandas as pd
import numpy as np
from textblob import TextBlob
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report


def load_dataset(csv_path=None):
    if csv_path:
        path = csv_path
    else:
        path = os.path.join(
            kagglehub.dataset_download("goyaladi/twitter-bot-detection-dataset"),
            "bot_detection_data.csv",
        )
    return pd.read_csv(path)


def prepare_features(df, aggregate_users=False):
    df["Verified"] = df["Verified"].astype(int)
    df["Tweet_Length"] = df["Tweet"].fillna("").apply(len)
    df["Hashtag_Count"] = df["Hashtags"].fillna("").apply(lambda x: len(str(x).split()))
    if "Following Count" in df.columns:
        df["Follower_Following_Ratio"] = df["Follower Count"] / df["Following Count"].replace(0, 1)
    else:
        df["Follower_Following_Ratio"] = 0
    if "Account Age Days" in df.columns:
        df["Account_Age_Days"] = df["Account Age Days"]
    elif "Account Creation Date" in df.columns:
        df["Account_Age_Days"] = (
                pd.Timestamp.now() - pd.to_datetime(df["Account Creation Date"])
        ).dt.days
    else:
        df["Account_Age_Days"] = 0
    if "Statuses Count" in df.columns:
        df["Tweets_Per_Day"] = df["Statuses Count"] / df["Account_Age_Days"].replace(0, 1)
    else:
        df["Tweets_Per_Day"] = 0
    df["Sentiment"] = df["Tweet"].fillna("").apply(lambda x: TextBlob(x).sentiment.polarity)
    df["Unique_Word_Ratio"] = df["Tweet"].fillna("").apply(lambda x: len(set(x.split())) / len(x.split()) if x.split() else 0)
    emoji_pattern = re.compile(r"[\U0001F600-\U0001F64F]|[\U0001F300-\U0001F5FF]|[\U0001F680-\U0001F6FF]|[\U0001F1E0-\U0001F1FF]")
    df["Emoji_Count"] = df["Tweet"].fillna("").apply(lambda x: len(emoji_pattern.findall(x)))
    url_pattern = re.compile(r"https?://\S+")
    df["URL_Count"] = df["Tweet"].fillna("").apply(lambda x: len(url_pattern.findall(x)))
    df["Exclamation_Count"] = df["Tweet"].fillna("").apply(lambda t: t.count("!"))
    df["Question_Count"] = df["Tweet"].fillna("").apply(lambda t: t.count("?"))
    df["Uppercase_Ratio"] = df["Tweet"].fillna("").apply(lambda x: sum(1 for c in x if c.isupper()) / len(x) if len(x) else 0)
    if "Created At" in df.columns:
        ts = pd.to_datetime(df["Created At"], errors="coerce")
        df["Tweet_Hour"] = ts.dt.hour.fillna(0).astype(int)
        df["Tweet_DayOfWeek"] = ts.dt.dayofweek.fillna(0).astype(int)
    else:
        df["Tweet_Hour"] = 0
        df["Tweet_DayOfWeek"] = 0
    df["Username_Length"] = df["Username"].fillna("").apply(len)
    df["Username_Digit_Ratio"] = df["Username"].fillna("").apply(lambda x: sum(1 for c in x if c.isdigit()) / len(x) if len(x) else 0)

    feature_cols = [
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
    X = df[feature_cols].copy()
    y = df["Bot Label"].copy()

    if aggregate_users:
        df_feat = X.copy()
        df_feat["Bot Label"] = y
        df_feat["Username"] = df["Username"]
        X = df_feat.groupby("Username")[feature_cols].mean()
        y = (
            df_feat.groupby("Username")["Bot Label"]
            .agg(lambda s: s.mode().iat[0])
        )

    return X, y


def evaluate_model(name, model, X_train, y_train, X_test, y_test):
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    report = classification_report(y_test, preds)
    scores = cross_val_score(model, X_train, y_train, cv=5)
    print("==", name, "==")
    print(report)
    print("CV accuracy", np.mean(scores))
    print()


def main():
    parser = argparse.ArgumentParser(description="Compare ML models")
    parser.add_argument("--csv")
    parser.add_argument("--sample", type=int, default=0, help="Use only the first N rows for quick runs")
    parser.add_argument("--aggregate-users", action="store_true", help="Aggregate multiple tweets from the same user")
    args = parser.parse_args()

    df = load_dataset(args.csv)
    if args.sample:
        df = df.head(args.sample)
    X, y = prepare_features(df, aggregate_users=args.aggregate_users)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    models = [
        ("RandomForest", RandomForestClassifier(n_estimators=200, random_state=42)),
        ("LogisticRegression", Pipeline([("scaler", StandardScaler()), ("clf", LogisticRegression(max_iter=1000))])),
        ("GradientBoosting", GradientBoostingClassifier(random_state=42)),
        ("SVM", Pipeline([("scaler", StandardScaler()), ("clf", SVC())])),
    ]

    for name, mdl in models:
        evaluate_model(name, mdl, X_train, y_train, X_test, y_test)


if __name__ == "__main__":
    main()
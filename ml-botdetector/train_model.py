import os
import pickle
import time
import argparse
from datetime import datetime
import re

import pandas as pd
import numpy as np
import kagglehub
from textblob import TextBlob
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import (
    train_test_split,
    learning_curve,
    validation_curve,
    GridSearchCV,
)
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt

def main():
    parser = argparse.ArgumentParser(description="Train Twitter bot detection model")
    parser.add_argument("--csv", help="Path to dataset CSV. Defaults to Kaggle dataset")
    parser.add_argument("--n-estimators", type=int, default=200, help="Number of trees")
    parser.add_argument("--max-depth", type=int, default=None, help="Max tree depth")
    parser.add_argument("--test-size", type=float, default=0.2, help="Fraction for test split")
    parser.add_argument("--model-out", default="model.pkl", help="Where to save the model")
    parser.add_argument("--metrics-out", default="metrics.txt", help="Filename for metrics text")
    parser.add_argument("--results-dir", default="results", help="Directory for metrics and charts")
    parser.add_argument(
        "--grid-search",
        action="store_true",
        help="Perform grid search for n_estimators and max_depth",
    )
    parser.add_argument(
        "--aggregate-users",
        action="store_true",
        help="Aggregate multiple tweets from the same user",
    )

    args = parser.parse_args()

    if args.csv:
        csv_file = args.csv
    else:
        dataset_path = kagglehub.dataset_download("goyaladi/twitter-bot-detection-dataset")
        csv_file = os.path.join(dataset_path, "bot_detection_data.csv")

    print("Loading dataset from", csv_file)
    df = pd.read_csv(csv_file)

    # Prepare features
    df["Verified"] = df["Verified"].astype(int)
    df["Tweet_Length"] = df["Tweet"].fillna("").apply(len)
    df["Hashtag_Count"] = df["Hashtags"].fillna("").apply(lambda x: len(str(x).split()))

    # Additional features based on available columns
    if "Following Count" in df.columns:
        df["Follower_Following_Ratio"] = df["Follower Count"] / df["Following Count"].replace(0, 1)
    else:
        df["Follower_Following_Ratio"] = 0

    if "Account Age Days" in df.columns:
        df["Account_Age_Days"] = df["Account Age Days"]
    elif "Account Creation Date" in df.columns:
        df["Account_Age_Days"] = (pd.Timestamp.now() - pd.to_datetime(df["Account Creation Date"])).dt.days
    else:
        df["Account_Age_Days"] = 0

    if "Statuses Count" in df.columns:
        df["Tweets_Per_Day"] = df["Statuses Count"] / df["Account_Age_Days"].replace(0, 1)
    else:
        df["Tweets_Per_Day"] = 0

    sentiment = df["Tweet"].fillna("").apply(lambda x: TextBlob(x).sentiment.polarity)
    df["Sentiment"] = sentiment

    df["Unique_Word_Ratio"] = df["Tweet"].fillna("").apply(
        lambda x: len(set(x.split())) / len(x.split()) if x.split() else 0
    )

    emoji_pattern = re.compile(
        r"[\U0001F600-\U0001F64F]|[\U0001F300-\U0001F5FF]|[\U0001F680-\U0001F6FF]|[\U0001F1E0-\U0001F1FF]"
    )
    df["Emoji_Count"] = df["Tweet"].fillna("").apply(lambda x: len(emoji_pattern.findall(x)))

    url_pattern = re.compile(r"https?://\S+")
    df["URL_Count"] = df["Tweet"].fillna("").apply(lambda x: len(url_pattern.findall(x)))

    df["Exclamation_Count"] = df["Tweet"].fillna("").apply(lambda t: t.count("!"))
    df["Question_Count"] = df["Tweet"].fillna("").apply(lambda t: t.count("?"))

    df["Uppercase_Ratio"] = df["Tweet"].fillna("").apply(
        lambda x: sum(1 for c in x if c.isupper()) / len(x) if len(x) else 0
    )

    if "Created At" in df.columns:
        ts = pd.to_datetime(df["Created At"], errors="coerce")
        df["Tweet_Hour"] = ts.dt.hour.fillna(0).astype(int)
        df["Tweet_DayOfWeek"] = ts.dt.dayofweek.fillna(0).astype(int)
    else:
        df["Tweet_Hour"] = 0
        df["Tweet_DayOfWeek"] = 0

    df["Username_Length"] = df["Username"].fillna("").apply(len)
    df["Username_Digit_Ratio"] = df["Username"].fillna("").apply(
        lambda x: sum(1 for c in x if c.isdigit()) / len(x) if len(x) else 0
    )

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

    if args.aggregate_users:
        df_feat = X.copy()
        df_feat["Bot Label"] = y
        df_feat["Username"] = df["Username"]
        X = df_feat.groupby("Username")[feature_cols].mean()
        y = (
            df_feat.groupby("Username")["Bot Label"]
            .agg(lambda s: s.mode().iat[0])
        )

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=args.test_size, random_state=42
    )

    # Train model
    model = RandomForestClassifier(random_state=42)

    if args.grid_search:
        param_grid = {
            "n_estimators": [1000,5000,10000],
            "max_depth": [ 30,40],
        }
        search = GridSearchCV(
            model,
            param_grid,
            cv=3,
            n_jobs=-1,
        )
        start = time.time()
        search.fit(X_train, y_train)
        duration = time.time() - start
        model = search.best_estimator_
        print("Best params:", search.best_params_)
    else:
        model.set_params(n_estimators=args.n_estimators, max_depth=args.max_depth)
        start = time.time()
        model.fit(X_train, y_train)
        duration = time.time() - start

    # Evaluate model
    preds = model.predict(X_test)
    report = classification_report(y_test, preds)
    print(report)
    print(f"Training time: {duration:.2f}s")

    os.makedirs(args.results_dir, exist_ok=True)
    model_path = os.path.join(args.results_dir, args.model_out)

    # Save model and metrics
    with open(model_path, "wb") as f:
        pickle.dump(model, f)

    metrics_path = os.path.join(args.results_dir, args.metrics_out)
    with open(metrics_path, "w") as f:
        f.write(report)

    # Confusion matrix
    cm = confusion_matrix(y_test, preds)
    fig, ax = plt.subplots(figsize=(4, 4))
    im = ax.imshow(cm, cmap="Blues")
    ax.set_xlabel("Predicted")
    ax.set_ylabel("True")
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(j, i, cm[i, j], ha="center", va="center", color="black")
    fig.colorbar(im, ax=ax)
    plt.tight_layout()
    cm_path = os.path.join(args.results_dir, "confusion_matrix.png")
    fig.savefig(cm_path)
    plt.close(fig)

    # Learning curve
    lc_sizes, lc_train, lc_val = learning_curve(
        model, X, y, cv=5, n_jobs=-1
    )
    fig, ax = plt.subplots()
    ax.plot(lc_sizes, lc_train.mean(axis=1), label="train")
    ax.plot(lc_sizes, lc_val.mean(axis=1), label="validation")
    ax.set_xlabel("Training examples")
    ax.set_ylabel("Score")
    ax.legend()
    lc_path = os.path.join(args.results_dir, "learning_curve.png")
    fig.savefig(lc_path)
    plt.close(fig)

    # Validation curve for n_estimators
    param_range = [100, 200, 300, 400, 500]
    vc_train, vc_val = validation_curve(
        RandomForestClassifier(max_depth=args.max_depth, random_state=42),
        X,
        y,
        param_name="n_estimators",
        param_range=param_range,
        cv=5,
        n_jobs=-1,
    )
    fig, ax = plt.subplots()
    ax.plot(param_range, vc_train.mean(axis=1), label="train")
    ax.plot(param_range, vc_val.mean(axis=1), label="validation")
    ax.set_xlabel("n_estimators")
    ax.set_ylabel("Score")
    ax.legend()
    vc_path = os.path.join(args.results_dir, "validation_curve.png")
    fig.savefig(vc_path)
    plt.close(fig)

    # Feature importance
    fig, ax = plt.subplots(figsize=(6, 4))
    importances = model.feature_importances_
    ax.barh(feature_cols, importances)
    ax.set_xlabel("Importance")
    plt.tight_layout()
    fi_path = os.path.join(args.results_dir, "feature_importance.png")
    fig.savefig(fi_path)
    plt.close(fig)

    print(f"Model saved to {model_path}")
    print(f"Metrics saved to {metrics_path}")
    print(f"Confusion matrix saved to {cm_path}")
    print(f"Feature importance saved to {fi_path}")
    print(f"Learning curve saved to {lc_path}")
    print(f"Validation curve saved to {vc_path}")


if __name__ == "__main__":
    main()
import os
import pickle
import time
import argparse
import pandas as pd
import kagglehub
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

def main():
    parser = argparse.ArgumentParser(description="Train Twitter bot detection model")
    parser.add_argument("--csv", help="Path to dataset CSV. Defaults to Kaggle dataset")
    parser.add_argument("--n-estimators", type=int, default=200, help="Number of trees")
    parser.add_argument("--max-depth", type=int, default=None, help="Max tree depth")
    parser.add_argument("--test-size", type=float, default=0.2, help="Fraction for test split")
    parser.add_argument("--model-out", default="model.pkl", help="Where to save the model")
    parser.add_argument("--metrics-out", default="metrics.txt", help="Where to save metrics")
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

    feature_cols = [
        "Retweet Count",
        "Mention Count",
        "Follower Count",
        "Verified",
        "Tweet_Length",
        "Hashtag_Count",
    ]
    X = df[feature_cols]
    y = df["Bot Label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=args.test_size, random_state=42
    )

    # Train model
    model = RandomForestClassifier(
        n_estimators=args.n_estimators,
        max_depth=args.max_depth,
        random_state=42,
    )
    start = time.time()
    model.fit(X_train, y_train)
    duration = time.time() - start

    # Evaluate model
    preds = model.predict(X_test)
    report = classification_report(y_test, preds)
    print(report)
    print(f"Training time: {duration:.2f}s")

    # Save model and metrics
    with open(args.model_out, "wb") as f:
        pickle.dump(model, f)

    with open(args.metrics_out, "w") as f:
        f.write(report)

    print(f"Model saved to {args.model_out}")


if __name__ == "__main__":
    main()
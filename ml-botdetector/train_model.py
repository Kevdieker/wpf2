import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import pickle

# Beispiel-Daten laden
df = pd.read_csv("training_data.csv")  # Deine Trainingsdaten

# Features extrahieren
X = df[['followers', 'following', 'posts']]
X['follower_following_ratio'] = df['followers'] / (df['following'] + 1)
y = df['is_bot']

# Modell trainieren
model = RandomForestClassifier()
model.fit(X, y)

# Modell speichern
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Modell gespeichert unter model.pkl")

# ML Bot Detector

This directory contains a small bot detection experiment.

## Installation

```bash
pip install -r requirements.txt
```

## Training

Run the training script to download the Kaggle dataset and train a `RandomForest` model. You can modify the number of trees or depth which also changes training time:

```bash
python train_model.py --n-estimators 300 --max-depth 10
```

Metrics are printed and saved to `metrics.txt`. The trained model is written to `model.pkl` by default.

## API

Start the API after training:

```bash
python bot_api.py
```

Swagger documentation is available at `http://localhost:5000/apidocs/`.

### Example request from PowerShell

```powershell
Invoke-RestMethod http://localhost:5000/predict -Method Post -Body (
    @{ Tweet='Hello'; 'Retweet Count'=0; 'Mention Count'=0; 'Follower Count'=100; Verified=$false; Hashtags='' } |
    ConvertTo-Json
) -ContentType 'application/json'
```

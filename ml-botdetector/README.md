# ML Bot Detector

This directory contains a small bot detection experiment.

## Installation

```bash
pip install -r requirements.txt
```

## Training

Run the training script to download the Kaggle dataset and train a `RandomForest` model. You can modify the number of trees or depth which also changes training time. Metrics and charts are written to the `results/` directory:

```bash
python train_model.py --n-estimators 300 --max-depth 10
```

Metrics are printed and saved to `results/metrics.txt`. In addition to the confusion matrix and feature importance, the training script now writes learning and validation curves to the `results/` folder. The trained model is written to `results/model.pkl` by default.

The model uses several numeric features such as follower/following ratio, account age or tweet sentiment. You can tweak the number of trees and depth to train longer models:

```bash
python train_model.py --n-estimators 500 --max-depth 20
```

## API

Start the API after training:

```bash
python bot_api.py
```

Swagger documentation is available at `http://localhost:5000/apidocs/`.

### Example request from PowerShell

```powershell
Invoke-RestMethod http://localhost:5000/predict -Method Post -Body (
    @{ Tweet='Hello'; 'Retweet Count'=0; 'Mention Count'=0; 'Follower Count'=100; 'Following Count'=50; 'Account Age Days'=365; 'Statuses Count'=200; Verified=$false; Hashtags='' } |
    ConvertTo-Json
) -ContentType 'application/json'
```
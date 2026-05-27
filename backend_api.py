from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import tensorflow as tf
import json
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading model...")
interpreter = tf.lite.Interpreter(
    model_path="model/signbridge_model.tflite"
)
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

with open("model/labels.json") as f:
    LABELS = json.load(f)

print(f"Model loaded! Gestures: {len(LABELS)}")

FRAMES = 30
FEATURES = 126

class PredictRequest(BaseModel):
    landmarks: list

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "loaded",
        "gestures": len(LABELS)
    }

@app.post("/predict")
def predict(req: PredictRequest):
    try:
        sequence = req.landmarks
        fixed_seq = []
        for frame in sequence:
            flat = np.array(frame).flatten()
            if len(flat) < FEATURES:
                flat = np.pad(flat, (0, FEATURES - len(flat)))
            elif len(flat) > FEATURES:
                flat = flat[:FEATURES]
            fixed_seq.append(flat.tolist())

        while len(fixed_seq) < FRAMES:
            fixed_seq.append([0.0] * FEATURES)
        fixed_seq = fixed_seq[:FRAMES]

        input_data = np.array([fixed_seq], dtype=np.float32)
        interpreter.set_tensor(input_details[0]['index'], input_data)
        interpreter.invoke()
        output = interpreter.get_tensor(output_details[0]['index'])

        pred_idx = int(np.argmax(output[0]))
        confidence = float(output[0][pred_idx])
        gesture = LABELS[pred_idx]

        if confidence < 0.5:
            return {"gesture": None, "confidence": confidence}

        return {
            "gesture": gesture,
            "confidence": round(confidence, 3)
        }

    except Exception as e:
        return {"error": str(e), "gesture": None, "confidence": 0}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
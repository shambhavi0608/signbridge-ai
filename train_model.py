import json
import numpy as np
import os
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

print("Loading dataset...")
with open("dataset/dataset.json") as f:
    data = json.load(f)

GESTURES = data["gestures"]
samples = data["samples"]
print(f"Total samples: {len(samples)}")
print(f"Total gestures: {len(GESTURES)}")

FRAMES = 30
LANDMARKS = 42
FEATURES = LANDMARKS * 3

X, y = [], []
for s in samples:
    sequence = s["landmarks"]
    fixed_seq = []
    for frame in sequence:
        frame = np.array(frame)
        flat = frame.flatten()
        if len(flat) < FEATURES:
            flat = np.pad(flat, (0, FEATURES - len(flat)))
        elif len(flat) > FEATURES:
            flat = flat[:FEATURES]
        fixed_seq.append(flat)
    while len(fixed_seq) < FRAMES:
        fixed_seq.append(np.zeros(FEATURES))
    fixed_seq = fixed_seq[:FRAMES]
    X.append(fixed_seq)
    y.append(s["gesture"])

X = np.array(X, dtype=np.float32)
print(f"X shape: {X.shape}")

le = LabelEncoder()
y_encoded = le.fit_transform(y)
y_cat = tf.keras.utils.to_categorical(y_encoded, len(GESTURES))

X_train, X_test, y_train, y_test = train_test_split(
    X, y_cat,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

print(f"Train: {len(X_train)} | Test: {len(X_test)}")
input_shape = (FRAMES, FEATURES)
print(f"Input shape: {input_shape}")

model = Sequential([
    LSTM(128, return_sequences=True,
         input_shape=input_shape,
         dropout=0.2, recurrent_dropout=0.2),
    BatchNormalization(),
    LSTM(256, return_sequences=True,
         dropout=0.2, recurrent_dropout=0.2),
    BatchNormalization(),
    LSTM(128, return_sequences=False,
         dropout=0.2, recurrent_dropout=0.2),
    BatchNormalization(),
    Dense(128, activation='relu'),
    Dropout(0.3),
    Dense(64, activation='relu'),
    Dropout(0.2),
    Dense(len(GESTURES), activation='softmax')
])

model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

os.makedirs("model", exist_ok=True)
os.makedirs("public/model", exist_ok=True)

callbacks = [
    EarlyStopping(
        monitor='val_accuracy',
        patience=15,
        restore_best_weights=True,
        verbose=1
    ),
    ModelCheckpoint(
        "model/best_model.h5",
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1
    ),
    ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=5,
        min_lr=0.00001,
        verbose=1
    )
]

print("\nTraining started...")
history = model.fit(
    X_train, y_train,
    epochs=100,
    batch_size=16,
    validation_data=(X_test, y_test),
    callbacks=callbacks,
    verbose=1
)

loss, acc = model.evaluate(X_test, y_test, verbose=0)
print(f"\nFinal Accuracy: {acc*100:.2f}%")

model.save("model/signbridge_model.h5")
np.save("model/label_encoder.npy", le.classes_)

with open("model/labels.json", "w") as f:
    json.dump(GESTURES, f)

with open("public/model/labels.json", "w") as f:
    json.dump(GESTURES, f)

print("\nConverting to TFLite...")
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

with open("model/signbridge_model.tflite", "wb") as f:
    f.write(tflite_model)

with open("public/model/signbridge_model.tflite", "wb") as f:
    f.write(tflite_model)

print("\n✅ ALL DONE!")
print(f"Accuracy: {acc*100:.2f}%")
print("Files saved:")
print("  model/signbridge_model.h5")
print("  model/signbridge_model.tflite")
print("  model/labels.json")
print("  public/model/signbridge_model.tflite")
print("  public/model/labels.json")
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
from collections import Counter

print("Loading dataset...")
with open("dataset/dataset.json") as f:
    data = json.load(f)

GESTURES = data["gestures"]
samples = data["samples"]
print(f"Total samples: {len(samples)}")

FRAMES = 30
FEATURES = 126

X, y = [], []
for s in samples:
    sequence = s["landmarks"]
    fixed_seq = []
    for frame in sequence:
        flat = np.array(frame).flatten()
        if len(flat) < FEATURES:
            flat = np.pad(flat, (0, FEATURES - len(flat)))
        elif len(flat) > FEATURES:
            flat = flat[:FEATURES]
        fixed_seq.append(flat)
    while len(fixed_seq) < FRAMES:
        fixed_seq.append(np.zeros(FEATURES))
    X.append(fixed_seq[:FRAMES])
    y.append(s["gesture"])

X = np.array(X, dtype=np.float32)
print(f"X shape: {X.shape}")

counts = Counter(y)
valid_gestures = [g for g, c in counts.items() if c >= 2]
print(f"Valid gestures: {len(valid_gestures)}")

filtered_X = [xi for xi, yi in zip(X, y) if yi in valid_gestures]
filtered_y = [yi for yi in y if yi in valid_gestures]

X = np.array(filtered_X, dtype=np.float32)
y = filtered_y

le = LabelEncoder()
y_encoded = le.fit_transform(y)
y_cat = tf.keras.utils.to_categorical(y_encoded, len(valid_gestures))

X_train, X_test, y_train, y_test = train_test_split(
    X, y_cat, test_size=0.2,
    random_state=42, stratify=y_encoded
)

print(f"Train: {len(X_train)} | Test: {len(X_test)}")

model = Sequential([
    LSTM(128, return_sequences=True,
         input_shape=(FRAMES, FEATURES),
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
    Dense(len(valid_gestures), activation='softmax')
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
    EarlyStopping(monitor='val_accuracy', patience=15,
                  restore_best_weights=True, verbose=1),
    ModelCheckpoint("model/best_model.h5", monitor='val_accuracy',
                    save_best_only=True, verbose=1),
    ReduceLROnPlateau(monitor='val_loss', factor=0.5,
                      patience=5, min_lr=0.00001, verbose=1)
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

labels = list(le.classes_)
with open("model/labels.json", "w") as f:
    json.dump(labels, f)
with open("public/model/labels.json", "w") as f:
    json.dump(labels, f)

print("\nConverting to TFLite with flex ops...")
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_ops = [
    tf.lite.OpsSet.TFLITE_BUILTINS,
    tf.lite.OpsSet.SELECT_TF_OPS
]
converter._experimental_lower_tensor_list_ops = False
tflite_model = converter.convert()

with open("model/signbridge_model.tflite", "wb") as f:
    f.write(tflite_model)
with open("public/model/signbridge_model.tflite", "wb") as f:
    f.write(tflite_model)

print("\n✅ ALL DONE!")
print(f"Accuracy: {acc*100:.2f}%")
print(f"Gestures: {len(labels)}")
print("Files saved in model/ and public/model/")
import cv2
import mediapipe as mp
import numpy as np
import json
import os

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    model_complexity=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

GESTURES = [
    "A","B","C","D","E","F","G","H","I","J",
    "K","L","M","N","O","P","Q","R","S","T",
    "U","V","W","X","Y","Z",
    "HELLO","YES","NO","PLEASE","THANK_YOU",
    "SORRY","I","YOU","WE","NAME",
    "HELP","STOP","GO","COME","WAIT",
    "GOOD","BAD","HAPPY","SAD","ANGRY",
    "WHAT","WHERE","WHEN","WHY","HOW",
    "WATER","FOOD","HOME","SCHOOL","WORK",
    "MONEY","TIME","DAY","NIGHT","SICK",
    "DOCTOR","MOTHER","FATHER","LOVE"
]

SAMPLES = 30
FRAMES = 30

os.makedirs("dataset", exist_ok=True)

if os.path.exists("dataset/dataset.json"):
    with open("dataset/dataset.json") as f:
        saved = json.load(f)
    dataset = saved["samples"]
    print(f"Loaded {len(dataset)} existing samples")
else:
    dataset = []
    print("Starting fresh dataset")

def save_dataset():
    with open("dataset/dataset.json", "w") as f:
        json.dump({
            "gestures": GESTURES,
            "total": len(dataset),
            "samples": dataset
        }, f)

def get_landmarks(result):
    empty = [[0.0, 0.0, 0.0]] * 21
    
    if not result.multi_hand_landmarks:
        return empty + empty
    
    hands_data = {}
    if result.multi_handedness:
        for i, handedness in enumerate(result.multi_handedness):
            label = handedness.classification[0].label
            lm = [[l.x, l.y, l.z] for l in result.multi_hand_landmarks[i].landmark]
            hands_data[label] = lm
    
    left = hands_data.get("Left", empty)
    right = hands_data.get("Right", empty)
    
    return left + right

def draw_all(frame, result):
    if result.multi_hand_landmarks:
        for i, hand_lm in enumerate(result.multi_hand_landmarks):
            mp_draw.draw_landmarks(
                frame,
                hand_lm,
                mp_hands.HAND_CONNECTIONS,
                mp_draw.DrawingSpec((0, 255, 0), 2, 3),
                mp_draw.DrawingSpec((255, 255, 0), 2)
            )
            if result.multi_handedness:
                label = result.multi_handedness[i].classification[0].label
                lm0 = hand_lm.landmark[0]
                cx = int(lm0.x * frame.shape[1])
                cy = int(lm0.y * frame.shape[0])
                cv2.putText(frame, label, (cx, cy - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
cap.set(cv2.CAP_PROP_FPS, 30)

print("SPACE=Record | S=Skip | ESC=Quit\n")

for gesture in GESTURES:

    existing = len([s for s in dataset if s["gesture"] == gesture])
    if existing >= SAMPLES:
        print(f"SKIP: {gesture} ({existing} samples done)")
        continue

    samples_collected = existing
    print(f"\nGESTURE: {gesture} — need {SAMPLES - existing} more")

    while samples_collected < SAMPLES:

        # WAIT SCREEN
        while True:
            ret, frame = cap.read()
            if not ret:
                continue
            frame = cv2.flip(frame, 1)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            rgb.flags.writeable = False
            result = hands.process(rgb)
            rgb.flags.writeable = True
            draw_all(frame, result)

            # Top bar
            cv2.rectangle(frame, (0,0), (640,70), (0,0,0), -1)
            cv2.putText(frame, f"GESTURE: {gesture}",
                (10, 45), cv2.FONT_HERSHEY_SIMPLEX,
                1.2, (0,165,255), 2)

            # Hand count
            if result.multi_hand_landmarks:
                n = len(result.multi_hand_landmarks)
                msg = f"{n} HAND{'S' if n>1 else ''} DETECTED"
                col = (0,255,0)
            else:
                msg = "NO HAND DETECTED — Show hands!"
                col = (0,0,255)
            cv2.putText(frame, msg,
                (10, 100), cv2.FONT_HERSHEY_SIMPLEX,
                0.75, col, 2)

            # Progress
            cv2.putText(frame,
                f"Sample: {samples_collected}/{SAMPLES}",
                (10, 140), cv2.FONT_HERSHEY_SIMPLEX,
                0.7, (255,255,255), 2)

            # Progress bar
            pct = int((samples_collected/SAMPLES) * 620)
            cv2.rectangle(frame,(10,420),(630,445),(40,40,40),-1)
            cv2.rectangle(frame,(10,420),(10+pct,445),(0,200,0),-1)

            # Bottom instructions
            cv2.rectangle(frame,(0,450),(640,480),(0,0,0),-1)
            cv2.putText(frame,
                "SPACE=Record  |  S=Skip  |  ESC=Save&Quit",
                (60,470), cv2.FONT_HERSHEY_SIMPLEX,
                0.55, (200,200,200), 1)

            cv2.imshow("SignBridge Data Collector", frame)
            key = cv2.waitKey(1) & 0xFF

            if key == ord(' '):
                break
            elif key == ord('s'):
                samples_collected = SAMPLES
                break
            elif key == 27:
                save_dataset()
                cap.release()
                cv2.destroyAllWindows()
                print(f"\nSaved! Total: {len(dataset)}")
                exit()

        if samples_collected >= SAMPLES:
            break

        # COUNTDOWN
        for count in [3, 2, 1]:
            deadline = cv2.getTickCount() + cv2.getTickFrequency()
            while cv2.getTickCount() < deadline:
                ret, frame = cap.read()
                frame = cv2.flip(frame, 1)
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                rgb.flags.writeable = False
                result = hands.process(rgb)
                rgb.flags.writeable = True
                draw_all(frame, result)
                cv2.putText(frame, str(count),
                    (270,310), cv2.FONT_HERSHEY_SIMPLEX,
                    8, (0,0,255), 12)
                cv2.putText(frame, f"DO: {gesture}",
                    (150,420), cv2.FONT_HERSHEY_SIMPLEX,
                    1.3, (0,255,255), 3)
                cv2.imshow("SignBridge Data Collector", frame)
                cv2.waitKey(1)

        # RECORDING
        sequence = []
        for i in range(FRAMES):
            ret, frame = cap.read()
            frame = cv2.flip(frame, 1)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            rgb.flags.writeable = False
            result = hands.process(rgb)
            rgb.flags.writeable = True
            draw_all(frame, result)
            landmarks = get_landmarks(result)
            sequence.append(landmarks)

            # Recording bar
            p = int((i/FRAMES)*620)
            cv2.rectangle(frame,(10,440),(630,465),(40,40,40),-1)
            cv2.rectangle(frame,(10,440),(10+p,465),(0,0,255),-1)
            cv2.putText(frame,
                f"RECORDING {i+1}/30 — {gesture}",
                (10,438), cv2.FONT_HERSHEY_SIMPLEX,
                0.65, (0,0,255), 2)
            cv2.imshow("SignBridge Data Collector", frame)
            cv2.waitKey(33)

        dataset.append({
            "gesture": gesture,
            "landmarks": sequence
        })
        samples_collected += 1
        save_dataset()
        print(f"  {gesture}: {samples_collected}/{SAMPLES}")

    print(f"DONE: {gesture}")

cap.release()
cv2.destroyAllWindows()
save_dataset()
print(f"\nALL DONE! Total: {len(dataset)} samples")
print("File: dataset/dataset.json")
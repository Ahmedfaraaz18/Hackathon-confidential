import cv2
import os
import sys

hc_name = 'haarcascade_frontalface_default.xml'
paths = []
if hasattr(cv2, 'data'):
    paths.append(os.path.join(cv2.data.haarcascades, hc_name))
paths.append(os.path.join(os.path.dirname(__file__), hc_name))
paths.append(hc_name)

haar = None
for p in paths:
    if p and os.path.isfile(p):
        print('Found cascade at:', p)
        haar = p
        break

if not haar:
    print('Cascade not found. Tried paths:')
    for p in paths:
        print(' -', p)
    sys.exit(2)

cap = cv2.VideoCapture(0, cv2.CAP_DSHOW if os.name == 'nt' else 0)
if not cap.isOpened():
    print('Unable to open camera. Make sure it is connected and not in use.')
    sys.exit(3)

ret, frame = cap.read()
cap.release()
if not ret:
    print('Failed to read frame from camera.')
    sys.exit(4)

face_cascade = cv2.CascadeClassifier(haar)
gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
faces = face_cascade.detectMultiScale(gray, 1.3, 5)
print('Faces detected in one frame:', len(faces))
if len(faces) > 0:
    print('Detection succeeded.')
else:
    print('No faces detected in the captured frame (lighting/camera position may affect this).')

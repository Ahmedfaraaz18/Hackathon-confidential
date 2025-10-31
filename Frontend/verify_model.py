import os
import cv2
import numpy as np
import sys

base = os.path.dirname(__file__)
labels_dir = os.path.join(base, '..', 'TrainingImageLabel')
train_dir = os.path.join(base, '..', 'TrainingImage')
trainer_file = os.path.join(labels_dir, 'Trainner.yml')

print('Trainer file:', trainer_file)
if not os.path.isfile(trainer_file):
    print('Trainer file not found, aborting.')
    sys.exit(2)

# try to create recognizer
try:
    recognizer = cv2.face.LBPHFaceRecognizer_create()
except Exception:
    recognizer = cv2.face_LBPHFaceRecognizer.create()

try:
    recognizer.read(trainer_file)
    print('Model loaded successfully')
except Exception as e:
    print('Failed to read trainer file:', e)
    sys.exit(3)

# pick a sample image from train_dir
imgs = [f for f in os.listdir(train_dir) if f.lower().endswith('.jpg')]
if not imgs:
    print('No training images found in', train_dir)
    sys.exit(4)

sample = os.path.join(train_dir, imgs[0])
print('Using sample image:', sample)
img = cv2.imread(sample, cv2.IMREAD_GRAYSCALE)
if img is None:
    print('Failed to load image')
    sys.exit(5)

# Since training used just faces, pass the whole image to predict
try:
    label, conf = recognizer.predict(img)
    print('Predict result -> label:', label, 'conf:', conf)
except Exception as e:
    print('Prediction failed:', e)
    sys.exit(6)

print('Verification complete')

import os
import cv2
import numpy as np
import csv
from PIL import Image
import shutil

base = os.path.dirname(__file__)
train_dir = os.path.join(base, '..', 'TrainingImage')
labels_dir = os.path.join(base, '..', 'TrainingImageLabel')
student_dir = os.path.join(base, '..', 'StudentDetails')
trainer_file = os.path.join(labels_dir, 'Trainner.yml')
print('Base dir:', base)
print('Training dir:', train_dir)
print('Labels dir:', labels_dir)
print('Student dir:', student_dir)

os.makedirs(train_dir, exist_ok=True)
os.makedirs(labels_dir, exist_ok=True)
os.makedirs(student_dir, exist_ok=True)

# create StudentDetails.csv
student_csv = os.path.join(student_dir, 'StudentDetails.csv')
with open(student_csv, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['SERIAL NO.', '', 'ID', '', 'NAME'])
    writer.writerow([1, '', '1001', '', 'Alice'])
    writer.writerow([2, '', '1002', '', 'Bob'])

# create simple synthetic face-like images
# two subjects, 5 images each
for name, serial, uid in [('Alice',1,'1001'), ('Bob',2,'1002')]:
    for i in range(1,6):
        img = np.full((200,200,3), 255, dtype=np.uint8)
        # draw a simple face-like circle
        center = (100, 90)
        cv2.circle(img, center, 40, (0,0,0), 2)
        cv2.circle(img, (85,85), 6, (0,0,0), -1)
        cv2.circle(img, (115,85), 6, (0,0,0), -1)
        cv2.ellipse(img, (100,110), (15,8), 0, 0, 180, (0,0,0), 2)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        filename = f"{name}.{serial}.{uid}.{i}.jpg"
        filepath = os.path.join(train_dir, filename)
        cv2.imwrite(filepath, gray)

# run training using facebackend
import sys
sys.path.insert(0, base)
from facebackend import train_lbph_recognizer

training_dir = train_dir
yml_path = trainer_file
train_lbph_recognizer(training_dir, yml_path)

print('Training complete. Model saved to:', yml_path)
print('Trained models CSV should be in:', labels_dir)
print('Student CSV used:', student_csv)

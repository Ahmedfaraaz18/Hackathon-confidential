import os
import csv
import datetime
import sys
from PIL import Image
import numpy as np
import cv2
import pandas as pd

# Directory organization
def assure_path_exists(path):
    if not os.path.exists(path):
        os.makedirs(path)

# Student Operations
def register_student(student_csv, serial, user_id, name):
    # Append new student row to CSV
    header = ['SERIAL NO.', '', 'ID', '', 'NAME']
    row = [serial, '', user_id, '', name]
    write_header = not os.path.isfile(student_csv) or os.path.getsize(student_csv) == 0
    with open(student_csv, 'a+', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if write_header:
            writer.writerow(header)
        writer.writerow(row)

def count_students(student_csv):
    # Return estimated count of registered students
    count = 0
    if os.path.isfile(student_csv):
        with open(student_csv, 'r', newline='', encoding='utf-8') as f:
            reader = csv.reader(f)
            rows = list(reader)
            count = max(0, (len(rows) // 2) - 1)
    return count

# Image Capture
def save_face_image(image, save_dir, name, serial, uid, sample_num):
    # Save face image as JPEG, used for training
    filename = f"{name}.{serial}.{uid}.{sample_num}.jpg"
    filepath = os.path.join(save_dir, filename)
    cv2.imwrite(filepath, image)
    return filepath

# Training
def train_lbph_recognizer(training_dir, yml_path):
    image_paths = [os.path.join(training_dir, f) for f in os.listdir(training_dir) if f.lower().endswith('.jpg')]
    faces, ids = [], []
    for img_path in image_paths:
        pil_img = Image.open(img_path).convert('L')
        img_np = np.array(pil_img, 'uint8')
        sid = int(os.path.split(img_path)[-1].split(".")[1])
        faces.append(img_np)
        ids.append(sid)
    # OpenCV LBPH training
    try:
        recognizer = cv2.face.LBPHFaceRecognizer_create()
    except Exception:
        recognizer = cv2.face_LBPHFaceRecognizer.create()
    recognizer.train(faces, np.array(ids))
    recognizer.write(yml_path)
    # write trained model metadata CSV in the labels dir
    try:
        labels_dir = os.path.dirname(yml_path) or '.'
        trained_csv = os.path.join(labels_dir, 'trained_models.csv')
        ts = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        unique_ids = sorted(set(ids))
        row = [os.path.basename(yml_path), ts, len(image_paths), len(unique_ids), ";".join(map(str, unique_ids))]
        write_header = not os.path.isfile(trained_csv) or os.path.getsize(trained_csv) == 0
        with open(trained_csv, 'a+', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            if write_header:
                writer.writerow(['model_file', 'trained_at', 'num_images', 'num_ids', 'ids_list'])
            writer.writerow(row)
    except Exception:
        pass

# Recognition/Attendance
def recognize_and_log_attendance(model_path, haar_path, student_csv, attendance_dir, event_stop):
    # Load model & student data
    # ensure haar_path falls back to OpenCV packaged cascades if missing
    hc_name = 'haarcascade_frontalface_default.xml'
    if not haar_path or not os.path.isfile(haar_path):
        try:
            haar_path = os.path.join(cv2.data.haarcascades, hc_name)
        except Exception:
            pass
    if not haar_path or not os.path.isfile(haar_path):
        raise FileNotFoundError(f"Haar cascade not found. Tried: {haar_path}")

    try:
        recognizer = cv2.face.LBPHFaceRecognizer_create()
    except Exception:
        recognizer = cv2.face_LBPHFaceRecognizer.create()
    recognizer.read(model_path)
    face_cascade = cv2.CascadeClassifier(haar_path)
    df = pd.read_csv(student_csv)
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW if os.name == 'nt' else 0)
    recorded_today = set()
    while not event_stop.is_set():
        ret, frame = cap.read()
        if not ret:
            break
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.2, 5)
        for (x, y, w, h) in faces:
            roi = gray[y:y+h, x:x+w]
            serial, conf = recognizer.predict(roi)
            if conf < 50:
                name_val = df.loc[df['SERIAL NO.'] == serial]['NAME'].values
                id_val = df.loc[df['SERIAL NO.'] == serial]['ID'].values
                name_text = str(name_val[0]) if len(name_val) > 0 else "Unknown"
                id_text = str(id_val[0]) if len(id_val) > 0 else "Unknown"
                ts = datetime.datetime.now()
                date = ts.strftime('%d-%m-%Y')
                tstr = ts.strftime('%H:%M:%S')
                key = (id_text, date)
                if key not in recorded_today:
                    recorded_today.add(key)
                    attendance_row = [id_text, '', name_text, '', date, '', tstr]
                    file_today = os.path.join(attendance_dir, f"Attendance_{date}.csv")
                    write_header = not os.path.isfile(file_today) or os.path.getsize(file_today) == 0
                    with open(file_today, 'a+', newline='', encoding='utf-8') as f:
                        writer = csv.writer(f)
                        if write_header:
                            writer.writerow(['Id', '', 'Name', '', 'Date', '', 'Time'])
                        writer.writerow(attendance_row)
            break  # one face per frame for speed
    cap.release()

# Attendance Export
def open_attendance_for_today(attendance_dir):
    date = datetime.datetime.now().strftime('%d-%m-%Y')
    file_today = os.path.join(attendance_dir, f"Attendance_{date}.csv")
    if os.path.isfile(file_today):
        # open using default app
        if os.name == 'nt':
            os.startfile(file_today)
        else:
            opener = "open" if sys.platform == "darwin" else "xdg-open"
            os.system(f'{opener} "{file_today}"')
    return file_today


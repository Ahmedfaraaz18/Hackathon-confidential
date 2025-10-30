"""
Modern Face Recognition Attendance System (single-file)
Refactored: threaded camera operations, modern ttk styling, non-blocking UI.
Dependencies: opencv-python, opencv-contrib-python, Pillow, pandas, numpy
Run: python attendance_modern.py
"""

import os
import threading
import time
import csv
import datetime
import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
from PIL import Image, ImageTk
import cv2
import numpy as np
import pandas as pd
import sys

# ----------------------- Utilities -----------------------

def assure_path_exists(path):
    if not os.path.exists(path):
        os.makedirs(path)

def resource_path(*parts):
    return os.path.join(*parts)

# ----------------------- App Class -----------------------

class AttendanceApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Attendance System - Modern")
        self.root.geometry("1200x700")
        self.root.configure(bg="#1f2937")  # dark background

        # Directories / files
        self.dir_training = resource_path("TrainingImage")
        self.dir_labels = resource_path("TrainingImageLabel")
        self.dir_student = resource_path("StudentDetails")
        self.dir_attendance = resource_path("Attendance")
        assure_path_exists(self.dir_training)
        assure_path_exists(self.dir_labels)
        assure_path_exists(self.dir_student)
        assure_path_exists(self.dir_attendance)
        self.psd_file = os.path.join(self.dir_labels, "psd.txt")
        self.trainer_file = os.path.join(self.dir_labels, "Trainner.yml")
        self.student_csv = os.path.join(self.dir_student, "StudentDetails.csv")

        # face cascade - prefer OpenCV packaged data, fallback to local copy
        hc_name = "haarcascade_frontalface_default.xml"
        possible = []
        try:
            cv2_haar_dir = cv2.data.haarcascades
            possible.append(os.path.join(cv2_haar_dir, hc_name))
        except Exception:
            pass
        # local directory next to this script
        try:
            possible.append(os.path.join(os.path.dirname(__file__), hc_name))
        except Exception:
            pass
        possible.append(hc_name)

        self.haarfile = None
        for p in possible:
            if p and os.path.isfile(p):
                self.haarfile = p
                break

        if not self.haarfile:
            messagebox.showerror("Missing file", f"Could not find '{hc_name}'. Please install OpenCV data or place the file next to this script.")
            self.root.destroy()
            return

        # Thread control
        self.camera_thread = None
        self.recognize_thread = None
        self.take_images_thread = None
        self.stop_event = threading.Event()
        self.frame_update_lock = threading.Lock()

        # For passing data from threads to mainloop
        self.queue = []

        # Build UI
        self._create_styles()
        self._build_ui()

        # Load initial registrations count
        self._update_registrations_label()

        # LBPH recognizer (created/loaded on demand)
        self.recognizer = None

    # ----------------------- UI -----------------------

    def _create_styles(self):
        style = ttk.Style(self.root)
        style.theme_use('clam')
        style.configure("TButton", font=("Segoe UI", 11, "bold"), padding=8)
        style.configure("TLabel", background="#1f2937", foreground="#e5e7eb", font=("Segoe UI", 11))
        style.configure("Header.TLabel", font=("Segoe UI", 18, "bold"))
        style.configure("Card.TFrame", background="#111827", relief="raised")
        style.configure("TEntry", fieldbackground="#111827", foreground="#e5e7eb")

    def _build_ui(self):
        # header
        header = ttk.Label(self.root, text="Face Recognition Attendance", style="Header.TLabel")
        header.place(relx=0.02, rely=0.02)

        # date/time
        self.dt_label = ttk.Label(self.root, text="", style="TLabel")
        self.dt_label.place(relx=0.75, rely=0.02)
        self._update_clock()

        # left card: attendance / treeview
        left_card = ttk.Frame(self.root, style="Card.TFrame")
        left_card.place(relx=0.02, rely=0.12, relwidth=0.47, relheight=0.82)

        lbl_att = ttk.Label(left_card, text="Attendance Log", font=("Segoe UI", 14, "bold"))
        lbl_att.pack(pady=(12, 6))

        columns = ("ID", "Name", "Date", "Time")
        self.tv = ttk.Treeview(left_card, columns=columns, show="headings", height=18)
        for col in columns:
            self.tv.heading(col, text=col)
            self.tv.column(col, width=120, anchor="center")
        self.tv.pack(padx=12, pady=(6, 12), fill="both", expand=True)

        # buttons under treeview
        btn_frame = ttk.Frame(left_card)
        btn_frame.pack(padx=12, pady=(0, 12), fill='x')
        ttk.Button(btn_frame, text="Start Attendance", command=self.start_recognition).pack(side='left', padx=6)
        ttk.Button(btn_frame, text="Stop Attendance", command=self.stop_recognition).pack(side='left', padx=6)
        ttk.Button(btn_frame, text="Export Today's CSV", command=self.open_today_attendance).pack(side='left', padx=6)
        ttk.Button(btn_frame, text="Quit", command=self._quit).pack(side='right', padx=6)

        # right card: registration & video preview
        right_card = ttk.Frame(self.root, style="Card.TFrame")
        right_card.place(relx=0.51, rely=0.12, relwidth=0.47, relheight=0.82)

        # video preview
        video_frame = ttk.Frame(right_card)
        video_frame.pack(pady=(12, 6))
        self.video_label = tk.Label(video_frame, bg="#000000", width=440, height=300)
        self.video_label.pack()

        # registration inputs
        form_frame = ttk.Frame(right_card)
        form_frame.pack(pady=(10, 6), fill='x', padx=20)

        ttk.Label(form_frame, text="Enter ID:").grid(row=0, column=0, sticky='w', pady=6)
        self.entry_id = ttk.Entry(form_frame, width=28)
        self.entry_id.grid(row=0, column=1, pady=6, padx=6)

        ttk.Label(form_frame, text="Enter Name:").grid(row=1, column=0, sticky='w', pady=6)
        self.entry_name = ttk.Entry(form_frame, width=28)
        self.entry_name.grid(row=1, column=1, pady=6, padx=6)

        self.msg_var = tk.StringVar(value="1) Take Images  >>>  2) Save Profile")
        ttk.Label(form_frame, textvariable=self.msg_var).grid(row=2, column=0, columnspan=2, pady=(8, 2), sticky='w')

        # action buttons
        action_frame = ttk.Frame(right_card)
        action_frame.pack(pady=(6, 12))
        ttk.Button(action_frame, text="Clear", command=self.clear_entries).grid(row=0, column=0, padx=6)
        ttk.Button(action_frame, text="Take Images", command=self.take_images_threaded).grid(row=0, column=1, padx=6)
        ttk.Button(action_frame, text="Save Profile (Train)", command=self.train_threaded).grid(row=0, column=2, padx=6)
        ttk.Button(action_frame, text="Change Password", command=self.change_pass).grid(row=0, column=3, padx=6)
        ttk.Button(action_frame, text="Contact", command=self.contact).grid(row=0, column=4, padx=6)

        # progress and registrations label
        progress_frame = ttk.Frame(right_card)
        progress_frame.pack(pady=(10, 0), fill='x', padx=20)
        self.progress = ttk.Progressbar(progress_frame, mode='determinate')
        self.progress.pack(fill='x', pady=(4, 8))
        self.reg_label_var = tk.StringVar(value="Total Registrations : 0")
        ttk.Label(right_card, textvariable=self.reg_label_var, font=("Segoe UI", 12, "bold")).pack(pady=(4, 12))

        # menu
        menubar = tk.Menu(self.root)
        helpmenu = tk.Menu(menubar, tearoff=0)
        helpmenu.add_command(label="Change Password", command=self.change_pass)
        helpmenu.add_command(label="Contact Us", command=self.contact)
        helpmenu.add_command(label="Exit", command=self._quit)
        menubar.add_cascade(label="Help", menu=helpmenu)
        self.root.config(menu=menubar)

        # schedule queue poll
        self.root.after(200, self._poll_queue)

    # ----------------------- Clock -----------------------

    def _update_clock(self):
        now = time.strftime('%d-%b-%Y   %H:%M:%S')
        self.dt_label.config(text=now)
        self.root.after(1000, self._update_clock)

    # ----------------------- Registrations / CSV -----------------------

    def _update_registrations_label(self):
        count = 0
        if os.path.isfile(self.student_csv):
            try:
                with open(self.student_csv, 'r', newline='', encoding='utf-8') as f:
                    reader = csv.reader(f)
                    for _ in reader:
                        count += 1
                # file used with header row and blank rows in original - approximate same behaviour:
                count = max(0, (count // 2) - 1)
            except Exception:
                count = 0
        self.reg_label_var.set(f"Total Registrations : {count}")

    # ----------------------- Basic UI actions -----------------------

    def clear_entries(self):
        self.entry_id.delete(0, 'end')
        self.entry_name.delete(0, 'end')
        self.msg_var.set("1) Take Images  >>>  2) Save Profile")

    def contact(self):
        messagebox.showinfo("Contact us", "Please contact us on : 'xxxxxxxxxxxxx@gmail.com'")

    def change_pass(self):
        assure_path_exists(self.dir_labels)
        if os.path.isfile(self.psd_file):
            with open(self.psd_file, 'r', encoding='utf-8') as f:
                old_key = f.read().strip()
        else:
            # if not exist ask to set initial password
            new_pas = simpledialog.askstring("Set Password", "No password found. Set new password:", show='*')
            if new_pas:
                with open(self.psd_file, 'w', encoding='utf-8') as f:
                    f.write(new_pas)
                messagebox.showinfo("Saved", "Password registered.")
            return

        top = tk.Toplevel(self.root)
        top.title("Change Password")
        top.geometry("420x170")
        ttk.Label(top, text="Enter Old Password:").place(x=10, y=12)
        old_ent = ttk.Entry(top, show='*', width=28)
        old_ent.place(x=160, y=12)
        ttk.Label(top, text="Enter New Password:").place(x=10, y=50)
        new_ent = ttk.Entry(top, show='*', width=28)
        new_ent.place(x=160, y=50)
        ttk.Label(top, text="Confirm New Password:").place(x=10, y=88)
        conf_ent = ttk.Entry(top, show='*', width=28)
        conf_ent.place(x=160, y=88)

        def _save_pass():
            if old_ent.get() != old_key:
                messagebox.showerror("Error", "Old password incorrect.")
                return
            if new_ent.get() != conf_ent.get():
                messagebox.showerror("Error", "New passwords do not match.")
                return
            with open(self.psd_file, 'w', encoding='utf-8') as f:
                f.write(new_ent.get())
            messagebox.showinfo("Saved", "Password changed.")
            top.destroy()

        ttk.Button(top, text="Save", command=_save_pass).place(x=60, y=125)
        ttk.Button(top, text="Cancel", command=top.destroy).place(x=260, y=125)

    # ----------------------- Taking Images (threaded) -----------------------

    def take_images_threaded(self):
        if self.take_images_thread and self.take_images_thread.is_alive():
            messagebox.showinfo("Please wait", "Image capture is already in progress.")
            return
        uid = self.entry_id.get().strip()
        name = self.entry_name.get().strip()
        if uid == "" or name == "":
            messagebox.showerror("Missing data", "Please enter both ID and Name.")
            return
        # sanitize name
        name = "".join(ch for ch in name if ch.isalnum() or ch in (" ", "_")).strip()
        self.take_images_thread = threading.Thread(target=self._take_images, args=(uid, name), daemon=True)
        self.take_images_thread.start()

    def _take_images(self, uid, name):
        self.msg_var.set("Starting camera to take images...")
        self.progress['value'] = 0
        assure_path_exists(self.dir_training)

        # compute serial number (simple incremental)
        serial = 1
        if os.path.isfile(self.student_csv):
            try:
                with open(self.student_csv, 'r', newline='', encoding='utf-8') as f:
                    reader = csv.reader(f)
                    lines = list(reader)
                    serial = max(1, (len(lines) // 2) + 1)
            except Exception:
                serial = 1

        cap = cv2.VideoCapture(0, cv2.CAP_DSHOW if os.name == 'nt' else 0)
        if not cap.isOpened():
            messagebox.showerror("Camera Error", "Unable to open camera.")
            return

        face_cascade = cv2.CascadeClassifier(self.haarfile)
        sample_num = 0
        max_samples = 60  # fewer than your original 100 for speed; increase if you like
        self.stop_event.clear()

        while sample_num < max_samples and not self.stop_event.is_set():
            ret, frame = cap.read()
            if not ret:
                break
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)
            for (x, y, w, h) in faces:
                sample_num += 1
                face_img = gray[y:y+h, x:x+w]
                filename = f"{name}.{serial}.{uid}.{sample_num}.jpg"
                filepath = os.path.join(self.dir_training, filename)
                cv2.imwrite(filepath, face_img)
                # for preview queue mainloop
                self._queue_frame_for_preview(frame)
                break  # save one face per frame
            self.progress['value'] = (sample_num / max_samples) * 100
            time.sleep(0.05)  # small pause so UI can update

        cap.release()
        self.progress['value'] = 0
        # write to student CSV
        row = [serial, '', uid, '', name]
        with open(self.student_csv, 'a+', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            if os.path.getsize(self.student_csv) == 0:
                writer.writerow(['SERIAL NO.', '', 'ID', '', 'NAME'])
            writer.writerow(row)

        self.msg_var.set(f"Images Taken for ID: {uid}")
        self._update_registrations_label()

    # ----------------------- Training (threaded) -----------------------

    def train_threaded(self):
        t = threading.Thread(target=self._train_images, daemon=True)
        t.start()

    def _train_images(self):
        self.msg_var.set("Training started...")
        assure_path_exists(self.dir_labels)

        # gather training images
        image_paths = [os.path.join(self.dir_training, f) for f in os.listdir(self.dir_training) if f.lower().endswith('.jpg')]
        if not image_paths:
            messagebox.showwarning("No images", "No training images found. Register some students first.")
            self.msg_var.set("1) Take Images  >>>  2) Save Profile")
            return

        faces = []
        ids = []
        total = len(image_paths)
        for idx, img_path in enumerate(image_paths, start=1):
            try:
                pil_img = Image.open(img_path).convert('L')
                img_np = np.array(pil_img, 'uint8')
                sid = int(os.path.split(img_path)[-1].split(".")[1])
                faces.append(img_np)
                ids.append(sid)
            except Exception as e:
                continue
            self.progress['value'] = (idx/total) * 100
            time.sleep(0.01)

        try:
            # create LBPH recognizer
            try:
                recognizer = cv2.face.LBPHFaceRecognizer_create()
            except Exception:
                # fallback for other versions
                recognizer = cv2.face_LBPHFaceRecognizer.create()
            recognizer.train(faces, np.array(ids))
            recognizer.write(self.trainer_file)
            # write trained model metadata CSV
            assure_path_exists(self.dir_labels)
            trained_csv = os.path.join(self.dir_labels, "trained_models.csv")
            ts = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            unique_ids = sorted(set(ids))
            row = [os.path.basename(self.trainer_file), ts, total, len(unique_ids), ";".join(map(str, unique_ids))]
            write_header = not os.path.isfile(trained_csv) or os.path.getsize(trained_csv) == 0
            with open(trained_csv, 'a+', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                if write_header:
                    writer.writerow(['model_file', 'trained_at', 'num_images', 'num_ids', 'ids_list'])
                writer.writerow(row)
            # also write a simple mapping of SERIAL->ID->NAME from student CSV for reference
            try:
                mapping_csv = os.path.join(self.dir_labels, "model_mapping.csv")
                if os.path.isfile(self.student_csv):
                    df = pd.read_csv(self.student_csv)
                    # ensure columns exist
                    if set(['SERIAL NO.', 'ID', 'NAME']).issubset(df.columns):
                        df[['SERIAL NO.', 'ID', 'NAME']].to_csv(mapping_csv, index=False)
            except Exception:
                pass
        except Exception as e:
            messagebox.showerror("Training Error", f"Failed to train recognizer: {e}")
            self.msg_var.set("Training failed.")
            self.progress['value'] = 0
            return

        self.progress['value'] = 0
        self.msg_var.set("Profile Saved Successfully")
        messagebox.showinfo("Success", "Training completed and model saved.")

    # ----------------------- Recognition / Attendance (threaded) -----------------------

    def start_recognition(self):
        if self.recognize_thread and self.recognize_thread.is_alive():
            messagebox.showinfo("Already Running", "Recognition is already running.")
            return
        if not os.path.isfile(self.trainer_file):
            messagebox.showwarning("Model missing", "No trained model found. Please train first.")
            return
        self.stop_event.clear()
        self.recognize_thread = threading.Thread(target=self._recognize_loop, daemon=True)
        self.recognize_thread.start()

    def stop_recognition(self):
        self.stop_event.set()
        self.msg_var.set("Stopping recognition...")

    def _recognize_loop(self):
        # load recognizer
        try:
            try:
                recognizer = cv2.face.LBPHFaceRecognizer_create()
            except Exception:
                recognizer = cv2.face_LBPHFaceRecognizer.create()
            recognizer.read(self.trainer_file)
        except Exception as e:
            messagebox.showerror("Load Error", "Unable to load trained model.")
            return

        face_cascade = cv2.CascadeClassifier(self.haarfile)

        # load student details into a small dataframe
        if not os.path.isfile(self.student_csv):
            messagebox.showerror("Missing Data", "Student details missing.")
            return
        df = pd.read_csv(self.student_csv)
        cap = cv2.VideoCapture(0, cv2.CAP_DSHOW if os.name == 'nt' else 0)
        if not cap.isOpened():
            messagebox.showerror("Camera Error", "Unable to open camera.")
            return

        self.msg_var.set("Recognition started...")
        recorded_today = set()
        while not self.stop_event.is_set():
            ret, frame = cap.read()
            if not ret:
                break
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5)
            for (x, y, w, h) in faces:
                roi = gray[y:y+h, x:x+w]
                serial, conf = recognizer.predict(roi)
                if conf < 50:
                    # lookup in df
                    try:
                        name_val = df.loc[df['SERIAL NO.'] == serial]['NAME'].values
                        id_val = df.loc[df['SERIAL NO.'] == serial]['ID'].values
                        if len(name_val) > 0:
                            name_text = str(name_val[0])
                            id_text = str(id_val[0])
                        else:
                            name_text = "Unknown"
                            id_text = "Unknown"
                    except Exception:
                        name_text = "Unknown"
                        id_text = "Unknown"

                    ts = datetime.datetime.now()
                    date = ts.strftime('%d-%m-%Y')
                    tstr = ts.strftime('%H:%M:%S')

                    # only write once per session for a student (avoid duplicates)
                    key = (id_text, date)
                    if key not in recorded_today:
                        recorded_today.add(key)
                        attendance_row = [id_text, '', name_text, '', date, '', tstr]
                        # write to file
                        file_today = os.path.join(self.dir_attendance, f"Attendance_{date}.csv")
                        write_header = not os.path.isfile(file_today) or os.path.getsize(file_today) == 0
                        with open(file_today, 'a+', newline='', encoding='utf-8') as f:
                            writer = csv.writer(f)
                            if write_header:
                                writer.writerow(['Id', '', 'Name', '', 'Date', '', 'Time'])
                            writer.writerow(attendance_row)
                        # queue for GUI update
                        self.queue.append((id_text, name_text, date, tstr))
                # draw rectangle and text on frame for preview
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 150, 255), 2)
                # text
                cv2.putText(frame, str(serial if conf < 50 else "Unknown"), (x, y-6),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2)
                break  # only process one face per frame for speed
            # push preview for GUI
            self._queue_frame_for_preview(frame)
            time.sleep(0.03)

        cap.release()
        self.msg_var.set("Recognition stopped.")
        # finalize any queued items
        self._poll_queue_once()

    # ----------------------- Preview queue and GUI updates -----------------------

    def _queue_frame_for_preview(self, frame_bgr):
        # convert and resize
        try:
            frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(frame_rgb)
            img = img.resize((440, 300))
            with self.frame_update_lock:
                self._last_preview = ImageTk.PhotoImage(img)
        except Exception:
            return
        # schedule mainloop update
        self.root.after(1, self._update_video_label)

    def _update_video_label(self):
        with self.frame_update_lock:
            if hasattr(self, "_last_preview"):
                self.video_label.configure(image=self._last_preview)
                self.video_label.image = self._last_preview

    def _poll_queue(self):
        while self.queue:
            item = self.queue.pop(0)
            id_text, name_text, date, tstr = item
            self.tv.insert('', 0, values=(id_text, name_text, date, tstr))
        self.root.after(200, self._poll_queue)

    def _poll_queue_once(self):
        while self.queue:
            item = self.queue.pop(0)
            id_text, name_text, date, tstr = item
            self.tv.insert('', 0, values=(id_text, name_text, date, tstr))

    # ----------------------- Helpers -----------------------

    def open_today_attendance(self):
        date = datetime.datetime.now().strftime('%d-%m-%Y')
        file_today = os.path.join(self.dir_attendance, f"Attendance_{date}.csv")
        if os.path.isfile(file_today):
            # open file using default program (os.startfile on windows)
            try:
                if os.name == 'nt':
                    os.startfile(file_today)
                else:
                    # for linux / mac try xdg-open / open
                    opener = "open" if sys.platform == "darwin" else "xdg-open"
                    os.system(f'{opener} "{file_today}"')
            except Exception:
                messagebox.showinfo("File saved", f"Today's attendance saved: {file_today}")
        else:
            messagebox.showinfo("No attendance", "No attendance recorded today.")

    def _quit(self):
        self.stop_event.set()
        time.sleep(0.2)
        self.root.destroy()

# ----------------------- Run -----------------------

if __name__ == "__main__":
    root = tk.Tk()
    app = AttendanceApp(root)
    root.mainloop()
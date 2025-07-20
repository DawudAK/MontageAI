import cv2
import os

def extract_frames(video_path, output_dir, every_n=30):
    os.makedirs(output_dir, exist_ok=True)
    cap = cv2.VideoCapture(video_path)
    count = 0
    saved = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if count % every_n == 0:
            frame_path = os.path.join(output_dir, f'frame_{saved:05d}.jpg')
            cv2.imwrite(frame_path, frame)
            saved += 1
        count += 1
    cap.release()
    return saved 
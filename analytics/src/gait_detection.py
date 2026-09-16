"""ActiGait prototype gait/movement detection from the real ESP32 trial."""
import os
import numpy as np
import pandas as pd
from scipy.signal import find_peaks

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(ROOT, 'data', 'real_gait.csv')
OUT_DIR = os.path.join(ROOT, 'outputs')
os.makedirs(OUT_DIR, exist_ok=True)

COLS = ['timestamp','heel_fsr','toe_fsr','accel_x','accel_y','accel_z','gyro_x','gyro_y','gyro_z']
df = pd.read_csv(DATA_FILE)
for c in COLS:
    df[c] = pd.to_numeric(df[c], errors='coerce')
df = df.dropna(subset=COLS).reset_index(drop=True)

# The serial log contains multiple captures; timestamps restart at 0/low values.
# Split at timestamp resets so intervals are never computed across separate captures.
starts = np.r_[0, np.where(np.diff(df.timestamp.to_numpy()) < 0)[0] + 1]
ends = np.r_[starts[1:], len(df)]

all_events = []
for segment_id, (s, e) in enumerate(zip(starts, ends)):
    seg = df.iloc[s:e].copy()
    gyro = seg[['gyro_x','gyro_y','gyro_z']].to_numpy(float)
    gyro_mag = np.linalg.norm(gyro, axis=1)
    seg['gyro_mag'] = gyro_mag
    dt = np.diff(seg.timestamp.to_numpy()) / 1000.0
    dt = dt[dt > 0]
    fs = 1 / np.median(dt) if len(dt) else 20.0
    distance = max(1, int(round(0.45 * fs)))
    height = np.percentile(gyro_mag, 70)
    peaks, _ = find_peaks(gyro_mag, distance=distance, prominence=0.25, height=height)
    for p in peaks:
        all_events.append({'segment': segment_id, 'timestamp_s': seg.timestamp.iloc[p] / 1000.0,
                           'gyro_mag': gyro_mag[p]})

events = pd.DataFrame(all_events)
if events.empty:
    events = pd.DataFrame(columns=['segment','timestamp_s','gyro_mag'])
events.to_csv(os.path.join(OUT_DIR, 'candidate_events.csv'), index=False)

print('ActiGait Gait / Movement Detection')
print('-----------------------------------')
print('Valid samples:', len(df))
print('Capture segments:', len(starts))
print('Candidate IMU movement events:', len(events))
print('\nThese are IMU-derived candidate events. They are not clinically validated heel-strike or toe-off labels.')

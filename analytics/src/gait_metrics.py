"""Compute prototype timing metrics from IMU-derived candidate events."""
import os
import numpy as np
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EVENTS = os.path.join(ROOT, 'outputs', 'candidate_events.csv')
OUT = os.path.join(ROOT, 'outputs', 'gait_metrics.csv')

e = pd.read_csv(EVENTS)
rows = []
for segment, g in e.groupby('segment'):
    t = np.sort(g.timestamp_s.to_numpy())
    intervals = np.diff(t)
    intervals = intervals[(intervals >= 0.45) & (intervals <= 2.0)]
    rows.append({
        'segment': int(segment),
        'candidate_events': len(t),
        'valid_intervals': len(intervals),
        'median_interval_s': np.median(intervals) if len(intervals) else np.nan,
        'candidate_cadence_spm': 60 / np.median(intervals) if len(intervals) else np.nan,
        'interval_cv_pct': (np.std(intervals) / np.mean(intervals) * 100) if len(intervals) and np.mean(intervals) else np.nan,
    })
metrics = pd.DataFrame(rows)
metrics.to_csv(OUT, index=False)
print(metrics.to_string(index=False) if len(metrics) else 'No candidate events found.')
print('\nCadence here is a prototype estimate from IMU movement-event intervals, not a clinical gait measurement.')

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.signal import find_peaks

# =========================================================
# PATHS
# =========================================================

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data", "real_gait.csv")
OUT = os.path.join(ROOT, "outputs")

os.makedirs(OUT, exist_ok=True)

COLS = [
    "timestamp",
    "heel_fsr",
    "toe_fsr",
    "accel_x",
    "accel_y",
    "accel_z",
    "gyro_x",
    "gyro_y",
    "gyro_z"
]

# =========================================================
# LOAD DATA
# =========================================================

df = pd.read_csv(DATA)

for c in COLS:
    df[c] = pd.to_numeric(df[c], errors="coerce")

df = df.dropna(subset=COLS).copy().reset_index(drop=True)

# =========================================================
# DETECT ESP32 RECORDING RESETS
# =========================================================
# millis() resets when the ESP32 restarts.
# A timestamp decrease therefore means a new recording segment.

raw_ts = df["timestamp"].to_numpy(float)

reset_points = np.where(np.diff(raw_ts) <= 0)[0] + 1

segment_starts = np.r_[0, reset_points]
segment_ends = np.r_[reset_points, len(df)]

df["segment"] = 0

# =========================================================
# CREATE CONTINUOUS TIME AXIS
# =========================================================

continuous_time = np.zeros(len(df))
time_offset = 0.0

for segment_id, (start, end) in enumerate(
    zip(segment_starts, segment_ends)
):

    df.loc[start:end - 1, "segment"] = segment_id

    segment_ts = raw_ts[start:end] / 1000.0

    local_time = segment_ts - segment_ts[0]

    continuous_time[start:end] = (
        local_time + time_offset
    )

    if len(local_time):
        time_offset = continuous_time[end - 1] + 0.5

df["time_s"] = continuous_time

# =========================================================
# IMU FEATURES
# =========================================================

a = df[
    ["accel_x", "accel_y", "accel_z"]
].to_numpy(float)

g = df[
    ["gyro_x", "gyro_y", "gyro_z"]
].to_numpy(float)

df["accel_mag"] = np.linalg.norm(a, axis=1)
df["gyro_mag"] = np.linalg.norm(g, axis=1)

# Remove slow baseline from acceleration.
dt_all = np.diff(df["time_s"].to_numpy())

dt_valid = dt_all[
    (dt_all > 0) &
    (dt_all < 1.0)
]

sample_period = float(np.median(dt_valid))
fs = 1.0 / sample_period

window = max(
    5,
    int(round(1.0 * fs))
)

df["accel_dynamic"] = (
    df["accel_mag"]
    -
    df["accel_mag"]
    .rolling(
        window,
        center=True,
        min_periods=1
    )
    .median()
)

# =========================================================
# FSR QUALITY
# =========================================================

df["heel_saturated"] = df["heel_fsr"] >= 4095
df["toe_saturated"] = df["toe_fsr"] >= 4095

df["fsr_usable"] = (
    (~df["heel_saturated"]) &
    (~df["toe_saturated"])
)

# =========================================================
# PER-SEGMENT ANALYSIS
# =========================================================

all_events = []
segment_results = []

for segment_id in sorted(df["segment"].unique()):

    seg = df[
        df["segment"] == segment_id
    ].copy()

    if len(seg) < 20:
        continue

    gyro = seg["gyro_mag"].to_numpy(float)

    # Segment-specific detection threshold.
    threshold = np.percentile(
        gyro,
        70
    )

    prominence = max(
        0.25,
        np.std(gyro) * 0.35
    )

    # Minimum separation between candidate events.
    min_distance = max(
        1,
        int(round(0.45 * fs))
    )

    peaks, _ = find_peaks(
        gyro,
        distance=min_distance,
        prominence=prominence,
        height=threshold
    )

    segment_time = (
        seg["timestamp"].to_numpy(float)
        -
        seg["timestamp"].iloc[0]
    ) / 1000.0

    event_times = segment_time[peaks]

    intervals = np.diff(event_times)

    valid_intervals = intervals[
        (intervals >= 0.45) &
        (intervals <= 2.0)
    ]

    if len(valid_intervals):

        cadence = (
            60.0 /
            np.median(valid_intervals)
        )

        interval_mean = np.mean(
            valid_intervals
        )

        interval_std = np.std(
            valid_intervals
        )

        interval_cv = (
            interval_std /
            interval_mean *
            100
        )

    else:

        cadence = np.nan
        interval_mean = np.nan
        interval_std = np.nan
        interval_cv = np.nan

    segment_duration = (
        seg["timestamp"].iloc[-1]
        -
        seg["timestamp"].iloc[0]
    ) / 1000.0

    # Save events.
    for peak in peaks:

        all_events.append({
            "segment": segment_id,
            "event_time_s": segment_time[peak],
            "gyro_mag": gyro[peak]
        })

    segment_results.append({

        "segment": segment_id,

        "samples": len(seg),

        "duration_s":
            segment_duration,

        "candidate_events":
            len(peaks),

        "valid_event_intervals":
            len(valid_intervals),

        "candidate_cadence_spm":
            cadence,

        "event_interval_mean_s":
            interval_mean,

        "event_interval_std_s":
            interval_std,

        "event_interval_cv_pct":
            interval_cv,

        "heel_zero_pct":
            (seg["heel_fsr"] == 0).mean() * 100,

        "heel_saturated_pct":
            seg["heel_saturated"].mean() * 100,

        "toe_zero_pct":
            (seg["toe_fsr"] == 0).mean() * 100,

        "toe_saturated_pct":
            seg["toe_saturated"].mean() * 100
    })

# =========================================================
# SAVE EVENT DATA
# =========================================================

events_df = pd.DataFrame(all_events)

events_df.to_csv(
    os.path.join(
        OUT,
        "candidate_events.csv"
    ),
    index=False
)

# =========================================================
# SAVE SEGMENT METRICS
# =========================================================

segment_df = pd.DataFrame(
    segment_results
)

segment_df.to_csv(
    os.path.join(
        OUT,
        "segment_metrics.csv"
    ),
    index=False
)

# =========================================================
# OVERALL METRICS
# =========================================================

total_duration = sum(
    x["duration_s"]
    for x in segment_results
)

total_events = sum(
    x["candidate_events"]
    for x in segment_results
)

total_valid_intervals = sum(
    x["valid_event_intervals"]
    for x in segment_results
)

all_valid_intervals = []

for segment_id, (start, end) in enumerate(
    zip(segment_starts, segment_ends)
):

    seg = df.iloc[start:end]

    gyro = seg["gyro_mag"].to_numpy(float)

    threshold = np.percentile(
        gyro,
        70
    )

    prominence = max(
        0.25,
        np.std(gyro) * 0.35
    )

    peaks, _ = find_peaks(
        gyro,
        distance=max(
            1,
            int(round(0.45 * fs))
        ),
        prominence=prominence,
        height=threshold
    )

    segment_time = (
        seg["timestamp"].to_numpy(float)
        -
        seg["timestamp"].iloc[0]
    ) / 1000.0

    event_times = segment_time[peaks]

    intervals = np.diff(event_times)

    valid = intervals[
        (intervals >= 0.45) &
        (intervals <= 2.0)
    ]

    all_valid_intervals.extend(
        valid.tolist()
    )

all_valid_intervals = np.array(
    all_valid_intervals
)

if len(all_valid_intervals):

    overall_cadence = (
        60.0 /
        np.median(all_valid_intervals)
    )

    overall_mean = np.mean(
        all_valid_intervals
    )

    overall_std = np.std(
        all_valid_intervals
    )

    overall_cv = (
        overall_std /
        overall_mean *
        100
    )

else:

    overall_cadence = np.nan
    overall_mean = np.nan
    overall_std = np.nan
    overall_cv = np.nan

metrics = {

    "samples":
        len(df),

    "recording_segments":
        len(segment_results),

    "total_sensor_duration_s":
        total_duration,

    "median_sample_interval_s":
        sample_period,

    "estimated_sample_rate_hz":
        fs,

    "heel_zero_pct":
        df["heel_fsr"].eq(0).mean() * 100,

    "heel_saturated_pct":
        df["heel_saturated"].mean() * 100,

    "toe_zero_pct":
        df["toe_fsr"].eq(0).mean() * 100,

    "toe_saturated_pct":
        df["toe_saturated"].mean() * 100,

    "candidate_events":
        total_events,

    "valid_event_intervals":
        total_valid_intervals,

    "candidate_cadence_spm":
        overall_cadence,

    "event_interval_mean_s":
        overall_mean,

    "event_interval_std_s":
        overall_std,

    "event_interval_cv_pct":
        overall_cv,

    "imu_event_min_distance_s":
        0.45
}

pd.DataFrame([metrics]).to_csv(
    os.path.join(
        OUT,
        "trial_metrics.csv"
    ),
    index=False
)

# =========================================================
# SAVE CLEANED DATA
# =========================================================

df.to_csv(
    os.path.join(
        OUT,
        "cleaned_trial.csv"
    ),
    index=False
)

# =========================================================
# DEBUG / ENGINEERING GRAPH
# =========================================================

fig, ax = plt.subplots(
    3,
    1,
    figsize=(13, 10),
    sharex=True
)

t = df["time_s"].to_numpy()

# FSR
ax[0].plot(
    t,
    df["heel_fsr"],
    label="Heel FSR"
)

ax[0].plot(
    t,
    df["toe_fsr"],
    label="Toe FSR"
)

ax[0].axhline(
    4095,
    linestyle="--",
    label="ADC saturation (4095)"
)

ax[0].set_ylabel(
    "ADC reading"
)

ax[0].set_title(
    "ActiGait Raw FSR Trial"
)

ax[0].legend()

# Acceleration
ax[1].plot(
    t,
    df["accel_mag"],
    label="Acceleration magnitude"
)

ax[1].plot(
    t,
    df["accel_dynamic"],
    label="Dynamic acceleration"
)

ax[1].set_ylabel(
    "m/s²"
)

ax[1].legend()

# Gyroscope
ax[2].plot(
    t,
    df["gyro_mag"],
    label="Gyro magnitude"
)

# Convert segment event times to continuous plot time.
for event in all_events:

    segment_id = event["segment"]

    start = segment_starts[
        segment_id
    ]

    continuous_start = (
        df["time_s"].iloc[start]
    )

    plot_time = (
        continuous_start +
        event["event_time_s"]
    )

    ax[2].plot(
        plot_time,
        event["gyro_mag"],
        "x"
    )

ax[2].set_ylabel(
    "rad/s"
)

ax[2].set_xlabel(
    "Continuous recording timeline (s)"
)

ax[2].set_title(
    "IMU Movement / Step Candidate Detection"
)

ax[2].legend()

fig.suptitle(
    "ActiGait Sensor Analytics — Engineering View"
)

fig.tight_layout()

fig.savefig(
    os.path.join(
        OUT,
        "trial_overview.png"
    ),
    dpi=180
)

plt.close(fig)

# =========================================================
# CLEAN JUDGE GRAPH
# =========================================================

fig, ax = plt.subplots(
    figsize=(13, 5.5)
)

# Plot only gyro signal.
ax.plot(
    t,
    df["gyro_mag"],
    label="Gyroscope magnitude"
)

# Plot candidate events.
event_plot_times = []

event_plot_values = []

for event in all_events:

    segment_id = event["segment"]

    start = segment_starts[
        segment_id
    ]

    continuous_start = (
        df["time_s"].iloc[start]
    )

    event_plot_times.append(
        continuous_start +
        event["event_time_s"]
    )

    event_plot_values.append(
        event["gyro_mag"]
    )

ax.plot(
    event_plot_times,
    event_plot_values,
    "x",
    label="Candidate movement events"
)

# Mark recording boundaries.
for start in segment_starts[1:]:

    boundary = df["time_s"].iloc[start]

    ax.axvline(
        boundary,
        linestyle="--",
        alpha=0.35
    )

ax.set_title(
    "IMU-Based Movement Event Detection — Prototype Trial"
)

ax.set_xlabel(
    "Continuous recording timeline (s)"
)

ax.set_ylabel(
    "Gyroscope magnitude (rad/s)"
)

ax.legend()

ax.grid(
    alpha=0.2
)

fig.tight_layout()

fig.savefig(
    os.path.join(
        OUT,
        "judge_gait_analysis.png"
    ),
    dpi=220
)

plt.close(fig)

# =========================================================
# CONSOLE REPORT
# =========================================================

print()
print("ActiGait Real Trial Analysis")
print("============================")

print(
    f"samples: {len(df)}"
)

print(
    f"recording_segments: {len(segment_results)}"
)

print(
    f"total_sensor_duration_s: "
    f"{total_duration:.3f}"
)

print(
    f"median_sample_interval_s: "
    f"{sample_period:.3f}"
)

print(
    f"estimated_sample_rate_hz: "
    f"{fs:.3f}"
)

print(
    f"candidate_events: "
    f"{total_events}"
)

print(
    f"valid_event_intervals: "
    f"{total_valid_intervals}"
)

if np.isfinite(overall_cadence):

    print(
        f"candidate_cadence_spm: "
        f"{overall_cadence:.3f}"
    )

    print(
        f"event_interval_mean_s: "
        f"{overall_mean:.3f}"
    )

    print(
        f"event_interval_std_s: "
        f"{overall_std:.3f}"
    )

    print(
        f"event_interval_cv_pct: "
        f"{overall_cv:.3f}"
    )

else:

    print(
        "candidate_cadence_spm: N/A"
    )

print()
print(
    "FSR QUALITY"
)

print(
    f"heel_zero_pct: "
    f"{metrics['heel_zero_pct']:.3f}"
)

print(
    f"heel_saturated_pct: "
    f"{metrics['heel_saturated_pct']:.3f}"
)

print(
    f"toe_zero_pct: "
    f"{metrics['toe_zero_pct']:.3f}"
)

print(
    f"toe_saturated_pct: "
    f"{metrics['toe_saturated_pct']:.3f}"
)

print()
print(
    "IMPORTANT:"
)

print(
    "Candidate events are IMU-derived "
    "movement/step candidates."
)

print(
    "They are NOT clinically validated "
    "heel-strike/toe-off events."
)

print(
    "FSR readings at 4095 are treated "
    "as ADC saturation."
)

print()
print(
    "Outputs saved to:"
)

print(OUT)
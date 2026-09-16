#!/usr/bin/env python3
"""
ActiGait Telemetry Bridge
=========================
Streams sensor telemetry from ESP32 (via USB Serial) or from a recorded trial CSV
into the ActiGait FastAPI backend (http://127.0.0.1:8000/telemetry).

Usage:
  # 1. Live USB Serial from ESP32 (auto-detects port):
  python serial_bridge.py

  # 2. Specify a serial port:
  python serial_bridge.py --port /dev/tty.usbserial-0001 --baud 115200

  # 3. Replay real trial data (no hardware required):
  python serial_bridge.py --replay

  # 4. Replay at 2x speed in an endless loop:
  python serial_bridge.py --replay --speed 2.0 --loop
"""

import argparse
import glob
import json
import math
import os
import sys
import time
import urllib.error
import urllib.request

# Default backend telemetry endpoint
DEFAULT_API = "http://127.0.0.1:8000/telemetry"
DEFAULT_REPLAY_CSV = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "analytics", "data", "real_gait.csv")
)

# Force-sensing resistor ADC threshold (ESP32 ADC 0-4095, typically >100 when pressed)
FSR_STANCE_THRESHOLD = 100.0


def compute_pitch(accel_x: float, accel_y: float, accel_z: float) -> float:
    """Compute pitch angle in degrees from tri-axial accelerometer readings."""
    denom = math.sqrt(accel_y**2 + accel_z**2)
    if denom == 0:
        return 0.0
    return math.degrees(math.atan2(-accel_x, denom))


def determine_states(heel_fsr: float, toe_fsr: float, pitch: float, gyro_y: float):
    """
    Determine gait phase (STANCE vs SWING) and assistive servo response (SLACK vs TENSION).
    In stance, user is grounded -> cable is kept SLACK.
    In swing, foot is unweighted and accelerating forward -> cable is TENSIONED to lift toes.
    """
    is_grounded = (heel_fsr >= FSR_STANCE_THRESHOLD) or (toe_fsr >= FSR_STANCE_THRESHOLD)
    if is_grounded:
        gait_state = "STANCE"
        servo_state = "SLACK"
    else:
        gait_state = "SWING"
        servo_state = "TENSION"

    return gait_state, servo_state


def post_telemetry(api_url: str, payload: dict) -> bool:
    """Send telemetry payload to FastAPI backend via HTTP POST."""
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        api_url,
        data=data,
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=1.0) as response:
            return response.status in (200, 201)
    except urllib.error.URLError:
        return False
    except Exception:
        return False


def find_serial_ports():
    """Find potential ESP32 USB serial ports on macOS, Linux, and Windows."""
    patterns = [
        "/dev/tty.usbserial*",
        "/dev/tty.SLAB_USBtoUART*",
        "/dev/tty.wchusbserial*",
        "/dev/cu.usbserial*",
        "/dev/cu.wchusbserial*",
        "/dev/ttyACM*",
        "/dev/ttyUSB*",
    ]
    found = []
    for pattern in patterns:
        found.extend(glob.glob(pattern))
    return sorted(list(set(found)))


def parse_csv_line(line: str):
    """
    Parses CSV line supporting both:
    1. New 11-column format: timestamp,heel_fsr,toe_fsr,accel_x,accel_y,accel_z,gyro_x,gyro_y,gyro_z,gait_state,servo_angle
    2. Original 9-column format: timestamp,heel_fsr,toe_fsr,accel_x,accel_y,accel_z,gyro_x,gyro_y,gyro_z
    """
    if line.startswith(">>>") or "NOT FOUND" in line or line.startswith("timestamp"):
        return None

    parts = [p.strip() for p in line.split(",") if p.strip()]
    if len(parts) < 9:
        return None
    try:
        ts = float(parts[0])
        heel_fsr = float(parts[1])
        toe_fsr = float(parts[2])
        accel_x = float(parts[3])
        accel_y = float(parts[4])
        accel_z = float(parts[5])
        gyro_x = float(parts[6])
        gyro_y = float(parts[7])
        gyro_z = float(parts[8])

        esp_gait = None
        esp_servo_angle = None
        if len(parts) >= 11:
            esp_gait = parts[9]
            try:
                esp_servo_angle = float(parts[10])
            except ValueError:
                esp_servo_angle = None

        return ts, heel_fsr, toe_fsr, accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z, esp_gait, esp_servo_angle
    except ValueError:
        return None


def run_replay(csv_file: str, api_url: str, speed: float = 1.0, loop: bool = True):
    """Replay a recorded CSV trial as a live telemetry stream into FastAPI."""
    if not os.path.exists(csv_file):
        print(f"[ERROR] Replay CSV not found: {csv_file}")
        sys.exit(1)

    print(f"[INFO] Replaying trial data from: {csv_file}")
    print(f"[INFO] Target backend: {api_url}")
    print(f"[INFO] Speed multiplier: {speed}x (Looping: {loop})")
    print("-" * 65)

    count = 0
    while True:
        with open(csv_file, "r") as f:
            header = f.readline()  # skip header
            prev_ts = None

            for line in f:
                parsed = parse_csv_line(line)
                if not parsed:
                    continue

                ts, heel, toe, ax, ay, az, gx, gy, gz, esp_gait, esp_servo_angle = parsed

                # Calculate delay to simulate real-time sensor intervals (~50ms)
                if prev_ts is not None:
                    delta_ms = ts - prev_ts
                    if 0 < delta_ms < 1000:
                        sleep_s = (delta_ms / 1000.0) / speed
                        time.sleep(sleep_s)
                    else:
                        time.sleep(0.05 / speed)
                else:
                    time.sleep(0.05 / speed)
                prev_ts = ts

                pitch = compute_pitch(ax, ay, az)

                if esp_gait is not None:
                    gait_state = esp_gait
                    if esp_servo_angle is not None:
                        servo_state = "TENSION" if esp_servo_angle <= 5 else "SLACK"
                    else:
                        servo_state = "TENSION" if "ASSIST" in gait_state else "SLACK"
                else:
                    gait_state, servo_state = determine_states(heel, toe, pitch, gy)

                payload = {
                    "device_id": "actigait-01",
                    "heel_fsr": float(heel),
                    "toe_fsr": float(toe),
                    "pitch": round(pitch, 2),
                    "gyro_y": round(gy, 2),
                    "gait_state": gait_state,
                    "servo_state": servo_state,
                    "battery_voltage": 7.42,
                    "fault_code": "NONE"
                }

                ok = post_telemetry(api_url, payload)
                count += 1
                status = "OK" if ok else "ERR (Backend offline?)"
                sys.stdout.write(
                    f"\r[{count:05d}] Heel: {heel:4.0f} | Toe: {toe:4.0f} | "
                    f"Pitch: {pitch:+5.1f}° | State: {gait_state:<12} | Servo: {servo_state:<7} -> {status}  "
                )
                sys.stdout.flush()

        if not loop:
            break

    print("\n[INFO] Replay completed.")


def run_serial(port: str, baud: int, api_url: str):
    """Read live CSV lines from physical ESP32 USB serial and post to FastAPI."""
    try:
        import serial
    except ImportError:
        print("[ERROR] 'pyserial' package is not installed.")
        print("To read directly from USB, run: pip install pyserial")
        print("Or test with simulated replay: python serial_bridge.py --replay")
        sys.exit(1)

    print(f"[INFO] Connecting to ESP32 on port {port} @ {baud} baud...")
    try:
        ser = serial.Serial(port, baud, timeout=1.0)
    except Exception as e:
        print(f"[ERROR] Failed to open serial port {port}: {e}")
        sys.exit(1)

    print(f"[INFO] Connected! Streaming telemetry to {api_url}...")
    print("-" * 65)

    count = 0
    try:
        while True:
            raw_line = ser.readline().decode("utf-8", errors="ignore").strip()
            if not raw_line:
                continue

            # Print state machine transition logs from the ESP32
            if raw_line.startswith(">>>"):
                clean_event = raw_line.replace(">>>", "").replace("<<<", "").strip()
                print(f"\n[HARDWARE EVENT] {clean_event}")
                continue

            parsed = parse_csv_line(raw_line)
            if not parsed:
                continue

            ts, heel, toe, ax, ay, az, gx, gy, gz, esp_gait, esp_servo_angle = parsed
            pitch = compute_pitch(ax, ay, az)

            # Use edge gait state and servo angle directly from the firmware if available
            if esp_gait is not None:
                gait_state = esp_gait
                if esp_servo_angle is not None:
                    servo_state = "TENSION" if esp_servo_angle <= 5 else "SLACK"
                else:
                    servo_state = "TENSION" if "ASSIST" in gait_state else "SLACK"
            else:
                gait_state, servo_state = determine_states(heel, toe, pitch, gy)

            payload = {
                "device_id": "actigait-01",
                "heel_fsr": float(heel),
                "toe_fsr": float(toe),
                "pitch": round(pitch, 2),
                "gyro_y": round(gy, 2),
                "gait_state": gait_state,
                "servo_state": servo_state,
                "battery_voltage": 7.40,
                "fault_code": "NONE"
            }

            ok = post_telemetry(api_url, payload)
            count += 1
            status = "OK" if ok else "ERR (Backend offline?)"
            sys.stdout.write(
                f"\r[{count:05d}] Heel: {heel:4.0f} | Toe: {toe:4.0f} | "
                f"Pitch: {pitch:+5.1f}° | State: {gait_state:<12} | Servo: {servo_state:<7} -> {status}  "
            )
            sys.stdout.flush()

    except KeyboardInterrupt:
        print("\n[INFO] Serial stream stopped by user.")
    finally:
        ser.close()


def main():
    parser = argparse.ArgumentParser(description="ActiGait Telemetry Serial & Replay Bridge")
    parser.add_argument("--port", help="Serial port (e.g. /dev/tty.usbserial-0001, COM3)")
    parser.add_argument("--baud", type=int, default=115200, help="Baud rate (default: 115200)")
    parser.add_argument("--api", default=DEFAULT_API, help=f"Backend telemetry URL (default: {DEFAULT_API})")
    parser.add_argument(
        "--replay",
        nargs="?",
        const=DEFAULT_REPLAY_CSV,
        help=f"Replay CSV file instead of live serial (default file: {DEFAULT_REPLAY_CSV})"
    )
    parser.add_argument("--speed", type=float, default=1.0, help="Replay speed multiplier (default: 1.0)")
    parser.add_argument("--no-loop", action="store_true", help="Do not loop replay file")

    args = parser.parse_args()

    if args.replay:
        run_replay(args.replay, args.api, speed=args.speed, loop=not args.no_loop)
        return

    port = args.port
    if not port:
        ports = find_serial_ports()
        if ports:
            port = ports[0]
            print(f"[INFO] Auto-detected ESP32 port: {port}")
        else:
            print("[WARN] No USB serial ports automatically found.")
            print("[INFO] Fallback: You can replay existing trial data using:")
            print("       python backend/serial_bridge.py --replay\n")
            print("Or specify your port manually with --port <PORT_NAME>")
            sys.exit(1)

    run_serial(port, args.baud, args.api)


if __name__ == "__main__":
    main()

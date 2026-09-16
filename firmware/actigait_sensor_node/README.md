# ActiGait Sensor & Actuator Node

ESP32-based sensor acquisition and assistive servo control firmware for the ActiGait wearable ankle-foot rehabilitation prototype.

This firmware:
- Collects real-time gait sensor data from MPU6050 6-axis IMU, Heel FSR, and Toe FSR
- Runs real-time edge gait phase detection (`STANCE`, `HEEL_OFF`, `SWING_ASSIST`)
- Controls an MG996R servo motor to tension the assistance cable during swing and release to slack during stance
- Streams 11-column CSV telemetry over Serial (115200 baud) for the ActiGait telemetry bridge and dashboard

## Hardware

### ESP32 DevKit V1

| Component | ESP32 Pin | Notes |
|---|---|---|
| Heel FSR | GPIO 32 | Analog ADC input (Voltage divider with 10kΩ) |
| Toe FSR | GPIO 33 | Analog ADC input (Voltage divider with 10kΩ) |
| MPU6050 SDA | GPIO 21 | I2C Data |
| MPU6050 SCL | GPIO 22 | I2C Clock |
| MPU6050 VCC | 3.3V | Power |
| MPU6050 GND | GND | Ground |
| MG996R Servo PWM | GPIO 18 | Signal wire (Orange/White) |

> **Power Supply Note:** Power the MG996R servo using an external regulated 5V–6V supply (e.g., LM2596 buck converter from 7.4V LiPo). Connect all grounds together (ESP32 GND to LM2596 GND). Do not power the servo directly from the ESP32 3.3V pin.

## FSR Configuration

Each FSR is connected as a voltage divider:

```text
3.3V
 |
[FSR]
 |
 +------ ESP32 ADC GPIO (32 / 33)
 |
[10kΩ resistor]
 |
GND
```

FSR sensors have no polarity.

## Servo Angles & Tuning

* **Slack Angle:** `20°` (Relaxed cable for natural foot placement and stance)
* **Assist Angle:** `0°` (Tensioned Bowden cable to lift toes and prevent drop foot drag)
* **Heel Threshold:** `1000` (ADC threshold for stance detection; adjust based on subject weight and shoe calibration)

## State Machine

1. **Heel Contact (`STANCE`):** When `heelPressure >= HEEL_THRESHOLD`, the cable is released to `SLACK_ANGLE` (20°).
2. **Heel Off Transition (`SWING_ASSIST`):** When heel transitions from loaded to unloaded, the servo rotates to `ASSIST_ANGLE` (0°) to tension the cable and dorsiflex the ankle.
3. **Prevention of Hunting:** Triggers assist strictly on transition (`loaded -> unloaded`), preventing repeated jitter while foot is in the air.

## Serial Output

Baud rate:
```text
115200
```

CSV header:
```text
timestamp,heel_fsr,toe_fsr,accel_x,accel_y,accel_z,gyro_x,gyro_y,gyro_z,gait_state,servo_angle
```

Each row contains:
1. `timestamp`: Elapsed time in milliseconds
2. `heel_fsr`: Heel FSR ADC reading (0–4095)
3. `toe_fsr`: Toe FSR ADC reading (0–4095)
4. `accel_x`: Accelerometer X (m/s²)
5. `accel_y`: Accelerometer Y (m/s²)
6. `accel_z`: Accelerometer Z (m/s²)
7. `gyro_x`: Gyroscope X (rad/s)
8. `gyro_y`: Gyroscope Y (rad/s)
9. `gyro_z`: Gyroscope Z (rad/s)
10. `gait_state`: `STANCE`, `HEEL_OFF`, or `SWING_ASSIST`
11. `servo_angle`: Current servo angle (`0` for Assist, `20` for Slack)

The firmware samples approximately every 50 ms (~20 Hz).

## Required Arduino Libraries

Install the following libraries through Arduino IDE Library Manager:

* **ESP32Servo** by Kevin Harrington
* **Adafruit MPU6050**
* **Adafruit Unified Sensor**

`Wire.h` is included with the Arduino/ESP32 environment.

## Prototype Status

This firmware was tested successfully with:
* ESP32 DevKit V1
* MPU6050
* Dual FSR sensors (GPIO 32, 33)
* MG996R Servo (GPIO 18)

The resulting sensor stream is intended for prototype development and algorithm validation. It is **not clinically validated** and should not be treated as medical-device control firmware or used for unsupervised patient rehabilitation.

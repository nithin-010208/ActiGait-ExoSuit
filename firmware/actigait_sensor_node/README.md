# ActiGait Sensor Node

ESP32-based sensor acquisition firmware for the ActiGait wearable ankle-foot
rehabilitation prototype.

This firmware collects real-time gait-related sensor data from:

- MPU6050 6-axis IMU
- Heel FSR
- Toe FSR

The data is streamed over Serial in CSV format for analytics and gait analysis.

## Hardware

### ESP32 DevKit V1

| Component | ESP32 Pin |
|---|---|
| Heel FSR | GPIO 32 |
| Toe FSR | GPIO 33 |
| MPU6050 SDA | GPIO 21 |
| MPU6050 SCL | GPIO 22 |
| MPU6050 VCC | 3.3V |
| MPU6050 GND | GND |

## FSR Configuration

Each FSR is connected as a voltage divider:

```text
3.3V
 |
[FSR]
 |
 +------ ESP32 ADC GPIO
 |
[10kΩ resistor]
 |
GND
```

FSR sensors have no polarity.

## MPU6050 Configuration

* Accelerometer range: ±8G
* Gyroscope range: ±500 deg/s
* Filter bandwidth: 21 Hz
* I2C SDA: GPIO 21
* I2C SCL: GPIO 22

## Serial Output

Baud rate:

```text
115200
```

CSV header:

```text
timestamp,heel_fsr,toe_fsr,accel_x,accel_y,accel_z,gyro_x,gyro_y,gyro_z
```

Each row contains:

1. Timestamp in milliseconds
2. Heel FSR ADC reading
3. Toe FSR ADC reading
4. Accelerometer X
5. Accelerometer Y
6. Accelerometer Z
7. Gyroscope X
8. Gyroscope Y
9. Gyroscope Z

The firmware samples approximately every 50 ms (~20 Hz).

## Required Arduino Libraries

Install the following libraries through Arduino IDE Library Manager:

* Adafruit MPU6050
* Adafruit Unified Sensor

`Wire.h` is included with the Arduino/ESP32 environment.

## Current Scope

This firmware is intentionally limited to **sensor acquisition and telemetry**.

Servo actuation, LiPo battery control, and the LM2596 servo power rail are
not controlled by this firmware.

This separation is intentional so that sensor validation can be performed
independently from the actuator power system.

## Data Usage

The Serial CSV output can be captured and processed by the ActiGait analytics
pipeline.

Example data flow:

```text
MPU6050 + Dual FSR
        ↓
      ESP32
        ↓
   Serial CSV
        ↓
   Analytics
        ↓
Gait Events & Metrics
        ↓
Dashboard / Clinical Insights
```

## Prototype Status

This firmware was tested successfully with:

* ESP32 DevKit V1
* MPU6050
* Dual FSR sensors

The resulting sensor stream is intended for prototype development and
algorithm validation.

It is **not clinically validated** and should not be treated as medical-device
control firmware or used for unsupervised patient rehabilitation.

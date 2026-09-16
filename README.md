# ActiGait Exosuit

## Overview

**ActiGait Exosuit** is an assistive wearable device designed to support people experiencing **drop foot** caused by conditions such as isolated peroneal nerve palsy or stroke-related hemiplegia.

Drop foot can make it difficult to lift the front of the foot while walking, increasing the risk of tripping and reducing walking confidence. ActiGait Exosuit uses sensors, an embedded controller, and a servo-assisted cable mechanism to detect gait phases and provide support during the swing phase of walking.

The project was developed by **Team Maganae** for **VMEDITHON 3.0**.

## Problem Statement

People with drop foot may have difficulty dorsiflexing the ankle during walking. As a result, the toes can drag on the ground during the swing phase, causing:

* Increased risk of tripping and falling
* Reduced walking stability
* Uneven or compensatory gait
* Increased effort during walking
* Reduced confidence and mobility

Traditional rehabilitation devices can be expensive, bulky, or difficult to customize. ActiGait Exosuit aims to provide a compact, affordable, and responsive assistive solution.

## Proposed Solution

ActiGait Exosuit is a wearable ankle-assistance system that detects the user's gait phase and applies mechanical assistance when the foot enters the swing phase.

The system uses:

* An **ESP32** microcontroller for real-time control
* An **MPU6050 IMU** to measure shin movement and orientation
* Two **FSR 402 force-sensitive resistors** to detect heel and toe pressure
* An **MG996R servo motor** to control cable tension
* A **Bowden cable or bicycle brake cable mechanism** to transfer servo movement
* A **7.4V 2S LiPo battery** as the power source
* An **LM2596 buck converter** for regulated power delivery

The control algorithm runs locally on the ESP32 so that gait assistance does not depend on an internet connection.

## How It Works

The device identifies the user's gait phase using pressure and motion data.

### 1. Stance Phase

During stance, the foot is in contact with the ground. The heel and/or toe force sensors detect pressure, and the servo keeps the assistance cable relatively slack.

This allows the user to place weight on the foot without unnecessary cable tension.

### 2. Swing Detection

When the heel pressure decreases and the shin begins to move forward, the ESP32 interprets the combined sensor readings as the beginning of the swing phase.

The system uses:

* Heel pressure reduction
* Toe pressure changes
* Forward shin pitch from the MPU6050
* Gyroscope movement data

Using multiple signals helps reduce false gait-state detection.

### 3. Swing Assistance

Once swing is detected, the servo rotates to tension the Bowden cable. The cable mechanism assists with lifting the front of the foot, helping reduce toe drag during forward movement.

### 4. Return to Stance

When the foot approaches the ground and pressure is detected again, the controller releases or reduces cable tension. The system then returns to the stance state.

## System Architecture

The project is divided into three main layers:

### Embedded Hardware Layer

The hardware layer collects sensor readings and controls the actuator.

Main components include:

* ESP32
* MPU6050 IMU
* Heel FSR
* Toe FSR
* MG996R servo
* Cable-based mechanical linkage
* Battery and voltage regulation circuitry

### Edge-Control Layer

The ESP32 performs real-time gait detection and actuator control.

The embedded controller is responsible for:

* Reading heel and toe pressure
* Reading IMU motion data
* Filtering sensor values
* Detecting stance and swing phases
* Controlling servo tension
* Monitoring battery voltage
* Detecting basic system faults

The main gait states are:

* `STANCE`
* `SWING`

The main servo states are:

* `SLACK`
* `TENSION`

### Backend and Monitoring Layer

A FastAPI backend receives telemetry from the ESP32 and stores it in a SQLite database.

The backend provides API endpoints for:

* Health checking
* Receiving telemetry
* Viewing the latest device data
* Storing historical sensor and gait information

The backend is intended for monitoring, testing, debugging, and future analytics. The core gait-control loop remains on the ESP32 for low latency and offline operation.

## Backend API

The backend is built using:

* Python
* FastAPI
* SQLAlchemy
* SQLite
* Uvicorn

### Available Endpoints

| Method | Endpoint     | Purpose                                    |
| ------ | ------------ | ------------------------------------------ |
| `GET`  | `/`          | Basic backend status                       |
| `GET`  | `/health`    | Health check                               |
| `POST` | `/telemetry` | Receive device telemetry                   |
| `GET`  | `/latest`    | Retrieve the latest telemetry record       |
| `GET`  | `/docs`      | Open interactive Swagger API documentation |

### Telemetry Data

The backend accepts telemetry fields such as:

* Device ID
* Heel FSR value
* Toe FSR value
* Shin pitch
* Gyroscope Y-axis value
* Gait state
* Servo state
* Battery voltage
* Fault code

Example telemetry payload:

```json
{
  "device_id": "actigait-01",
  "heel_fsr": 720,
  "toe_fsr": 180,
  "pitch": 12.5,
  "gyro_y": 3.2,
  "gait_state": "SWING",
  "servo_state": "TENSION",
  "battery_voltage": 7.8,
  "fault_code": "NONE"
}
```

## Frontend

The project also includes a frontend interface intended to provide a visual dashboard for the ActiGait Exosuit system.

The dashboard can be used to display or integrate:

* Current gait state
* Servo state
* Sensor readings
* Battery voltage
* Device health
* Fault information
* Recent telemetry
* Gait-analysis information

The frontend communicates with the backend API and is designed to support future monitoring and visualization features.

## Technology Stack

### Hardware

* ESP32
* MPU6050
* FSR 402 sensors
* MG996R servo motor
* Bowden or bicycle brake cable
* 7.4V 2S LiPo battery
* LM2596 buck converter

### Embedded Software

* ESP32 firmware
* Sensor data processing
* Gait-state detection
* Servo control
* Battery and fault monitoring

### Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite
* Uvicorn

### Frontend

* Next.js
* TypeScript
* Tailwind CSS

### Development Tools

* Git
* GitHub
* Visual Studio Code or another code editor
* Python virtual environment
* Node.js and npm

## Project Structure

```text
ActiGait-ExoSuit/
├── analytics/
│   └── src/
├── app/
│   ├── dashboard/
│   └── ...
├── backend/
│   ├── main.py
│   ├── actigait.db
│   ├── requirements.txt
│   └── .venv/
├── firmware/
│   └── actigait_sensor_node/
│       ├── actigait_sensor_node.ino
│       └── README.md
├── lib/
├── public/
├── package.json
└── README.md
```

The exact frontend folders may vary depending on the current branch and implementation.

## Running the Backend

From the project directory:

```bash
cd ~/ActiGait-ExoSuit/backend
source .venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## Running the Frontend

In a separate terminal:

```bash
cd ~/ActiGait-ExoSuit
npm install
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

## Connecting the ESP32

When the ESP32 and development computer are connected to the same Wi-Fi network, the ESP32 should send telemetry to the computer's local IP address.

Example:

```text
http://YOUR_COMPUTER_IP:8000/telemetry
```

The ESP32 should not use `localhost` or `127.0.0.1` because those addresses refer to the ESP32 itself.

## Current Development Status

The project currently includes:

* A defined assistive exosuit concept
* Sensor-based gait-phase detection logic
* Servo-driven cable assistance
* ESP32-based edge-control architecture
* FastAPI backend
* SQLite telemetry storage
* Telemetry API endpoints
* Interactive backend documentation
* Frontend dashboard foundation
* GitHub-based collaborative development

## Future Improvements

Possible future development includes:

* Calibrating FSR and IMU thresholds for individual users
* Adding adaptive gait detection
* Improving sensor filtering
* Adding a more accurate ankle-angle estimation
* Implementing configurable assistance levels
* Adding real-time telemetry charts
* Adding user profiles and session history
* Improving battery monitoring
* Adding safety limits and emergency release behavior
* Testing the system with different walking speeds
* Conducting structured usability and gait-assistance evaluations
* Improving the mechanical comfort and weight distribution
* Developing a mobile companion application

## Safety Considerations

ActiGait Exosuit is a prototype assistive device and should be tested carefully before use.

Important safety considerations include:

* Mechanical cable tension must be limited
* Servo movement should have physical and software limits
* The system should fail safely if sensor readings become invalid
* The device should not apply excessive force to the user's ankle
* Battery wiring and voltage regulation must be properly insulated
* Testing should begin with controlled, supervised movement
* The device should not be used as a medical treatment without appropriate professional evaluation

## Team

**Team Name:** Maganae
**Event:** VMEDITHON 3.0
**Project:** ActiGait Exosuit

The project combines embedded systems, wearable robotics, mechanical design, backend development, and gait-data monitoring to create an affordable assistive technology prototype for people affected by drop foot.

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <ESP32Servo.h>

// ==========================================
// Wi-Fi Configuration
// ==========================================
const char* WIFI_SSID     = "Pixel_3309";
const char* WIFI_PASSWORD = "skillissue";

// FastAPI server URL (add :8000 if running default uvicorn port)
const char* TELEMETRY_SERVER_URL = "http://172.16.131.187:8000/telemetry";

// ==========================================
// Hardware Objects
// ==========================================
Adafruit_MPU6050 mpu;
Servo assistServo;

// ==========================================
// Pin Definitions
// ==========================================
const int HEEL_FSR_PIN = 32;
const int TOE_FSR_PIN  = 33;

const int SDA_PIN = 21;
const int SCL_PIN = 22;

const int SERVO_PIN = 18;

// ==========================================
// Servo & Threshold Calibration
// ==========================================
const int SLACK_ANGLE  = 20;  // Cable relaxed during stance
const int ASSIST_ANGLE = 0;   // Cable tensioned to assist foot lift
const int HEEL_THRESHOLD = 1000;

// ==========================================
// State Machine Variables
// ==========================================
bool heelWasLoaded = false;
bool assisting = false;

void setup() {
  Serial.begin(115200);
  delay(1000);

  // ---------- I2C ----------
  Wire.begin(SDA_PIN, SCL_PIN);

  // ---------- MPU6050 ----------
  if (!mpu.begin()) {
    Serial.println("[ERROR] MPU6050 NOT FOUND!");
    while (1) {
      delay(1000);
    }
  }

  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  // ---------- SERVO ----------
  assistServo.setPeriodHertz(50);
  assistServo.attach(SERVO_PIN, 500, 2400);
  assistServo.write(SLACK_ANGLE); // Start relaxed

  // ---------- Wi-Fi Connection ----------
  Serial.print("[INFO] Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[INFO] Wi-Fi Connected!");
    Serial.print("[INFO] ESP32 IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WARN] Wi-Fi timed out. Continuing with Serial stream.");
  }

  // ---------- CSV Header ----------
  Serial.println(
    "timestamp,heel_fsr,toe_fsr,"
    "accel_x,accel_y,accel_z,"
    "gyro_x,gyro_y,gyro_z,"
    "gait_state,servo_angle"
  );
}

void loop() {
  // ---------- MPU6050 Readings ----------
  sensors_event_t acceleration;
  sensors_event_t gyro;
  sensors_event_t temperature;
  mpu.getEvent(&acceleration, &gyro, &temperature);

  // ---------- FSR Readings ----------
  int heelPressure = analogRead(HEEL_FSR_PIN);
  int toePressure  = analogRead(TOE_FSR_PIN);

  // Calculate Shin Pitch (degrees)
  float pitch = atan2(-acceleration.acceleration.x, 
                      sqrt(acceleration.acceleration.y * acceleration.acceleration.y + 
                           acceleration.acceleration.z * acceleration.acceleration.z)) * 180.0 / PI;

  // ---------- Heel State & Servo Trigger ----------
  bool heelLoaded = heelPressure >= HEEL_THRESHOLD;

  if (heelLoaded) {
    // Heel Contact -> Relax Cable
    if (assisting) {
      Serial.println(">>> HEEL CONTACT - RELEASE <<<");
      assistServo.write(SLACK_ANGLE);
      assisting = false;
    }
    heelWasLoaded = true;
  } else {
    // Heel Off -> Tension Cable to Assist Dorsiflexion
    if (heelWasLoaded && !assisting) {
      Serial.println(">>> HEEL OFF - ASSIST <<<");
      assistServo.write(ASSIST_ANGLE);
      assisting = true;
    }
    heelWasLoaded = false;
  }

  // ---------- Determine Gait & Servo State Strings ----------
  String gaitState;
  String servoState;
  int currentAngle = assisting ? ASSIST_ANGLE : SLACK_ANGLE;

  if (assisting) {
    gaitState  = "SWING_ASSIST";
    servoState = "TENSION";
  } else if (heelLoaded) {
    gaitState  = "STANCE";
    servoState = "SLACK";
  } else {
    gaitState  = "HEEL_OFF";
    servoState = "SLACK";
  }

  // ---------- 1. Serial CSV Telemetry ----------
  Serial.print(millis());
  Serial.print(",");
  Serial.print(heelPressure);
  Serial.print(",");
  Serial.print(toePressure);
  Serial.print(",");
  Serial.print(acceleration.acceleration.x);
  Serial.print(",");
  Serial.print(acceleration.acceleration.y);
  Serial.print(",");
  Serial.print(acceleration.acceleration.z);
  Serial.print(",");
  Serial.print(gyro.gyro.x);
  Serial.print(",");
  Serial.print(gyro.gyro.y);
  Serial.print(",");
  Serial.print(gyro.gyro.z);
  Serial.print(",");
  Serial.print(gaitState);
  Serial.print(",");
  Serial.println(currentAngle);

  // ---------- 2. Wi-Fi HTTP Telemetry to FastAPI ----------
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(TELEMETRY_SERVER_URL);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{";
    jsonPayload += "\"device_id\":\"actigait-01\",";
    jsonPayload += "\"heel_fsr\":" + String(heelPressure) + ",";
    jsonPayload += "\"toe_fsr\":" + String(toePressure) + ",";
    jsonPayload += "\"pitch\":" + String(pitch, 2) + ",";
    jsonPayload += "\"gyro_y\":" + String(gyro.gyro.y, 2) + ",";
    jsonPayload += "\"gait_state\":\"" + gaitState + "\",";
    jsonPayload += "\"servo_state\":\"" + servoState + "\",";
    jsonPayload += "\"battery_voltage\":7.40,";
    jsonPayload += "\"fault_code\":\"NONE\"";
    jsonPayload += "}";

    int httpCode = http.POST(jsonPayload);
    if (httpCode <= 0) {
      // Print error only if post fails
      // Serial.printf("[HTTP] Error: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  }

  delay(50);
}

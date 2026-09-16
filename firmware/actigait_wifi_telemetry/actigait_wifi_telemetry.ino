#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// ==========================================
// Wi-Fi Configuration
// Replace with your local Wi-Fi credentials
// ==========================================
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Replace with your development machine's local IP address
// e.g., "http://192.168.1.100:8000/telemetry"
const char* TELEMETRY_SERVER_URL = "http://192.168.1.100:8000/telemetry";

Adafruit_MPU6050 mpu;

// FSR pins
const int HEEL_FSR_PIN = 32;
const int TOE_FSR_PIN  = 33;

// MPU6050 I2C pins
const int SDA_PIN = 21;
const int SCL_PIN = 22;

const float FSR_STANCE_THRESHOLD = 150.0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Initialize I2C
  Wire.begin(SDA_PIN, SCL_PIN);

  // Initialize MPU6050
  if (!mpu.begin()) {
    Serial.println("[ERROR] MPU6050 not detected. Halting.");
    while (1) {
      delay(1000);
    }
  }

  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  // Connect to Wi-Fi
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
    Serial.println("\n[WARN] Wi-Fi connection timed out. Telemetry will stream over Serial only.");
  }
}

void loop() {
  sensors_event_t accel, gyro, temp;
  mpu.getEvent(&accel, &gyro, &temp);

  int heelPressure = analogRead(HEEL_FSR_PIN);
  int toePressure  = analogRead(TOE_FSR_PIN);

  // Compute shin pitch from accelerometer (in degrees)
  float pitch = atan2(-accel.acceleration.x, sqrt(accel.acceleration.y * accel.acceleration.y + accel.acceleration.z * accel.acceleration.z)) * 180.0 / PI;

  // Determine gait and servo states
  bool isStance = (heelPressure > FSR_STANCE_THRESHOLD) || (toePressure > FSR_STANCE_THRESHOLD);
  String gaitState  = isStance ? "STANCE" : "SWING";
  String servoState = isStance ? "SLACK"  : "TENSION";

  // Also print to Serial for monitoring
  Serial.printf("%lu,%d,%d,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f\n",
    millis(), heelPressure, toePressure,
    accel.acceleration.x, accel.acceleration.y, accel.acceleration.z,
    gyro.gyro.x, gyro.gyro.y, gyro.gyro.z
  );

  // If Wi-Fi is connected, send HTTP POST to FastAPI backend
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(TELEMETRY_SERVER_URL);
    http.addHeader("Content-Type", "application/json");

    // Build JSON payload
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
    if (httpCode > 0) {
      // Success
    } else {
      Serial.printf("[HTTP] Error sending POST: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  }

  // ~20 Hz sampling rate
  delay(50);
}

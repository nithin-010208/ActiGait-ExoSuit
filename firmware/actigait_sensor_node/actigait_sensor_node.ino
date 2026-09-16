#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <ESP32Servo.h>

Adafruit_MPU6050 mpu;
Servo assistServo;

// ================= PINS =================

const int HEEL_FSR_PIN = 32;
const int TOE_FSR_PIN  = 33;

const int SDA_PIN = 21;
const int SCL_PIN = 22;

const int SERVO_PIN = 18;


// ================= SERVO =================

// Adjust these after checking the actual cable movement.

const int SLACK_ANGLE  = 20;
const int ASSIST_ANGLE = 0;


// ================= HEEL THRESHOLD =================

// Based on your earlier testing.
// Tune using actual walking readings.

const int HEEL_THRESHOLD = 1000;


// ================= STATE =================

bool heelWasLoaded = false;
bool assisting = false;


// ==================================================
// SETUP
// ==================================================

void setup() {

  Serial.begin(115200);
  delay(1000);

  // ---------- I2C ----------

  Wire.begin(SDA_PIN, SCL_PIN);


  // ---------- MPU6050 ----------

  if (!mpu.begin()) {

    Serial.println("MPU6050 NOT FOUND!");

    while (1) {
      delay(1000);
    }
  }

  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);


  // ---------- SERVO ----------

  assistServo.setPeriodHertz(50);

  assistServo.attach(
    SERVO_PIN,
    500,
    2400
  );

  // Always start relaxed
  assistServo.write(SLACK_ANGLE);

  delay(1000);


  // ---------- CSV ----------

  Serial.println(
    "timestamp,heel_fsr,toe_fsr,"
    "accel_x,accel_y,accel_z,"
    "gyro_x,gyro_y,gyro_z,"
    "gait_state,servo_angle"
  );
}


// ==================================================
// LOOP
// ==================================================

void loop() {

  // ---------- MPU6050 ----------

  sensors_event_t acceleration;
  sensors_event_t gyro;
  sensors_event_t temperature;

  mpu.getEvent(
    &acceleration,
    &gyro,
    &temperature
  );


  // ---------- FSR ----------

  int heelPressure = analogRead(HEEL_FSR_PIN);
  int toePressure  = analogRead(TOE_FSR_PIN);


  // ==================================================
  // HEEL STATE
  // ==================================================

  bool heelLoaded = heelPressure >= HEEL_THRESHOLD;


  // ==================================================
  // HEEL CONTACT → SLACK
  // ==================================================

  if (heelLoaded) {

    if (assisting) {

      Serial.println(">>> HEEL CONTACT - RELEASE <<<");

      assistServo.write(SLACK_ANGLE);

      assisting = false;
    }

    heelWasLoaded = true;
  }


  // ==================================================
  // HEEL OFF → ASSIST
  // ==================================================

  else {

    // Trigger ONLY on transition:
    //
    // loaded → unloaded
    //
    // This prevents repeated pull/release cycles
    // while the heel remains off the ground.

    if (heelWasLoaded && !assisting) {

      Serial.println(">>> HEEL OFF - ASSIST <<<");

      assistServo.write(ASSIST_ANGLE);

      assisting = true;
    }

    heelWasLoaded = false;
  }


  // ==================================================
  // GAIT STATE
  // ==================================================

  String gaitState;

  if (assisting) {

    gaitState = "SWING_ASSIST";

  }
  else if (heelLoaded) {

    gaitState = "STANCE";

  }
  else {

    gaitState = "HEEL_OFF";
  }


  // ==================================================
  // SERIAL TELEMETRY
  // ==================================================

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

  if (assisting) {
    Serial.println(ASSIST_ANGLE);
  }
  else {
    Serial.println(SLACK_ANGLE);
  }


  delay(50);
}

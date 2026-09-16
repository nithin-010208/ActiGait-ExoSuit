#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

Adafruit_MPU6050 mpu;

// FSR pins
const int HEEL_FSR_PIN = 32;
const int TOE_FSR_PIN  = 33;

// MPU6050 I2C pins
const int SDA_PIN = 21;
const int SCL_PIN = 22;

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Initialize I2C
  Wire.begin(SDA_PIN, SCL_PIN);

  // Initialize MPU6050
  if (!mpu.begin()) {
    Serial.println("MPU6050 NOT FOUND!");

    while (1) {
      delay(1000);
    }
  }

  // MPU6050 configuration
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  // CSV header
  Serial.println(
    "timestamp,heel_fsr,toe_fsr,"
    "accel_x,accel_y,accel_z,"
    "gyro_x,gyro_y,gyro_z"
  );
}

void loop() {

  sensors_event_t acceleration;
  sensors_event_t gyro;
  sensors_event_t temperature;

  // Read MPU6050
  mpu.getEvent(
    &acceleration,
    &gyro,
    &temperature
  );

  // Read FSR sensors
  int heelPressure = analogRead(HEEL_FSR_PIN);
  int toePressure  = analogRead(TOE_FSR_PIN);

  // Timestamp
  Serial.print(millis());
  Serial.print(",");

  // FSR readings
  Serial.print(heelPressure);
  Serial.print(",");

  Serial.print(toePressure);
  Serial.print(",");

  // Accelerometer
  Serial.print(acceleration.acceleration.x);
  Serial.print(",");

  Serial.print(acceleration.acceleration.y);
  Serial.print(",");

  Serial.print(acceleration.acceleration.z);
  Serial.print(",");

  // Gyroscope
  Serial.print(gyro.gyro.x);
  Serial.print(",");

  Serial.print(gyro.gyro.y);
  Serial.print(",");

  Serial.println(gyro.gyro.z);

  // ~20 Hz sampling
  delay(50);
}

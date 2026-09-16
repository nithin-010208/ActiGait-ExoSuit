# ActiGait Wi-Fi Telemetry Firmware

Alternative firmware for wireless telemetry streaming from the ESP32 to the ActiGait FastAPI backend over local Wi-Fi.

## How to Configure

1. Open `actigait_wifi_telemetry.ino` in Arduino IDE.
2. Update the Wi-Fi credentials:
   ```cpp
   const char* WIFI_SSID     = "YOUR_WIFI_SSID";
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
   ```
3. Set your computer's local network IP:
   ```cpp
   const char* TELEMETRY_SERVER_URL = "http://192.168.x.x:8000/telemetry";
   ```
4. Flash to ESP32 DevKit V1.

## Fallback
If Wi-Fi is disconnected, the firmware continues to output CSV over USB Serial (115200 baud) so you can still use `python backend/serial_bridge.py`.

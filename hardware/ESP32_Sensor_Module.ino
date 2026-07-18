/*
 * ============================================
 *  FARM CAP 2 — ESP32 SENSOR MODULE
 *  Reads: DHT11 (Temp + Humidity) + Soil Moisture
 *  Sends: Data to Firebase Realtime Database
 *  Reads: Motor control commands from Firebase
 *  Shows: Live readings on 0.96" OLED Display
 * ============================================
 *
 *  WIRING:
 *  DHT11 Sensor:
 *    - VCC  → 3.3V
 *    - GND  → GND
 *    - DATA → GPIO 4
 *
 *  Soil Moisture Sensor (Resistive - 2 fork prongs):
 *    - VCC  → 3.3V
 *    - GND  → GND
 *    - AO   → GPIO 34 (Analog output)
 *
 *  Relay Module (Water Pump):
 *    - VCC  → 5V (or VIN)
 *    - GND  → GND
 *    - IN   → GPIO 26
 *
 *  OLED Display (0.96" SSD1306 I2C):
 *    - VCC  → 3.3V
 *    - GND  → GND
 *    - SCL  → GPIO 22
 *    - SDA  → GPIO 21
 *
 *  LIBRARIES NEEDED (Install via Arduino Library Manager):
 *    1. "Firebase ESP Client" by mobizt
 *    2. "DHT sensor library" by Adafruit
 *    3. "Adafruit Unified Sensor" by Adafruit
 *    4. "Adafruit SSD1306" by Adafruit
 *    5. "Adafruit GFX Library" by Adafruit
 *
 *  BOARD: Select "ESP32 Dev Module" in Arduino IDE
 */

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ===== WIFI CREDENTIALS =====
#define WIFI_SSID     "12345678"
#define WIFI_PASSWORD "12315678"

// ===== FIREBASE CONFIG =====
#define FIREBASE_HOST "https://farm-cap-2-default-rtdb.firebaseio.com"
#define FIREBASE_API_KEY "AIzaSyAzj0FLC2X_yIRHA7SG032DoF55F63lyBU"

// ===== PIN DEFINITIONS =====
#define DHTPIN 4           // DHT11 data pin
#define DHTTYPE DHT11      // DHT11 sensor type
#define SOIL_PIN 34        // Soil moisture analog pin
#define RELAY_PIN 26       // Relay (water pump) control pin

// ===== OLED DISPLAY =====
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1      // No reset pin
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ===== TIMING =====
#define SEND_INTERVAL 30000  // Send data every 30 seconds

// ===== SENSOR CALIBRATION =====
// Calibrate these for YOUR resistive soil moisture sensor
// Dry air = high value (~4095), Wet soil = low value (~1000)
// TIP: Check Serial Monitor for raw values and adjust if needed
#define SOIL_DRY   4095    // Sensor reading when completely dry
#define SOIL_WET   1000    // Sensor reading when in wet soil

// ===== OBJECTS =====
DHT dht(DHTPIN, DHTTYPE);
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long lastSendTime = 0;
bool motorState = false;

// ===== SETUP =====
void setup() {
  Serial.begin(115200);
  Serial.println("\n=============================");
  Serial.println("  FARM CAP 2 - Sensor Module");
  Serial.println("=============================\n");

  // Initialize OLED Display
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("❌ OLED Display not found!");
  } else {
    Serial.println("✅ OLED Display ready!");
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(20, 20);
    display.println("FARM CAP 2");
    display.setCursor(15, 40);
    display.println("Starting up...");
    display.display();
  }

  // Initialize pins
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // Pump OFF by default

  // Initialize DHT sensor
  dht.begin();

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  
  display.clearDisplay();
  display.setCursor(0, 20);
  display.println("Connecting WiFi...");
  display.display();

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected!");
  Serial.print("   IP Address: ");
  Serial.println(WiFi.localIP());

  // Configure Firebase
  config.api_key = FIREBASE_API_KEY;
  config.database_url = FIREBASE_HOST;

  auth.user.email = "";
  auth.user.password = "";
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("✅ Firebase Connected!\n");

  // Show connected status on OLED
  display.clearDisplay();
  display.setCursor(0, 10);
  display.println("WiFi: Connected!");
  display.setCursor(0, 30);
  display.println("Firebase: Ready!");
  display.setCursor(0, 50);
  display.println("Reading sensors...");
  display.display();
  delay(2000);
}

// ===== MAIN LOOP =====
void loop() {
  checkMotorControl();

  if (millis() - lastSendTime >= SEND_INTERVAL) {
    sendSensorData();
    lastSendTime = millis();
  }

  delay(100);
}

// ===== SEND SENSOR DATA TO FIREBASE =====
void sendSensorData() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  int soilRaw = analogRead(SOIL_PIN);
  int soilMoisture = map(soilRaw, SOIL_DRY, SOIL_WET, 0, 100);
  soilMoisture = constrain(soilMoisture, 0, 100);

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("❌ Failed to read from DHT sensor!");
    display.clearDisplay();
    display.setCursor(0, 25);
    display.println("DHT11 ERROR!");
    display.display();
    return;
  }

  // Print to Serial Monitor
  Serial.println("--- Sensor Readings ---");
  Serial.printf("  Temperature: %.1f C\n", temperature);
  Serial.printf("  Humidity: %.1f%%\n", humidity);
  Serial.printf("  Soil Moisture: %d%% (raw: %d)\n", soilMoisture, soilRaw);

  // ===== UPDATE OLED DISPLAY =====
  display.clearDisplay();

  // Title
  display.setTextSize(1);
  display.setCursor(25, 0);
  display.println("-- FARM CAP --");

  // Temperature
  display.setCursor(0, 16);
  display.print("Temp:  ");
  display.print(temperature, 1);
  display.println(" C");

  // Humidity
  display.setCursor(0, 28);
  display.print("Humid: ");
  display.print(humidity, 1);
  display.println(" %");

  // Soil Moisture
  display.setCursor(0, 40);
  display.print("Soil:  ");
  display.print(soilMoisture);
  display.println(" %");

  // Motor Status
  display.setCursor(0, 54);
  display.print("Pump:  ");
  display.println(motorState ? "ON" : "OFF");

  display.display();

  // Send to Firebase
  FirebaseJson json;
  json.set("temperature", temperature);
  json.set("humidity", humidity);
  json.set("soilMoisture", soilMoisture);
  json.set("timestamp", (unsigned long)millis());

  if (Firebase.RTDB.setJSON(&fbdo, "/sensor_data", &json)) {
    Serial.println("  ✅ Data sent to Firebase!\n");
  } else {
    Serial.print("  ❌ Firebase Error: ");
    Serial.println(fbdo.errorReason());
  }
}

// ===== CHECK MOTOR CONTROL FROM FIREBASE =====
void checkMotorControl() {
  if (Firebase.RTDB.getJSON(&fbdo, "/controls/motor")) {
    FirebaseJson &json = fbdo.jsonData();
    FirebaseJsonData result;

    json.get(result, "state");
    bool newMotorState = result.boolValue;

    motorState = newMotorState;

    if (motorState) {
      digitalWrite(RELAY_PIN, HIGH);
    } else {
      digitalWrite(RELAY_PIN, LOW);
    }
  }
}

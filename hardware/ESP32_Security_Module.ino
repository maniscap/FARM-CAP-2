/*
 * ============================================
 *  FARM CAP 2 — ESP32-CAM SECURITY MODULE
 *  Captures: Photo when PIR detects motion
 *  Uploads: Image to Cloudinary
 *  Triggers: Vercel AI Security Analysis
 * ============================================
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "soc/soc.h"           // Disable brownout problems
#include "soc/rtc_cntl_reg.h"  // Disable brownout problems

// ================= SECRETS =================
const char* ssid = "123456789";
const char* password = "123456789";

// Cloudinary Settings (From your Dashboard)
const char* cloudinaryUrl = "https://api.cloudinary.com/v1_1/peegorfu/image/upload";
const char* uploadPreset = "esp32cam"; // MUST BE AN UNSIGNED PRESET

// Vercel AI Backend
const char* vercelApiUrl = "https://farm-cap-2.vercel.app/api/analyze-security";

// ================= HARDWARE PINS =================
#define PIR_PIN    13
#define BUZZER_PIN 14

// AI Thinker Camera Pins
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// ================= TIMERS =================
unsigned long lastCaptureTime = 0;
const unsigned long COOLDOWN_MS = 15000; // Wait 15s between photos

// ===== SETUP =====
void setup() {
  // DISABLE BROWNOUT DETECTOR (Safety override for weak power)
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); 

  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println("\n\n================================");
  Serial.println("  FARM CAP 2 - Security Module");
  Serial.println("================================\n");

  pinMode(PIR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // Initialize Camera with extreme power-saving settings
  camera_config_t cameraConfig;
  cameraConfig.ledc_channel = LEDC_CHANNEL_0;
  cameraConfig.ledc_timer = LEDC_TIMER_0;
  cameraConfig.pin_d0 = Y2_GPIO_NUM;
  cameraConfig.pin_d1 = Y3_GPIO_NUM;
  cameraConfig.pin_d2 = Y4_GPIO_NUM;
  cameraConfig.pin_d3 = Y5_GPIO_NUM;
  cameraConfig.pin_d4 = Y6_GPIO_NUM;
  cameraConfig.pin_d5 = Y7_GPIO_NUM;
  cameraConfig.pin_d6 = Y8_GPIO_NUM;
  cameraConfig.pin_d7 = Y9_GPIO_NUM;
  cameraConfig.pin_xclk = XCLK_GPIO_NUM;
  cameraConfig.pin_pclk = PCLK_GPIO_NUM;
  cameraConfig.pin_vsync = VSYNC_GPIO_NUM;
  cameraConfig.pin_href = HREF_GPIO_NUM;
  cameraConfig.pin_sccb_sda = SIOD_GPIO_NUM;
  cameraConfig.pin_sccb_scl = SIOC_GPIO_NUM;
  cameraConfig.pin_pwdn = PWDN_GPIO_NUM;
  cameraConfig.pin_reset = RESET_GPIO_NUM;
  cameraConfig.xclk_freq_hz = 5000000; // 5MHz Ultra-low clock speed to save power
  cameraConfig.pixel_format = PIXFORMAT_JPEG;
  cameraConfig.grab_mode = CAMERA_GRAB_WHEN_EMPTY; // Required for Core 3.x

  // Print Memory Diagnostics
  Serial.printf("\n--- MEMORY DIAGNOSTICS ---\n");
  Serial.printf("PSRAM Found : %s\n", psramFound() ? "YES" : "NO");
  Serial.printf("PSRAM Size  : %u bytes\n", ESP.getPsramSize());
  Serial.printf("Free Heap   : %u bytes\n", ESP.getFreeHeap());
  Serial.printf("--------------------------\n");

  if (psramFound()) {
    Serial.println("✅ PSRAM detected - using high memory mode");
    cameraConfig.frame_size = FRAMESIZE_VGA;
    cameraConfig.jpeg_quality = 12;
    cameraConfig.fb_count = 2;
    cameraConfig.fb_location = CAMERA_FB_IN_PSRAM;
  } else {
    Serial.println("⚠️ No PSRAM detected - using QQVGA ultra-low memory mode");
    cameraConfig.frame_size = FRAMESIZE_QQVGA;
    cameraConfig.jpeg_quality = 20;
    cameraConfig.fb_count = 1;
    cameraConfig.fb_location = CAMERA_FB_IN_DRAM; // CRITICAL for Core 3.x!
  }

  esp_err_t err = esp_camera_init(&cameraConfig);
  if (err != ESP_OK) {
    Serial.printf("❌ Camera init failed with error 0x%x\n", err);
    return;
  }
  Serial.println("✅ Camera initialized perfectly!");

  // Connect to WiFi
  Serial.print("📡 Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected!");
  Serial.print("   IP Address: ");
  Serial.println(WiFi.localIP());

  // Allow PIR sensor to stabilize (takes about 30 seconds)
  Serial.println("⏳ Waiting for PIR sensor to stabilize (30s)...");
  delay(30000);
  Serial.println("✅ Security Module READY!\n");
}

// ===== MAIN LOOP =====
void loop() {
  int pirValue = digitalRead(PIR_PIN);

  // If motion is detected AND 15 seconds have passed since the last photo
  if (pirValue == HIGH && (millis() - lastCaptureTime > COOLDOWN_MS)) {
    Serial.println("🚨 MOTION DETECTED! SOUNDING ALARM!");
    lastCaptureTime = millis();

    // Sound the buzzer (3 quick beeps)
    for(int i=0; i<3; i++) {
      digitalWrite(BUZZER_PIN, HIGH);
      delay(200);
      digitalWrite(BUZZER_PIN, LOW);
      delay(100);
    }

    // Step 1: Capture photo
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("❌ Camera capture failed!");
      return;
    }

    // Step 2: Upload to Cloudinary
    String imageUrl = uploadToCloudinary(fb);
    esp_camera_fb_return(fb); // Free memory immediately

    // Step 3: Trigger AI Analysis
    if (imageUrl != "") {
      triggerAiAnalysis(imageUrl);
    }
  }
}

// ===== HELPER: UPLOAD TO CLOUDINARY =====
String uploadToCloudinary(camera_fb_t *fb) {
  Serial.println("☁️ Uploading to Cloudinary...");
  HTTPClient http;
  http.begin(cloudinaryUrl);
  
  String boundary = "----ESP32Boundary";
  String contentType = "multipart/form-data; boundary=" + boundary;
  http.addHeader("Content-Type", contentType);

  String head = "--" + boundary + "\r\n"
              + "Content-Disposition: form-data; name=\"file\"; filename=\"image.jpg\"\r\n"
              + "Content-Type: image/jpeg\r\n\r\n";
              
  String tail = "\r\n--" + boundary + "\r\n"
              + "Content-Disposition: form-data; name=\"upload_preset\"\r\n\r\n"
              + uploadPreset + "\r\n"
              + "--" + boundary + "--\r\n";

  uint32_t totalLength = head.length() + fb->len + tail.length();
  
  uint8_t *body = (uint8_t *)malloc(totalLength);
  if (!body) {
    Serial.println("❌ Malloc failed for Cloudinary upload!");
    return "";
  }
  
  memcpy(body, head.c_str(), head.length());
  memcpy(body + head.length(), fb->buf, fb->len);
  memcpy(body + head.length() + fb->len, tail.c_str(), tail.length());

  int httpResponseCode = http.POST(body, totalLength);
  free(body);

  String imageUrl = "";
  if (httpResponseCode == 200) {
    String response = http.getString();
    
    // Parse JSON to get the secure_url
    StaticJsonDocument<1024> doc;
    DeserializationError error = deserializeJson(doc, response);
    if (!error) {
      imageUrl = doc["secure_url"].as<String>();
      Serial.println("✅ Upload successful! URL: " + imageUrl);
    }
  } else {
    Serial.printf("❌ Cloudinary upload failed: %d\n", httpResponseCode);
  }

  http.end();
  return imageUrl;
}

// ===== HELPER: TRIGGER VERCEL AI =====
void triggerAiAnalysis(String imageUrl) {
  Serial.println("🧠 Sending image to Vercel AI for threat analysis...");
  HTTPClient http;
  http.begin(vercelApiUrl);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"imageUrl\":\"" + imageUrl + "\"}";
  int httpResponseCode = http.POST(payload);

  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.println("✅ AI Analysis Response:");
    Serial.println(response);
  } else {
    Serial.printf("❌ Vercel API error: %d\n", httpResponseCode);
    Serial.println("Response: " + http.getString());
  }

  http.end();
}

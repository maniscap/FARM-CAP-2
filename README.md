<div align="center">

<img src="./public/snowfall_clean_v1.gif" width="100%" alt="Clean Snowfall Banner" />


# FARMCAP 2 — SMART AGRITECH & IOT ECOSYSTEM
### *AI-Powered Farm Intelligence • Real-Time IoT Telemetry • GPS Land Surveyor • Live CCTV*

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI_Advisor-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Leaflet](https://img.shields.io/badge/GPS_Maps-Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![License](https://img.shields.io/badge/License-MIT-00E676?style=for-the-badge)](LICENSE)

<br/>

<p align="center">
  <a href="#-system-architecture"><b>Architecture</b></a> •
  <a href="#-core-modules"><b>Core Modules</b></a> •
  <a href="#-iot-sensors--security"><b>IoT & Security</b></a> •
  <a href="#-quick-start"><b>Quick Start</b></a> •
  <a href="#-project-structure"><b>Structure</b></a>
</p>

---

</div>

## 📡 Overview
**FarmCap 2** is an all-in-one Smart Agriculture & IoT Management Platform engineered to modernize precision farming for rural agriculturists. 

By combining **ESP32 IoT sensor telemetry**, **Google Gemini AI agronomy advisory**, **sub-meter GPS perimeter land surveying**, **live HLS camera surveillance**, and **real-time Mandi market rates**, FarmCap 2 equips farmers with actionable data to maximize crop yields and cut operational expenditures.

---

## 🏗️ System Architecture
```mermaid
flowchart TD
    classDef iot fill:#14532d,stroke:#22c55e,stroke-width:2px,color:#fff;
    classDef ai fill:#1e1b4b,stroke:#8b5cf6,stroke-width:2px,color:#fff;
    classDef client fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff;
    classDef cloud fill:#451a03,stroke:#f59e0b,stroke-width:2px,color:#fff;

    subgraph FarmSensors["📡 Farm IoT Hardware & Cameras"]
        ESP32["🌡️ ESP32 Sensor Hub (Moisture, Temp, Humidity)"]:::iot
        CCTV["📹 Live HLS Video Stream (Farm Security)"]:::iot
        GPSNode["📍 GPS Geolocation Satellite Stream"]:::iot
    end

    subgraph BackendCloud["☁️ Cloud Data & AI Engine"]
        Firebase["Cloud Firestore & Realtime DB"]:::cloud
        Gemini["Google Gemini 2.5 Agritech Model"]:::ai
        MandiAPI["💰 National Mandi Market Rate Index"]:::cloud
        WeatherAPI["Live Doppler Weather Radar"]:::cloud
    end

    subgraph Dashboard["🖥️ FarmCap 2 Central Command PWA"]
        SensorDash["Live Sensor Dashboard & Threshold Alerts"]:::client
        AIChat["AI Crop & Soil Doctor (AiBrain)"]:::ai
        GPSMeasure["GPS Field Boundary & Acreage Surveyor"]:::client
        MandiBoard["Real-Time Commodity Price Tracker"]:::client
        ExpensePDF["PDF Expense & Yield Report Generator"]:::client
        RadioStream["Rural Kisan Agricultural Radio Player"]:::client
    end

    ESP32 --> Firebase --> SensorDash
    CCTV --> SensorDash
    GPSNode --> GPSMeasure
    AIChat <--> Gemini
    Dashboard <--> MandiAPI & WeatherAPI
    Dashboard --> ExpensePDF
```

---

## 🧩 Core Innovation & Capabilities
<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🌡️ IoT Sensor Dashboard & Alerts</h3>
      <ul>
        <li><b>Telemetry:</b> Real-time soil moisture percentage, ambient temperature, humidity levels, and irrigation valve state.</li>
        <li><b>Threshold Triggers:</b> Automated push notifications when soil dries below optimal moisture levels.</li>
        <li><b>Wiring Diagrams:</b> Interactive schematics and sensor pinout references for field deployment.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🤖 Gemini Agronomy Doctor</h3>
      <ul>
        <li><b>Plant Pathology Analysis:</b> Instant diagnosis of leaf pests, fungi, and nutrient deficiencies.</li>
        <li><b>Localized Care Plans:</b> Organic and chemical treatment schedules tailored to regional climates.</li>
        <li><b>Offline Fallback:</b> IndexedDB caching guarantees access to essential guides without connectivity.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🗺️ GPS Land & Acreage Surveyor</h3>
      <ul>
        <li><b>Polygon Field Mapping:</b> Walk your farm boundary to calculate exact acreage, hectares, and perimeter.</li>
        <li><b>High-Precision Polygon Rendering:</b> Powered by Leaflet Maps and Turf.js geometry calculations.</li>
        <li><b>Fence Planning:</b> Estimates required fencing wire and irrigation pipe lengths.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>Mandi Rates & Financial Reports</h3>
      <ul>
        <li><b>Live Market Index:</b> Real-time pricing for wheat, paddy, cotton, pulses, and vegetables across state mandis.</li>
        <li><b>Expense Ledger:</b> Track seed, fertilizer, fuel, and labor expenditures per crop cycle.</li>
        <li><b>1-Click PDF Export:</b> Generate balance sheets with <code>jspdf</code> and <code>html2canvas</code>.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🚀 Quick Start Guide
### ⚙️ Prerequisites
* **Node.js** `v18+` & **npm**

```bash
# 1. Clone the repository
git clone https://github.com/Tharun8994/FARM-CAP-2.git
cd FARM-CAP-2

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open **`http://localhost:5173`** in your browser to launch the farm dashboard!

---

## 📂 Repository Structure
```
FARM-CAP-2/
+-- public/                     # Static assets & PWA manifest
+-- src/
¦   +-- components/
¦   ¦   +-- BottomNav.jsx       # Mobile bottom navigation bar
¦   ¦   +-- ChatBot.jsx         # Gemini AI Farm Assistant interface
¦   ¦   +-- CropExpenses.jsx    # Crop expenditure ledger & balance sheet
¦   ¦   +-- FarmSecurityCard.jsx# Live HLS video surveillance viewer
¦   ¦   +-- GPSMeasurement.jsx  # GPS field boundary surveyor & acreage calculator
¦   ¦   +-- MarketRates.jsx     # State-wise Mandi market pricing board
¦   ¦   +-- Radio.jsx           # Agricultural Kisan radio player
¦   ¦   +-- SensorDashboard.jsx # Real-time IoT sensor telemetry & graphs
¦   ¦   +-- Weather.jsx         # ? Doppler weather forecasts & rain alerts
¦   +-- services/
¦   ¦   +-- AiBrain.js          # Gemini API integration & prompt engine
¦   ¦   +-- idb.js              # IndexedDB offline caching service
¦   ¦   +-- PushNotifications.js# Real-time browser push notifications
¦   +-- firebase.js             # Cloud Firestore initialization
¦   +-- App.jsx                 # Root component & state management
¦   +-- index.css               # Tailwind CSS v4 design tokens
+-- index.html
+-- package.json
+-- vite.config.js
```

---

---

<div align="center">
  <sub>Precision agritech IoT sensor telemetry & AI agronomy advisory. MIT Licensed.</sub>
</div>

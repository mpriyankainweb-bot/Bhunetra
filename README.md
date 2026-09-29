# BhuNetra (भू-नेत्र)
### AI-Augmented Geospatial Intelligence for Watershed Development
**Smart India Hackathon 2026 — Problem Statement ID: 26015**  
*Organization: Ministry of Rural Development — Department of Land Resources (DoLR)*  
*Theme: Agriculture, FoodTech & Rural Development | Category: Software*

---

## 🛰️ Executive Overview
BhuNetra is an AI-augmented geospatial analytics platform that sits alongside ISRO's **SRISHTI-DRISHTI** platform. It bridges the critical audit gap in watershed management by fusing:
1. **Geo-Tagged Field Photographs** (EXIF GPS tagged check dams, farm ponds, plantations, contour trenches from MGNREGA/WDC-PMKSY works).
2. **Sentinel-2 & Landsat Multi-Spectral Satellite Time-Series** (10m–30m monthly median composites across 24 months).

It computes an explainable **0–100 Watershed Health Score** per site and flags **Evidence Mismatches** when claimed ground photos contradict satellite-derived vegetation (`NDVI`) or surface water (`NDWI`) indices.

---

## 🏛️ End-to-End 3-Layer Technical Architecture

```
[ INPUT LAYER ]
  ├── Geo-tagged Field Photos (EXIF GPS, hardware camera tags)
  ├── SRISHTI-DRISHTI 30m Satellite Data
  ├── Sentinel-2 (10m) / Landsat / Bhuvan Multispectral Tiles
  └── Watershed MIS Records (Sanctioned dates, budgets, target outcomes)
         │
[ PROCESSING LAYER ]
  ├── EXIF Validation & Geometric Spatial Boundary Snapping
  ├── EfficientNet-B0 CNN Transfer Learning (5 structure classes)
  ├── Grad-CAM Visual Explainability Heatmaps
  ├── Sentinel-2 NDVI & NDWI Time-Series Change Detection
  ├── Isolation Forest Anomaly Detection Engine
  └── Composite Watershed Health Score Formula Engine
         │
[ OUTPUT LAYER ]
  ├── Interactive Full-Height GIS Dashboard (Leaflet + multi-layer toggles)
  ├── Audit Mismatch Center with Field Assignment Workflow
  ├── Dynamic Score Calibration Engine (Terrain presets & weight sliders)
  ├── Offline-First Field Capture PWA (IndexedDB + Background Sync)
  ├── Citizen Public Transparency Portal
  └── REST API & Automated PDF Health Reports for SRISHTI-DRISHTI
```

---

## 🧮 Core Scoring & Mismatch Formula

### Composite Watershed Health Score
$$\text{Score} = w_1 \cdot \text{NDVI}_{\text{gain}} + w_2 \cdot \text{NDWI}_{\text{presence}} + w_3 \cdot \text{Structure}_{\text{evidence}} + w_4 \cdot \text{Consistency}_{\text{factor}}$$

Normalized to **0–100**, where weights are dynamically configurable per terrain preset:
- **Semi-Arid Basin**: $w_1=0.30, w_2=0.35, w_3=0.20, w_4=0.15$
- **Hilly Ridge / Escarpment**: $w_1=0.40, w_2=0.20, w_3=0.25, w_4=0.15$
- **Coastal & Delta Alluvial**: $w_1=0.25, w_2=0.40, w_3=0.15, w_4=0.20$

### Remote Sensing Indices
- **NDVI** (Normalized Difference Vegetation Index): $\frac{B8 - B4}{B8 + B4}$
- **NDWI** (McFeeters Water Index): $\frac{B3 - B8}{B3 + B8}$
- **Change Detection**: Pre-intervention baseline window vs. post-work window (last 3–6 months).

### Mismatch Rules
1. **Vegetation Deficit Anomaly**: Photo claims plantation/afforestation, but $\Delta \text{NDVI} < 0.08$.
2. **Hydrological Discrepancy**: Photo claims farm pond or check dam reservoir, but post-work $\text{NDWI} < -0.15$.
3. **Spatial Deviation**: EXIF GPS coordinates locate $>100\text{m}$ outside the micro-watershed treatment boundary.
4. **Spectral Outlier**: scikit-learn `IsolationForest` decision function $< -0.5$ flagging abnormal reflectance curves.

---

## 💻 Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Leaflet GIS, Recharts, Motion, lucide-react.
- **Backend**: Python FastAPI, SQLAlchemy, PostgreSQL + PostGIS (with SQLite lat/lon fallback).
- **Full-Stack Runtime**: Express.js dev-server middleware mounting Vite on Port 3000.
- **Machine Learning**: PyTorch EfficientNet-B0 (5 classes), Grad-CAM, scikit-learn IsolationForest.
- **Mobile / PWA**: Service Worker caching, Web App Manifest, IndexedDB offline sync queue.

---

## 🚀 One-Command Launch

### Option 1: Docker Compose (Full Stack + PostGIS)
```bash
docker-compose up --build
```
- Web Application: `http://localhost:3000`
- FastAPI Backend: `http://localhost:8000`
- API Interactive Swagger Docs: `http://localhost:8000/docs`

### Option 2: Local Development Run
```bash
npm install
npm run dev
```

### Option 3: Run Unit Tests
```bash
pytest ml/tests/test_score.py -v
```

---

## 🎯 Recommended Demonstration Flow
1. **Landing Page**: View the 4 core modules and animated 3-layer technical architecture diagram.
2. **GIS Dashboard**: Filter by *Kannad* or *Paithan* watersheds, toggle NDVI / NDWI / Structure layers, click any score marker.
3. **Site Detail Drawer**: Open flagged site `SITE-MH-CSN-004` (Hatnoor Plantation) to see the photo vs. Sentinel-2 negative NDVI mismatch explained with Grad-CAM heatmaps.
4. **Score Engine**: Select "Hilly Escarpment" terrain preset, tune $w_1$ slider, and click "Recompute All Scores" to see live recalculation.
5. **Upload & Classify**: Drop a photo to run the 4-stage pipeline (EXIF GPS validation, CNN classification, boundary snap, Grad-CAM). Test the rejection guardrail with a photo lacking GPS!
6. **Mismatch Center**: Inspect the 6 audit flags, filter by Critical severity, and assign an officer.
7. **PWA Field Capture**: Switch to mobile touch view, test offline capture, multilingual mode (English, Hindi, Telugu, Marathi), and sync the queue.
8. **Public Transparency Portal**: Search for village *Balegaon* to view citizen-safe verified progress metrics.
9. **Reports**: Preview the comprehensive watershed audit report and download the generated PDF.
10. **SRISHTI-DRISHTI Integration**: Review the live REST API contract and ping the test gateway.

---
*Developed for Smart India Hackathon 2026. Production integrates with the SRISHTI-DRISHTI 30m feed, Sentinel-2, and Bhuvan.*

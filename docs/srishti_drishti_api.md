# BhuNetra & ISRO SRISHTI-DRISHTI API Integration Specification
**Smart India Hackathon 2026 — Problem Statement 26015**  
*Department of Land Resources (DoLR), Ministry of Rural Development*

## Architectural Overview
BhuNetra is architected as an **AI-augmented analytical sidecar** to ISRO's SRISHTI-DRISHTI watershed monitoring platform. Rather than duplicating existing 30m satellite data infrastructure or MGNREGA field photo archives, BhuNetra connects via high-throughput REST APIs to ingest telemetry, run explainable cross-validation, and push back a **Watershed Health Index (0-100)** with **Evidence Mismatch Flags**.

---

### Endpoint 1: Ingest Geo-Tagged Field Photos from DRISHTI Mobile App
- **Method**: `POST /api/v1/srishti/photo-stream`
- **Authentication**: `Bearer <NRSC_JWT_TOKEN>`
- **Request Payload**:
```json
{
  "work_id": "MGNREGA-MH-2024-10293",
  "drishti_asset_id": "AST-77401-2024",
  "exif_metadata": {
    "latitude": 19.512014,
    "longitude": 75.298028,
    "altitude_m": 470.2,
    "timestamp_utc": "2024-07-28T09:14:22Z",
    "device_imei_hash": "sha256:4a8b...1f09"
  },
  "claimed_structure": "check_dam",
  "photo_base64_jpeg": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

### Response Payload:
```json
{
  "status": "PROCESSED",
  "ai_classification": {
    "predicted": "check_dam",
    "confidence": 0.962,
    "gradcam_attention_map_url": "/api/v1/gradcam/AST-77401.png"
  },
  "watershed_alignment": {
    "micro_watershed_id": "W-MH-CSN-01",
    "within_boundary": true,
    "snap_distance_meters": 3.8
  },
  "temporal_audit": {
    "health_score": 92,
    "delta_ndvi": 0.23,
    "delta_ndwi": 0.40,
    "mismatch_detected": false
  }
}
```

---

### Endpoint 2: Export Composite Score to SRISHTI Web Geoportal
- **Method**: `GET /api/v1/srishti/watershed-health/{watershed_id}`
- **Authentication**: `Bearer <NRSC_JWT_TOKEN>`
- **Response**:
```json
{
  "watershed_code": "43A-PAITHAN-WEST",
  "evaluation_cycle": "2024-2026",
  "score_composite_avg": 88.4,
  "vegetation_gain_pct": 24.8,
  "water_retention_m3": 48200,
  "flagged_sites_count": 1,
  "audit_status": "FLAGGED_FOR_INSPECTION"
}
```

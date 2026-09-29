"""
Unit Tests for BhuNetra Score Function and Mismatch Detection Rules
"""
import pytest

def compute_watershed_score(delta_ndvi, post_ndwi, structure_conf, consistency_raw, weights):
    """
    Score = w1*NDVI_gain + w2*NDWI_presence + w3*Structure_evidence + w4*Consistency_factor
    Normalized to 0-100 scale.
    """
    norm_ndvi = max(0, min(100, round(((delta_ndvi + 0.1) / 0.45) * 100)))
    norm_ndwi = max(0, min(100, round(((post_ndwi + 0.3) / 0.65) * 100)))
    norm_structure = max(0, min(100, round(structure_conf * 100)))
    norm_consistency = max(0, min(100, round(consistency_raw * 100)))

    composite = round(
        weights["w1_ndvi"] * norm_ndvi +
        weights["w2_ndwi"] * norm_ndwi +
        weights["w3_structure"] * norm_structure +
        weights["w4_consistency"] * norm_consistency
    )
    return max(0, min(100, composite))

def evaluate_mismatch(structure_type, delta_ndvi, post_ndwi, anomaly_score):
    """
    Mismatch rules:
    - Plantation claimed, but NDVI gain < 0.08 -> Vegetation Deficit Anomaly
    - Farm pond or check dam claimed, but NDWI presence < -0.15 -> Hydrological Discrepancy
    - Isolation Forest anomaly score < -0.5 -> Spectral Outlier
    """
    flags = []
    if structure_type == "plantation" and delta_ndvi < 0.08:
        flags.append({
            "severity": "critical",
            "reason": "Vegetation Deficit Anomaly: Claimed plantation lacks positive NDVI gain."
        })
    
    if structure_type in ["farm_pond", "check_dam"] and post_ndwi < -0.15:
        flags.append({
            "severity": "critical" if post_ndwi < -0.3 else "high",
            "reason": "Hydrological Discrepancy: Water conservation work shows negative NDWI presence."
        })
    
    if anomaly_score < -0.6:
        flags.append({
            "severity": "high",
            "reason": "Spectral Anomaly Detected: Abnormal divergence in seasonal reflectance curve."
        })

    return flags

# Tests
def test_score_calculation_healthy_site():
    weights = {"w1_ndvi": 0.30, "w2_ndwi": 0.35, "w3_structure": 0.20, "w4_consistency": 0.15}
    score = compute_watershed_score(
        delta_ndvi=0.25,
        post_ndwi=0.15,
        structure_conf=0.95,
        consistency_raw=0.90,
        weights=weights
    )
    assert 85 <= score <= 100
    assert isinstance(score, int)

def test_score_calculation_failing_site():
    weights = {"w1_ndvi": 0.30, "w2_ndwi": 0.35, "w3_structure": 0.20, "w4_consistency": 0.15}
    score = compute_watershed_score(
        delta_ndvi=-0.05,
        post_ndwi=-0.35,
        structure_conf=0.75,
        consistency_raw=0.20,
        weights=weights
    )
    assert score <= 40

def test_mismatch_rule_plantation_deficit():
    mismatches = evaluate_mismatch(
        structure_type="plantation",
        delta_ndvi=-0.02, # Negative NDVI despite claimed plantation
        post_ndwi=-0.30,
        anomaly_score=-0.75
    )
    assert len(mismatches) >= 1
    assert mismatches[0]["severity"] == "critical"
    assert "Vegetation Deficit" in mismatches[0]["reason"]

def test_mismatch_rule_dry_farm_pond():
    mismatches = evaluate_mismatch(
        structure_type="farm_pond",
        delta_ndvi=0.02,
        post_ndwi=-0.35, # Negative NDWI despite claimed filled pond
        anomaly_score=-0.70
    )
    assert len(mismatches) >= 1
    assert mismatches[0]["severity"] == "critical"
    assert "Hydrological Discrepancy" in mismatches[0]["reason"]

def test_verified_site_has_no_mismatches():
    mismatches = evaluate_mismatch(
        structure_type="check_dam",
        delta_ndvi=0.22,
        post_ndwi=0.18,
        anomaly_score=0.45
    )
    assert len(mismatches) == 0

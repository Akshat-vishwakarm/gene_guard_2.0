"""
GeneGuard Independent Prediction Service
-----------------------------------------
Loads trained model artifacts, executes inference for each disease module independently,
computes SHAP feature importance for explainable models (Cardiovascular), and returns
calibrated confidence metrics with strict safety disclaimers.
"""

import os
import joblib
import pickle
import pandas as pd
import numpy as np
try:
    import shap
    HAS_SHAP = True
except (ImportError, Exception):
    shap = None
    HAS_SHAP = False

from .model_registry import MODEL_REGISTRY
from .feature_mapper import validate_and_map_features


class PredictionService:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.thresholds = {}
        self.explainers = {}
        self.preprocessors = {}
        self.feature_names = {}
        self._load_all_models()

    def _load_single_model(self, disease_module: str):
        """Loads a single model on demand with deployment-safe error handling."""
        if disease_module not in MODEL_REGISTRY:
            return

        conf = MODEL_REGISTRY[disease_module]
        mf = conf.get("model_file")

        if disease_module == "cardiovascular":
            tf = conf.get("threshold_file")
            if mf and os.path.exists(mf) and tf and os.path.exists(tf):
                try:
                    c_model = joblib.load(mf)
                    c_thresh = float(joblib.load(tf))
                    self.models["cardiovascular"] = c_model
                    self.thresholds["cardiovascular"] = c_thresh
                    if HAS_SHAP and shap is not None:
                        try:
                            preproc = c_model.named_steps["preprocessor"]
                            rf_clf = c_model.named_steps["classifier"]
                            self.preprocessors["cardiovascular"] = preproc
                            self.feature_names["cardiovascular"] = preproc.get_feature_names_out()
                            self.explainers["cardiovascular"] = shap.TreeExplainer(rf_clf)
                        except Exception as e:
                            print(f"[GeneGuard] SHAP init warning for Cardiovascular: {e}")
                    print(f"[GeneGuard] Loaded Cardiovascular model (Threshold: {c_thresh}).")
                except Exception as ex:
                    print(f"[GeneGuard] Error loading Cardiovascular model from {mf}: {ex}")
            else:
                print(f"[GeneGuard] Cardiovascular artifact not found. Searched: {mf}")

        elif disease_module == "metabolic":
            sf = conf.get("scaler_file")
            if mf and os.path.exists(mf) and sf and os.path.exists(sf):
                try:
                    self.models["metabolic"] = joblib.load(mf)
                    self.scalers["metabolic"] = joblib.load(sf)
                    print("[GeneGuard] Loaded Metabolic model and StandardScaler.")
                except Exception as ex:
                    print(f"[GeneGuard] Error loading Metabolic model from {mf}: {ex}")
            else:
                print(f"[GeneGuard] Metabolic artifact not found. Searched: {mf}")

        elif disease_module == "blood_pressure":
            if mf and os.path.exists(mf):
                try:
                    self.models["blood_pressure"] = joblib.load(mf)
                    print("[GeneGuard] Loaded Blood Pressure model pipeline.")
                except Exception as ex:
                    print(f"[GeneGuard] Error loading Blood Pressure model from {mf}: {ex}")
            else:
                print(f"[GeneGuard] Blood Pressure artifact not found. Searched: {mf}")

        elif disease_module == "thyroid":
            if mf and os.path.exists(mf):
                try:
                    with open(mf, "rb") as f:
                        self.models["thyroid"] = pickle.load(f)
                    print("[GeneGuard] Loaded Thyroid model.")
                except Exception as ex:
                    print(f"[GeneGuard] Error loading Thyroid model from {mf}: {ex}")
            else:
                print(f"[GeneGuard] Thyroid artifact not found. Searched: {mf}")

        elif disease_module == "cancer":
            if mf and os.path.exists(mf):
                try:
                    payload = joblib.load(mf)
                    if isinstance(payload, dict) and "model" in payload:
                        self.models["cancer"] = payload["model"]
                    else:
                        self.models["cancer"] = payload
                    print("[GeneGuard] Loaded Cancer model.")
                except Exception as ex:
                    print(f"[GeneGuard] Error loading Cancer model from {mf}: {ex}")
            else:
                print(f"[GeneGuard] Cancer artifact not found. Searched: {mf}")

    def _load_all_models(self):
        print("[GeneGuard] Initializing Prediction Service and loading models...")
        for mod in ["cardiovascular", "metabolic", "blood_pressure", "thyroid", "cancer"]:
            self._load_single_model(mod)

    def predict_disease(self, disease_module: str, input_dict: dict) -> dict:
        """Runs prediction for a single disease module."""
        if disease_module not in MODEL_REGISTRY:
            return {
                "available": False,
                "error": f"Unknown disease module: {disease_module}"
            }

        config = MODEL_REGISTRY[disease_module]
        if disease_module not in self.models:
            # Try on-demand lazy load
            self._load_single_model(disease_module)

        if disease_module not in self.models:
            searched_path = config.get("model_file", "unknown")
            return {
                "available": False,
                "reason": f"Model artifact for '{disease_module}' not found on server (Searched: {searched_path}).",
                "missing_fields": []
            }

        # 1. Validation & Feature Mapping
        try:
            df_features, missing_fields = validate_and_map_features(disease_module, input_dict)
        except Exception as e:
            return {
                "available": False,
                "status": "insufficient_data",
                "probability": None,
                "risk_percentage": None,
                "reason": str(e),
                "missing_fields": [],
                "missingFeatures": []
            }

        if missing_fields:
            return {
                "available": False,
                "status": "insufficient_data",
                "probability": None,
                "risk_percentage": None,
                "reason": "Required information is missing.",
                "missing_fields": missing_fields,
                "missingFeatures": missing_fields
            }

        model = self.models[disease_module]

        # 2. Prediction Pipeline execution by module type
        try:
            if disease_module == "cardiovascular":
                prob = float(model.predict_proba(df_features)[0][1])
                thresh = self.thresholds.get("cardiovascular", 0.35)
                prediction_code = int(prob >= thresh)
                prediction_label = config["target_classes"][prediction_code]

                # SHAP Explainability
                explanation = []
                if "cardiovascular" in self.explainers and "cardiovascular" in self.preprocessors:
                    try:
                        trans = self.preprocessors["cardiovascular"].transform(df_features)
                        sv = self.explainers["cardiovascular"].shap_values(trans)
                        if isinstance(sv, list):
                            cvd_sv = sv[1][0]
                        elif len(sv.shape) == 3:
                            cvd_sv = sv[0, :, 1]
                        else:
                            cvd_sv = sv[0]

                        readable_map = {
                            "num__age_years": "Age",
                            "num__height": "Height",
                            "num__weight": "Weight",
                            "num__ap_hi": "Systolic Blood Pressure",
                            "num__ap_lo": "Diastolic Blood Pressure",
                            "num__bmi": "Body Mass Index (BMI)",
                            "num__pulse_pressure": "Pulse Pressure",
                            "num__bp_ratio": "Blood Pressure Ratio",
                            "cat__cholesterol_1": "Normal Cholesterol",
                            "cat__cholesterol_2": "Above Normal Cholesterol",
                            "cat__cholesterol_3": "High Cholesterol",
                            "cat__gluc_1": "Normal Glucose",
                            "cat__gluc_2": "Above Normal Glucose",
                            "cat__gluc_3": "High Glucose",
                            "cat__smoke_1": "Tobacco Smoking",
                            "cat__alco_1": "Alcohol Consumption",
                            "cat__active_0": "Inactive Lifestyle"
                        }

                        f_names = self.feature_names["cardiovascular"]
                        exp_df = pd.DataFrame({"feature": f_names, "shap": cvd_sv})
                        exp_df["abs_shap"] = exp_df["shap"].abs()
                        exp_df = exp_df.sort_values("abs_shap", ascending=False).head(5)

                        for _, r in exp_df.iterrows():
                            lbl = readable_map.get(r["feature"], r["feature"])
                            explanation.append({
                                "feature": lbl,
                                "impact": "Increases Risk" if r["shap"] > 0 else "Lowers Risk",
                                "shap_value": round(float(r["shap"]), 4)
                            })
                    except Exception as ex:
                        print(f"SHAP extraction error: {ex}")

                probs = model.predict_proba(df_features)[0]
                prob_class1 = float(probs[1])
                thresh = self.thresholds.get("cardiovascular", 0.35)
                prediction_code = int(prob_class1 >= thresh)
                prediction_label = config["target_classes"][prediction_code]
                risk_pct = round(prob_class1 * 100, 1)

                return {
                    "available": True,
                    "module": disease_module,
                    "title": config["name"],
                    "prediction": prediction_label,
                    "prediction_code": prediction_code,
                    "probability": round(prob_class1, 4),
                    "risk_percentage": risk_pct,
                    "threshold": thresh,
                    "contributing_inputs": explanation,
                    "disclaimer": "This result is a model-based prediction and is not a medical diagnosis."
                }

            elif disease_module == "metabolic":
                scaler = self.scalers["metabolic"]
                if hasattr(scaler, "feature_names_in_"):
                    df_features.columns = scaler.feature_names_in_
                scaled = scaler.transform(df_features)
                probs = model.predict_proba(scaled)[0]
                prob_active = float(probs[1])
                prediction_code = int(prob_active >= 0.5)
                prediction_label = config["target_classes"][prediction_code]
                risk_pct = round(prob_active * 100, 1)

                return {
                    "available": True,
                    "module": disease_module,
                    "title": config["name"],
                    "prediction": prediction_label,
                    "prediction_code": prediction_code,
                    "probability": round(prob_active, 4),
                    "risk_percentage": risk_pct,
                    "disclaimer": "This result is a model-based prediction and is not a medical diagnosis."
                }

            elif disease_module == "blood_pressure":
                probs = model.predict_proba(df_features)[0]
                prob_abnormal = float(probs[1])
                prediction_code = int(prob_abnormal >= 0.5)
                prediction_label = config["target_classes"][prediction_code]
                risk_pct = round(prob_abnormal * 100, 1)

                return {
                    "available": True,
                    "module": disease_module,
                    "title": config["name"],
                    "prediction": prediction_label,
                    "prediction_code": prediction_code,
                    "probability": round(prob_abnormal, 4),
                    "risk_percentage": risk_pct,
                    "disclaimer": "This result is a model-based prediction and is not a medical diagnosis."
                }

            elif disease_module == "thyroid":
                probs = model.predict_proba(df_features)[0]
                classes = [int(c) for c in model.classes_]
                prob_map = {str(c): round(float(p), 4) for c, p in zip(classes, probs)}
                prob_disorder = prob_map.get("0", 0.0)
                prob_normal = prob_map.get("1", 1.0)

                pred_code = int(model.predict(df_features)[0])
                prediction_label = config["target_classes"][pred_code]
                risk_pct = round(prob_disorder * 100, 1)

                return {
                    "available": True,
                    "module": disease_module,
                    "title": config["name"],
                    "prediction": prediction_label,
                    "prediction_code": pred_code,
                    "probability": round(prob_disorder, 4),
                    "disorder_probability": round(prob_disorder, 4),
                    "normal_probability": round(prob_normal, 4),
                    "probabilities": prob_map,
                    "risk_percentage": risk_pct,
                    "disclaimer": "This is a machine-learning-based health analysis and is not a medical diagnosis."
                }

            elif disease_module == "cancer":
                probs = model.predict_proba(df_features)[0]
                pred_code = int(np.argmax(probs))
                pred_label = config["target_classes"][pred_code]
                # Weight: Low=0.0, Medium=0.5, High=1.0
                risk_score = float(probs[1]) * 0.5 + float(probs[2]) * 1.0
                risk_pct = round(risk_score * 100, 1)

                return {
                    "available": True,
                    "module": disease_module,
                    "title": config["name"],
                    "prediction": f"Model Signal: {pred_label}",
                    "prediction_code": pred_code,
                    "risk_percentage": risk_pct,
                    "class_probabilities": {
                        "Low": round(float(probs[0]), 4),
                        "Medium": round(float(probs[1]), 4),
                        "High": round(float(probs[2]), 4)
                    },
                    "disclaimer": "This result is a model-based prediction and is not a medical diagnosis."
                }

        except Exception as err:
            return {
                "available": False,
                "status": "insufficient_data",
                "probability": None,
                "risk_percentage": None,
                "error": f"Prediction failed: {str(err)}",
                "missing_fields": [],
                "missingFeatures": []
            }

    def predict_all_diseases(self, inputs_by_module: dict) -> dict:
        """Executes independent predictions across all 5 disease modules."""
        results = {}
        for mod in ["cardiovascular", "metabolic", "blood_pressure", "thyroid", "cancer"]:
            mod_input = inputs_by_module.get(mod, {})
            results[mod] = self.predict_disease(mod, mod_input)
        return results


# Global singleton instance
prediction_service = PredictionService()

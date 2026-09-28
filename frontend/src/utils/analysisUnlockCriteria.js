/**
 * GeneGuard Analysis Unlock Criteria Evaluation
 * ---------------------------------------------
 * Enforces unlocking prerequisites before Final Analysis can be generated:
 * 1. User Patient Profile must be complete (Name, Age, Sex, Height, Weight).
 * 2. All 5 Disease Models must have input telemetry (Cardio, Metabolic, BP, Thyroid, Cancer).
 * 3. At least 2 relative nodes added in the Family Tree pedigree canvas.
 */

export const DISEASE_MODULE_NAMES = {
  cardiovascular: 'Cardiovascular Disease',
  metabolic: 'Type 2 Diabetes & Metabolic',
  blood_pressure: 'Hypertension & Blood Pressure',
  thyroid: 'Thyroid Disorder',
  cancer: 'Oncology & Cellular Cytology'
};

export function checkProfileComplete(profile) {
  if (!profile) return false;
  const hasAge = profile.age !== null && profile.age !== undefined && !isNaN(Number(profile.age)) && Number(profile.age) > 0;
  const hasSex = Boolean(profile.sex && String(profile.sex).trim() !== '');
  const hasHeight = profile.height_cm !== null && profile.height_cm !== undefined && !isNaN(Number(profile.height_cm)) && Number(profile.height_cm) > 0;
  const hasWeight = profile.weight_kg !== null && profile.weight_kg !== undefined && !isNaN(Number(profile.weight_kg)) && Number(profile.weight_kg) > 0;
  const hasName = Boolean(profile.name && String(profile.name).trim() !== '');

  return Boolean((profile.isComplete || hasName) && hasAge && hasSex && hasHeight && hasWeight);
}

export function checkDiseaseModuleComplete(modKey, formValues, predictionResults) {
  // If model already evaluated and has a valid prediction result
  if (predictionResults && predictionResults[modKey]?.available) {
    return true;
  }

  // Or verify that the module has sufficient distinct values entered
  const modVals = formValues?.[modKey] || {};
  const filledFields = Object.keys(modVals).filter((k) => {
    const v = modVals[k];
    return v !== null && v !== undefined && String(v).trim() !== '';
  });

  return filledFields.length >= 3;
}

export function checkFamilyTreeComplete(familyMembers) {
  const list = Array.isArray(familyMembers) ? familyMembers : [];
  return list.length >= 2;
}

export function evaluateAnalysisUnlockCriteria(
  patientProfile,
  formValues = {},
  predictionResults = {},
  familyMembers = []
) {
  const isProfileComplete = checkProfileComplete(patientProfile);

  const modules = ['cardiovascular', 'metabolic', 'blood_pressure', 'thyroid', 'cancer'];
  const diseaseStatus = {};
  modules.forEach((mod) => {
    diseaseStatus[mod] = checkDiseaseModuleComplete(mod, formValues, predictionResults);
  });

  const completedDiseasesCount = modules.filter((m) => diseaseStatus[m]).length;
  const isAllDiseasesComplete = completedDiseasesCount === 5;

  const familyList = Array.isArray(familyMembers) ? familyMembers : [];
  const familyCount = familyList.length;
  const isFamilyNodesComplete = checkFamilyTreeComplete(familyList);

  const isUnlocked = isProfileComplete && isAllDiseasesComplete && isFamilyNodesComplete;
  const criteriaMetCount =
    (isProfileComplete ? 1 : 0) +
    (isAllDiseasesComplete ? 1 : 0) +
    (isFamilyNodesComplete ? 1 : 0);

  const missingDiseases = modules.filter((m) => !diseaseStatus[m]).map((m) => DISEASE_MODULE_NAMES[m] || m);

  return {
    isUnlocked,
    isProfileComplete,
    diseaseStatus,
    completedDiseasesCount,
    isAllDiseasesComplete,
    missingDiseases,
    familyCount,
    isFamilyNodesComplete,
    criteriaMetCount,
    totalCriteria: 3
  };
}

import {
  evaluateAnalysisUnlockCriteria,
  checkProfileComplete,
  checkDiseaseModuleComplete,
  checkFamilyTreeComplete,
  DISEASE_MODULE_NAMES
} from '../frontend/src/utils/analysisUnlockCriteria.js';

console.log('--- Testing Analysis Unlock Criteria ---');

// Case 1: Initial Empty State
const emptyProfile = {
  name: '',
  age: null,
  sex: '',
  height_cm: null,
  weight_kg: null,
  bmi: null,
  isComplete: false
};
const emptyFormValues = {
  cardiovascular: {},
  metabolic: {},
  blood_pressure: {},
  thyroid: {},
  cancer: {}
};
const emptyPredictions = {};
const emptyFamily = [];

const resEmpty = evaluateAnalysisUnlockCriteria(
  emptyProfile,
  emptyFormValues,
  emptyPredictions,
  emptyFamily
);

console.log('Case 1 (Fresh start, nothing filled):');
console.log('  isUnlocked:', resEmpty.isUnlocked, '(expected: false)');
console.log('  isProfileComplete:', resEmpty.isProfileComplete, '(expected: false)');
console.log('  completedDiseasesCount:', resEmpty.completedDiseasesCount, '(expected: 0)');
console.log('  familyCount:', resEmpty.familyCount, '(expected: 0)');
console.log('  criteriaMetCount:', resEmpty.criteriaMetCount, '/ 3 (expected: 0)');

if (resEmpty.isUnlocked !== false || resEmpty.criteriaMetCount !== 0) {
  throw new Error('Case 1 assertion failed');
}

// Case 2: Only Profile Complete
const completeProfile = {
  name: 'John Doe',
  age: 45,
  sex: 'male',
  height_cm: 175,
  weight_kg: 72,
  bmi: 23.5,
  isComplete: true
};

const resProfileOnly = evaluateAnalysisUnlockCriteria(
  completeProfile,
  emptyFormValues,
  emptyPredictions,
  emptyFamily
);

console.log('\nCase 2 (Profile only):');
console.log('  isUnlocked:', resProfileOnly.isUnlocked, '(expected: false)');
console.log('  isProfileComplete:', resProfileOnly.isProfileComplete, '(expected: true)');
console.log('  criteriaMetCount:', resProfileOnly.criteriaMetCount, '/ 3 (expected: 1)');

if (resProfileOnly.isUnlocked !== false || resProfileOnly.criteriaMetCount !== 1) {
  throw new Error('Case 2 assertion failed');
}

// Case 3: Profile + 5 Disease Models Complete, but Family tree < 2
const fiveDiseasesFilled = {
  cardiovascular: { age: 45, ap_hi: 120, ap_lo: 80, cholesterol: 1 },
  metabolic: { fasting_glucose: 95, waist: 85, bmi: 23.5 },
  blood_pressure: { sys_bp: 120, dia_bp: 80, salt_intake: 'moderate' },
  thyroid: { tsh: 2.1, t3: 1.5, tt4: 8.0 },
  cancer: { radius_mean: 14.0, texture_mean: 19.0, perimeter_mean: 90.0 }
};

const oneFamilyMember = [{ id: 'fam-1', name: 'Dad', relationship: 'Father' }];

const resTwoCriteria = evaluateAnalysisUnlockCriteria(
  completeProfile,
  fiveDiseasesFilled,
  emptyPredictions,
  oneFamilyMember
);

console.log('\nCase 3 (Profile + 5 Diseases, but 1 Family member):');
console.log('  isUnlocked:', resTwoCriteria.isUnlocked, '(expected: false)');
console.log('  isAllDiseasesComplete:', resTwoCriteria.isAllDiseasesComplete, '(expected: true)');
console.log('  isFamilyNodesComplete:', resTwoCriteria.isFamilyNodesComplete, '(expected: false)');
console.log('  criteriaMetCount:', resTwoCriteria.criteriaMetCount, '/ 3 (expected: 2)');

if (resTwoCriteria.isUnlocked !== false || resTwoCriteria.criteriaMetCount !== 2) {
  throw new Error('Case 3 assertion failed');
}

// Case 4: All 3 Criteria Satisfied (Profile + 5 Diseases + 2 Family Members)
const twoFamilyMembers = [
  { id: 'fam-1', name: 'Dad', relationship: 'Father', conditions: ['hypertension'] },
  { id: 'fam-2', name: 'Mom', relationship: 'Mother', conditions: ['diabetes'] }
];

const resFullyUnlocked = evaluateAnalysisUnlockCriteria(
  completeProfile,
  fiveDiseasesFilled,
  emptyPredictions,
  twoFamilyMembers
);

console.log('\nCase 4 (All 3 Criteria Met):');
console.log('  isUnlocked:', resFullyUnlocked.isUnlocked, '(expected: true)');
console.log('  isProfileComplete:', resFullyUnlocked.isProfileComplete, '(expected: true)');
console.log('  isAllDiseasesComplete:', resFullyUnlocked.isAllDiseasesComplete, '(expected: true)');
console.log('  isFamilyNodesComplete:', resFullyUnlocked.isFamilyNodesComplete, '(expected: true)');
console.log('  criteriaMetCount:', resFullyUnlocked.criteriaMetCount, '/ 3 (expected: 3)');

if (resFullyUnlocked.isUnlocked !== true || resFullyUnlocked.criteriaMetCount !== 3) {
  throw new Error('Case 4 assertion failed');
}

// Case 5: Verify default Patient name with profile completed
const defaultNameProfile = {
  name: 'Patient',
  age: 50,
  sex: 'female',
  height_cm: 165,
  weight_kg: 60,
  bmi: 22.0,
  isComplete: true
};

const resDefaultName = evaluateAnalysisUnlockCriteria(
  defaultNameProfile,
  fiveDiseasesFilled,
  emptyPredictions,
  twoFamilyMembers
);

console.log('\nCase 5 (Default Patient name with filled biometrics):');
console.log('  isUnlocked:', resDefaultName.isUnlocked, '(expected: true)');
if (resDefaultName.isUnlocked !== true) {
  throw new Error('Case 5 assertion failed');
}

console.log('\nALL 5 TEST CASES PASSED SUCCESSFULLY!');

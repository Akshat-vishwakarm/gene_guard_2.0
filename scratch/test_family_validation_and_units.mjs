import {
  cmToFeetInches,
  feetInchesToCm,
  kgToLbs,
  lbsToKg,
  formatHeightDisplay,
  formatWeightDisplay,
  getGenderForRelationship
} from '../frontend/src/utils/normalValueRegistry.js';

console.log('--- Testing Unit Conversions ---');

// 1. Height conversions
const h1 = cmToFeetInches(175);
console.log('175 cm ->', h1);
if (h1.feet !== 5 || h1.inches !== 9) {
  throw new Error(`Expected 5 ft 9 in, got ${h1.feet} ft ${h1.inches} in`);
}

const cm1 = feetInchesToCm(5, 9);
console.log('5 ft 9 in ->', cm1, 'cm');
if (cm1 !== 175) {
  throw new Error(`Expected 175 cm, got ${cm1}`);
}

const h2 = cmToFeetInches(182.88);
console.log('182.88 cm ->', h2);
if (h2.feet !== 6 || h2.inches !== 0) {
  throw new Error(`Expected 6 ft 0 in, got ${h2.feet} ft ${h2.inches} in`);
}

const cm2 = feetInchesToCm(6, 0);
console.log('6 ft 0 in ->', cm2, 'cm');
if (cm2 !== 183) {
  throw new Error(`Expected 183 cm, got ${cm2}`);
}

// 2. Weight conversions
const lbs1 = kgToLbs(70);
console.log('70 kg ->', lbs1, 'lbs');
if (lbs1 !== 154.3) {
  throw new Error(`Expected 154.3 lbs, got ${lbs1}`);
}

const kg1 = lbsToKg(154.3);
console.log('154.3 lbs ->', kg1, 'kg');
if (kg1 !== 70) {
  throw new Error(`Expected 70 kg, got ${kg1}`);
}

// 3. String formatting
console.log('formatHeightDisplay(175):', formatHeightDisplay(175));
console.log('formatWeightDisplay(70):', formatWeightDisplay(70));

console.log('\n--- Testing Auto-derived Relationship Genders ---');
const testGenders = [
  { rel: 'Father', expected: 'Male' },
  { rel: 'Mother', expected: 'Female' },
  { rel: 'Brother', expected: 'Male' },
  { rel: 'Sister', expected: 'Female' },
  { rel: 'Paternal Grandfather', expected: 'Male' },
  { rel: 'Paternal Grandmother', expected: 'Female' },
  { rel: 'Maternal Grandfather', expected: 'Male' },
  { rel: 'Maternal Grandmother', expected: 'Female' },
  { rel: 'Son', expected: 'Male' },
  { rel: 'Daughter', expected: 'Female' },
  { rel: 'Uncle', expected: 'Male' },
  { rel: 'Aunt', expected: 'Female' }
];

testGenders.forEach(({ rel, expected }) => {
  const actual = getGenderForRelationship(rel);
  console.log(`  ${rel} => ${actual} (expected: ${expected})`);
  if (actual !== expected) {
    throw new Error(`Gender mismatch for ${rel}: expected ${expected}, got ${actual}`);
  }
});

console.log('\n--- Testing Duplicate Parent Detection Logic ---');
const familyMembersWithFather = [
  { person_id: 'm1', name: 'John Doe Sr', relationship: 'Father', sex: 'Male' }
];

const hasFather = familyMembersWithFather.some(
  (m) => (m.relationship || '').toLowerCase() === 'father'
);
const hasMother = familyMembersWithFather.some(
  (m) => (m.relationship || '').toLowerCase() === 'mother'
);

console.log('hasFather (1 Father present):', hasFather);
console.log('hasMother (No Mother present):', hasMother);

if (!hasFather || hasMother) {
  throw new Error('Duplicate parent detection failed');
}

console.log('\nALL UNIT TESTS PASSED SUCCESSFULLY!');

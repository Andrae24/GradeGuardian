/**
 * Transmutes a raw percentage into the CIT-U GPA equivalent
 * Based on the new Scale: 
 * 100% = 5.0
 * 60%  = 3.0 (Passing)
 * Every 2% = 0.1 GPA points
 */
export const transmuteToGPA = (percentage) => {
  const score = Math.round(percentage);
  
  // 1. Handling Perfect Score
  if (score >= 100) return "5.0";

  // 2. Handling Passing Range (60% to 99%)
  if (score >= 60) {
    // Formula: 3.0 base + ((Score - 60) / 2) * 0.1
    const gpa = 3.0 + ((score - 60) / 2) * 0.1;
    return gpa.toFixed(1);
  }

  // 3. Handling Failing Range (0% to 59%)
  // Slides from 1.0 (at 0%) up to 2.9 (at 59%)
  // Formula: 1.0 + (score / 60) * 1.9
  const failingGpa = 1.0 + (score / 60) * 1.9;
  
  // Ensure it never accidentally shows 3.0 unless they hit 60%
  return Math.min(failingGpa, 2.9).toFixed(1);
};

/**
 * Reverse Formula for the Grade Projector
 * Used to calculate what raw score is needed to hit a target GPA
 * Raw = ((GPA - 3.0) / 0.1) * 2 + 60
 */
export const transmuteGPAtoRaw = (gpa) => {
  const gpaVal = parseFloat(gpa);
  if (isNaN(gpaVal)) return 0;
  
  // Reverse failing logic
  if (gpaVal < 3.0) {
    return ((gpaVal - 1.0) / 1.9) * 60;
  }
  
  // Reverse passing logic
  if (gpaVal >= 5.0) return 100;
  
  return ((gpaVal - 3.0) / 0.1) * 2 + 60;
};

/**
 * Normalizes Class Standing (CS) based on weighted contributions
 */
export const calculateNormalizedScore = (assessments, period) => {
  const contribution = assessments
    .filter(a => a.period === period && !a.name.toUpperCase().includes('EXAM'))
    .reduce((acc, curr) => acc + (curr.total > 0 ? (curr.score / curr.total * curr.weight) : 0), 0);

  const weightSum = assessments
    .filter(a => a.period === period && !a.name.toUpperCase().includes('EXAM'))
    .reduce((acc, curr) => acc + curr.weight, 0);

  return weightSum > 0 ? (contribution / weightSum) * 100 : 0;
};
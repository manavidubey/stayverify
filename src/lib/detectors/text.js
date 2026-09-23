/**
 * Listing Text Pattern Detector
 * Input: listing title/description text
 * Method: simple keyword/pattern matching
 */

const URGENCY_PATTERNS = [
  /only \d+ left/i,
  /book now/i,
  /limited time/i,
  /act fast/i,
  /don'?t miss out/i,
  /discount.*today only/i,
  /today only/i,
  /last chance/i,
  /hurry/i
];

export async function detectTextPatterns(title, description) {
  if (!title && !description) {
    return {
      urgency_language_detected: null,
    };
  }

  const combinedText = `${title || ''} ${description || ''}`;
  
  let urgencyDetected = false;
  for (const pattern of URGENCY_PATTERNS) {
    if (pattern.test(combinedText)) {
      urgencyDetected = true;
      break;
    }
  }

  return {
    urgency_language_detected: urgencyDetected,
  };
}

// Billing accuracy tracker — compares predicted vs actual billed codes

export function computeBillingAccuracy(predictedCodes, actualBilledCodes) {
  const predictedSet = new Set(predictedCodes.map(c => typeof c === 'string' ? c : c.code));
  const billedSet = new Set(actualBilledCodes.map(c => typeof c === 'string' ? c : c.code));

  const truePositives = [...predictedSet].filter(c => billedSet.has(c));
  const falsePositives = [...predictedSet].filter(c => !billedSet.has(c));
  const falseNegatives = [...billedSet].filter(c => !predictedSet.has(c));

  const precision = predictedSet.size > 0 ? truePositives.length / predictedSet.size : 0;
  const recall = billedSet.size > 0 ? truePositives.length / billedSet.size : 0;

  return {
    precision: Math.round(precision * 100),
    recall: Math.round(recall * 100),
    truePositives,
    falsePositives,   // over-predicted (predicted but not billed)
    falseNegatives,   // missed (billed but not predicted)
    predictedCount: predictedSet.size,
    billedCount: billedSet.size,
  };
}

// Aggregate billing accuracy across multiple cases
export function aggregateBillingStats(billingLog) {
  if (!billingLog || billingLog.length === 0) return null;

  let totalPrecision = 0;
  let totalRecall = 0;
  const missedCodeCounts = {};
  const overPredictedCounts = {};

  billingLog.forEach(entry => {
    totalPrecision += entry.precision;
    totalRecall += entry.recall;
    (entry.falseNegatives || []).forEach(c => { missedCodeCounts[c] = (missedCodeCounts[c] || 0) + 1; });
    (entry.falsePositives || []).forEach(c => { overPredictedCounts[c] = (overPredictedCounts[c] || 0) + 1; });
  });

  const topMissed = Object.entries(missedCodeCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topOverPredicted = Object.entries(overPredictedCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return {
    avgPrecision: Math.round(totalPrecision / billingLog.length),
    avgRecall: Math.round(totalRecall / billingLog.length),
    caseCount: billingLog.length,
    topMissed,
    topOverPredicted,
  };
}

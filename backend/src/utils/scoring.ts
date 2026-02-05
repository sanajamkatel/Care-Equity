type OutcomeRates = {
  Black?: number;
  White?: number;
  Hispanic?: number;
};

export interface EquityScore {
  hospitialId: string;
  year: number;
  metrics: {
    maternalMortalityDisparity: number;
    infantMortalityDisparity: number;
    complicationsDisparity: number;
    cSectionDisparity: number;
  };
  overallEquityScore: number; // 0-100, higher is better (more equitable)
}

const calculateDisparity = (rates: OutcomeRates): number => {
  const values = Object.values(rates).filter((v) => v !== undefined);
  if (values.length === 0) return 0;
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (min === 0) return max === 0 ? 0 : 100;
  return ((max - min) / min) * 100;
};

export const scoreHospitalOutcome = (
  hospitalId: string,
  year: number,
  maternalMortalityPer100k: OutcomeRates,
  infantMortalityPer1000: OutcomeRates,
  severeComplicationsRate: OutcomeRates,
  cSectionRate: OutcomeRates
): EquityScore => {
  const maternalDisparity = calculateDisparity(maternalMortalityPer100k);
  const infantDisparity = calculateDisparity(infantMortalityPer1000);
  const complicationsDisparity = calculateDisparity(severeComplicationsRate);
  const cSectionDisparity = calculateDisparity(cSectionRate);

  const avgDisparity = (maternalDisparity + infantDisparity + complicationsDisparity + cSectionDisparity) / 4;
  const equityScore = Math.max(0, 100 - avgDisparity);

  return {
    hospitialId: hospitalId,
    year,
    metrics: {
      maternalMortalityDisparity: parseFloat(maternalDisparity.toFixed(2)),
      infantMortalityDisparity: parseFloat(infantDisparity.toFixed(2)),
      complicationsDisparity: parseFloat(complicationsDisparity.toFixed(2)),
      cSectionDisparity: parseFloat(cSectionDisparity.toFixed(2)),
    },
    overallEquityScore: parseFloat(equityScore.toFixed(2)),
  };
};

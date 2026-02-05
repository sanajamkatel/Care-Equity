import express from 'express';
import HospitalOutcome from '../models/HospitalOutcome';
import { scoreHospitalOutcome } from '../utils/scoring';

const router = express.Router();

// Get hospital outcome with equity score
router.get('/:id/score', async (req, res) => {
  try {
    const outcome = await HospitalOutcome.findById(req.params.id);
    if (!outcome) return res.status(404).json({ error: 'Not found' });

    const score = scoreHospitalOutcome(
      outcome.hospitalId,
      outcome.year,
      outcome.maternalMortalityPer100k,
      outcome.infantMortalityPer1000,
      outcome.severeComplicationsRate,
      outcome.cSectionRate
    );

    return res.json({ outcome: outcome.toObject(), score });
  } catch (error) {
    console.error('Error scoring outcome:', error);
    return res.status(500).json({ error: 'Failed to score outcome' });
  }
});

// Bulk score endpoint (list all outcomes with scores)
router.get('/bulk', async (req, res) => {
  const { hospitalId, year } = req.query as any;
  const filter: any = {};
  if (hospitalId) filter.hospitalId = hospitalId;
  if (year) filter.year = Number(year);

  try {
    const outcomes = await HospitalOutcome.find(filter).sort({ year: -1 });
    const scored = outcomes.map((outcome) =>
      scoreHospitalOutcome(
        outcome.hospitalId,
        outcome.year,
        outcome.maternalMortalityPer100k,
        outcome.infantMortalityPer1000,
        outcome.severeComplicationsRate,
        outcome.cSectionRate
      )
    );

    return res.json(scored);
  } catch (error) {
    console.error('Error bulk scoring:', error);
    return res.status(500).json({ error: 'Failed to bulk score' });
  }
});

export default router;

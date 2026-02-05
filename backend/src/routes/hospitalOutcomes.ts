import express from 'express';
import HospitalOutcome from '../models/HospitalOutcome';

const router = express.Router();

const validateOutcome = (body: any): { valid: boolean; message?: string } => {
  if (!body) return { valid: false, message: 'Missing request body' };
  const { hospitalId, year, maternalMortalityPer100k, infantMortalityPer1000, severeComplicationsRate, cSectionRate } = body;
  if (!hospitalId || typeof hospitalId !== 'string') return { valid: false, message: 'hospitalId is required and must be a string' };
  if (!year || typeof year !== 'number') return { valid: false, message: 'year is required and must be a number' };

  const checkRates = (obj: any, name: string) => {
    if (!obj || typeof obj !== 'object') return `${name} is required and must be an object`;
    for (const k of ['Black', 'White', 'Hispanic']) {
      const v = obj[k];
      if (v !== undefined && typeof v !== 'number') return `${name}.${k} must be a number`;
    }
    return null;
  };

  const checks = [
    checkRates(maternalMortalityPer100k, 'maternalMortalityPer100k'),
    checkRates(infantMortalityPer1000, 'infantMortalityPer1000'),
    checkRates(severeComplicationsRate, 'severeComplicationsRate'),
    checkRates(cSectionRate, 'cSectionRate'),
  ];

  for (const c of checks) if (c) return { valid: false, message: c };
  return { valid: true };
};

// Create a new HospitalOutcome
router.post('/', async (req, res) => {
  const validation = validateOutcome(req.body);
  if (!validation.valid) return res.status(400).json({ error: validation.message });

  try {
    const created = await HospitalOutcome.create(req.body);
    return res.status(201).json(created);
  } catch (error) {
    console.error('Error creating HospitalOutcome:', error);
    return res.status(500).json({ error: 'Failed to create hospital outcome' });
  }
});

// List / query HospitalOutcomes (filter by hospitalId and/or year)
router.get('/', async (req, res) => {
  const { hospitalId, year } = req.query as any;
  const filter: any = {};
  if (hospitalId) filter.hospitalId = hospitalId;
  if (year) filter.year = Number(year);

  try {
    const items = await HospitalOutcome.find(filter).sort({ year: -1 });
    return res.json(items);
  } catch (error) {
    console.error('Error fetching HospitalOutcomes:', error);
    return res.status(500).json({ error: 'Failed to fetch hospital outcomes' });
  }
});

// Get single outcome by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await HospitalOutcome.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    return res.json(item);
  } catch (error) {
    console.error('Error fetching HospitalOutcome:', error);
    return res.status(500).json({ error: 'Failed to fetch hospital outcome' });
  }
});

export default router;

import express from 'express';
import HospitalOutcome from '../models/HospitalOutcome';

const router = express.Router();

const numberOrUndefined = (v: any) => {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

const parseOutcomeFromBody = (body: any) => {
  const mapRates = (prefix: string) => {
    const source = body[prefix] || {};
    return {
      Black: numberOrUndefined(source.Black ?? body[`${prefix}[Black]`]),
      White: numberOrUndefined(source.White ?? body[`${prefix}[White]`]),
      Hispanic: numberOrUndefined(source.Hispanic ?? body[`${prefix}[Hispanic]`]),
    };
  };

  return {
    hospitalId: body.hospitalId,
    year: Number(body.year),
    maternalMortalityPer100k: mapRates('maternalMortalityPer100k'),
    infantMortalityPer1000: mapRates('infantMortalityPer1000'),
    severeComplicationsRate: mapRates('severeComplicationsRate'),
    cSectionRate: mapRates('cSectionRate'),
  };
};

// Simple admin form
router.get('/', (req, res) => {
  res.send(`
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Admin - Submit Hospital Outcome</title>
      <style>body{font-family:Arial;padding:20px}label{display:block;margin-top:8px}</style>
    </head>
    <body>
      <h1>Submit Hospital Outcome</h1>
      <form method="post" action="/admin/submit">
        <label>Hospital ID: <input name="hospitalId" required /></label>
        <label>Year: <input name="year" type="number" required /></label>

        <h3>Maternal Mortality Per 100k</h3>
        <label>Black: <input name="maternalMortalityPer100k[Black]" /></label>
        <label>White: <input name="maternalMortalityPer100k[White]" /></label>
        <label>Hispanic: <input name="maternalMortalityPer100k[Hispanic]" /></label>

        <h3>Infant Mortality Per 1000</h3>
        <label>Black: <input name="infantMortalityPer1000[Black]" /></label>
        <label>White: <input name="infantMortalityPer1000[White]" /></label>
        <label>Hispanic: <input name="infantMortalityPer1000[Hispanic]" /></label>

        <h3>Severe Complications Rate (%)</h3>
        <label>Black: <input name="severeComplicationsRate[Black]" /></label>
        <label>White: <input name="severeComplicationsRate[White]" /></label>
        <label>Hispanic: <input name="severeComplicationsRate[Hispanic]" /></label>

        <h3>C-Section Rate (%)</h3>
        <label>Black: <input name="cSectionRate[Black]" /></label>
        <label>White: <input name="cSectionRate[White]" /></label>
        <label>Hispanic: <input name="cSectionRate[Hispanic]" /></label>

        <div style="margin-top:12px"><button type="submit">Submit</button></div>
      </form>
    </body>
    </html>
  `);
});

// Handle form submission
router.post('/submit', async (req, res) => {
  try {
    const payload = parseOutcomeFromBody(req.body);
    // Basic validation
    if (!payload.hospitalId || !payload.year) {
      return res.status(400).send('hospitalId and year are required');
    }

    const created = await HospitalOutcome.create(payload as any);
    res.send(`<p>Created outcome with id: ${created._id}</p><p><a href="/admin">Create another</a></p>`);
  } catch (error) {
    console.error('Admin submit error:', error);
    res.status(500).send('Failed to create outcome');
  }
});

export default router;

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HospitalOutcome from '../models/HospitalOutcome';
import { Hospital } from '../models/Hospital';
import { CalculatedRating } from '../models/CalculatedRating';
import { scoreHospitalOutcome } from '../utils/scoring';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

const hospitals = [
  {
    _id: 'HOSP_001',
    name: 'City General Hospital',
    city: 'New York',
    state: 'NY',
  },
  {
    _id: 'HOSP_002',
    name: 'Metropolitan Medical Center',
    city: 'Los Angeles',
    state: 'CA',
  },
  {
    _id: 'HOSP_003',
    name: 'Regional Health Hospital',
    city: 'Chicago',
    state: 'IL',
  },
];

const outcomeData = [
  {
    hospitalId: 'HOSP_001',
    year: 2025,
    maternalMortalityPer100k: { Black: 48, White: 12, Hispanic: 16 },
    infantMortalityPer1000: { Black: 9.8, White: 3.5, Hispanic: 5.2 },
    severeComplicationsRate: { Black: 4.2, White: 1.8, Hispanic: 2.5 },
    cSectionRate: { Black: 34, White: 26, Hispanic: 29 },
  },
  {
    hospitalId: 'HOSP_002',
    year: 2025,
    maternalMortalityPer100k: { Black: 35, White: 10, Hispanic: 14 },
    infantMortalityPer1000: { Black: 7.5, White: 3.2, Hispanic: 4.8 },
    severeComplicationsRate: { Black: 3.2, White: 1.5, Hispanic: 2.1 },
    cSectionRate: { Black: 31, White: 24, Hispanic: 27 },
  },
  {
    hospitalId: 'HOSP_003',
    year: 2025,
    maternalMortalityPer100k: { Black: 52, White: 15, Hispanic: 20 },
    infantMortalityPer1000: { Black: 10.2, White: 4.1, Hispanic: 6.0 },
    severeComplicationsRate: { Black: 5.1, White: 2.2, Hispanic: 3.2 },
    cSectionRate: { Black: 36, White: 28, Hispanic: 31 },
  },
  {
    hospitalId: 'HOSP_001',
    year: 2024,
    maternalMortalityPer100k: { Black: 50, White: 13, Hispanic: 17 },
    infantMortalityPer1000: { Black: 10.0, White: 3.6, Hispanic: 5.4 },
    severeComplicationsRate: { Black: 4.5, White: 1.9, Hispanic: 2.7 },
    cSectionRate: { Black: 35, White: 27, Hispanic: 30 },
  },
];

// Calculate rating from outcome data
const calculateRating = (outcome: any) => {
  const equityScore = scoreHospitalOutcome(
    outcome.hospitalId,
    outcome.year,
    outcome.maternalMortalityPer100k,
    outcome.infantMortalityPer1000,
    outcome.severeComplicationsRate,
    outcome.cSectionRate
  );

  // Calculate overall score (inverse of equity gap - higher score = better)
  const overallScore = equityScore.overallEquityScore;
  
  // Determine grade
  let overallGrade = 'D';
  if (overallScore >= 80) overallGrade = 'A';
  else if (overallScore >= 60) overallGrade = 'B';
  else if (overallScore >= 40) overallGrade = 'C';

  // Calculate by-group scores and grades
  const byGroup: any = {};
  
  // Calculate scores for each group based on their rates
  const calculateGroupScore = (rate: number, baseline: number) => {
    // Lower rate = better score
    const score = Math.max(0, 100 - (rate / baseline) * 100);
    let grade = 'D';
    if (score >= 80) grade = 'A';
    else if (score >= 60) grade = 'B';
    else if (score >= 40) grade = 'C';
    return { score: Math.round(score), grade };
  };

  // Use White rates as baseline for comparison
  const whiteBaseline = {
    maternal: outcome.maternalMortalityPer100k.White || 10,
    infant: outcome.infantMortalityPer1000.White || 3.5,
    complications: outcome.severeComplicationsRate.White || 1.8,
    cSection: outcome.cSectionRate.White || 26,
  };

  if (outcome.maternalMortalityPer100k.Black !== undefined) {
    const avgRate = outcome.maternalMortalityPer100k.Black;
    byGroup.Black = calculateGroupScore(avgRate, whiteBaseline.maternal);
  }
  
  if (outcome.maternalMortalityPer100k.White !== undefined) {
    byGroup.White = { score: 85, grade: 'A' }; // Baseline group
  }
  
  if (outcome.maternalMortalityPer100k.Hispanic !== undefined) {
    const avgRate = outcome.maternalMortalityPer100k.Hispanic;
    byGroup.Hispanic = calculateGroupScore(avgRate, whiteBaseline.maternal);
  }

  return {
    hospitalId: outcome.hospitalId,
    updatedAt: new Date(),
    overallScore: Math.round(overallScore),
    overallGrade,
    equityGapScore: Math.round(100 - overallScore), // Higher gap = worse
    byGroup,
  };
};

const seed = async () => {
  try {
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not set in .env');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if data already exists
    const existingHospitals = await Hospital.countDocuments();
    const existingOutcomes = await HospitalOutcome.countDocuments();
    
    if (existingHospitals > 0 || existingOutcomes > 0) {
      console.log(`ℹ️  DB already has data (${existingHospitals} hospitals, ${existingOutcomes} outcomes). Skipping seed.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Seed hospitals
    await Hospital.insertMany(hospitals);
    console.log(`✅ Inserted ${hospitals.length} hospitals`);

    // Seed outcomes
    await HospitalOutcome.insertMany(outcomeData);
    console.log(`✅ Inserted ${outcomeData.length} hospital outcomes`);

    // Calculate and seed ratings (use most recent year for each hospital)
    const latestOutcomes = outcomeData.filter((o, idx, arr) => {
      return !arr.some((other, otherIdx) => 
        otherIdx > idx && other.hospitalId === o.hospitalId && other.year > o.year
      );
    });

    const ratings = latestOutcomes.map(calculateRating);
    await CalculatedRating.insertMany(ratings);
    console.log(`✅ Inserted ${ratings.length} calculated ratings`);

    const allHospitals = await Hospital.find();
    const allOutcomes = await HospitalOutcome.find();
    const allRatings = await CalculatedRating.find();
    
    console.log(`📊 Total in DB: ${allHospitals.length} hospitals, ${allOutcomes.length} outcomes, ${allRatings.length} ratings`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();

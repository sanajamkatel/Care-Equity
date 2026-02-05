import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HospitalOutcome from '../models/HospitalOutcome';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

const sampleData = [
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

const seed = async () => {
  try {
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not set in .env');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existingCount = await HospitalOutcome.countDocuments();
    if (existingCount > 0) {
      console.log(`ℹ️  DB already has ${existingCount} records. Skipping seed.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    await HospitalOutcome.insertMany(sampleData);
    console.log(`✅ Inserted ${sampleData.length} sample hospital outcomes`);

    const all = await HospitalOutcome.find();
    console.log(`📊 Total records in DB: ${all.length}`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();

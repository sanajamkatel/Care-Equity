import mongoose, { Schema, Document } from 'mongoose';

/**
 * PatientReport Model
 * 
 * Represents an anonymous patient report/review submitted by users.
 * This model maps to the 'patientReports' collection in MongoDB.
 * 
 * These reports are used to calculate hospital ratings and identify disparities.
 */
export interface IPatientReport extends Document {
  hospitalId: string;      // Foreign key: links to Hospital._id (e.g., "HOSP_001")
  rating: number;          // Patient's rating (1-5 scale, where 1 is poor and 5 is excellent)
  comment: string;         // Patient's written review/comment
  createdAt: Date;         // When the report was submitted
  isAnonymous: boolean;    // Always true for anonymous reports
}

// Define the MongoDB schema for PatientReport documents
const PatientReportSchema = new Schema<IPatientReport>({
  hospitalId: { 
    type: String, 
    required: true,
    index: true  // Index for faster queries by hospital
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  comment: { 
    type: String, 
    required: true,
    maxlength: 5000  // Limit comment length
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true  // Index for time-based queries
  },
  isAnonymous: { 
    type: Boolean, 
    default: true 
  },
});

// Create and export the Mongoose model
export const PatientReport = mongoose.model<IPatientReport>(
  'PatientReport',
  PatientReportSchema,
  'patientReports'
);

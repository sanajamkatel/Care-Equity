import mongoose, { Schema, Document } from 'mongoose';

/**
 * Article Model
 * 
 * Represents a research article, study, or reference about healthcare equity.
 * This model maps to the 'articles' collection in MongoDB.
 */
export interface IArticle extends Document {
  title: string;          // Article title
  description: string;    // Brief description of the article
  url: string;            // Link to the article
  source: string;         // Source/publication name (e.g., "CDC", "NIH")
  date?: string;          // Publication date (optional)
  createdAt: Date;        // When the article was added to the database
  updatedAt: Date;        // When the article was last updated
}

// Define the MongoDB schema for Article documents
const ArticleSchema = new Schema<IArticle>({
  title: { 
    type: String, 
    required: true,
    index: true  // Index for faster searches
  },
  description: { 
    type: String, 
    required: true 
  },
  url: { 
    type: String, 
    required: true,
    unique: true,  // Ensure no duplicate URLs
    index: true
  },
  source: { 
    type: String, 
    required: true 
  },
  date: { 
    type: String, 
    required: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
}, {
  timestamps: false // We'll handle timestamps manually
});

// Update the updatedAt field before saving
ArticleSchema.pre('save', function() {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
});

// Create and export the Mongoose model
export const Article = mongoose.model<IArticle>(
  'Article',
  ArticleSchema,
  'articles'
);

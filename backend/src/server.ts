import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, getDBStatus } from './config/database';
import { Hospital } from './models/Hospital';
import { CalculatedRating } from './models/CalculatedRating';
import { PatientReport } from './models/PatientReport';
import { Article } from './models/Article';

// Load environment variables from .env file
// This reads MONGODB_URI and PORT from backend/.env
dotenv.config();

// Create Express application instance
const app = express();
const PORT = process.env.PORT || 5001; // Default to 5001 if PORT not set

// ==================== MIDDLEWARE ====================
// Middleware runs on every request before it reaches route handlers

// CORS (Cross-Origin Resource Sharing) middleware
// Allows frontend (running on different port) to make API requests
app.use(cors({
  origin: '*', // Allow all origins for development (use specific domain in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON body parser - parses JSON request bodies
app.use(express.json());

// URL-encoded body parser - parses form data
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (for debugging)
// Logs every incoming request with timestamp, method, and path
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next(); // Pass control to next middleware/route
});

// ==================== DATABASE CONNECTION ====================
// Connect to MongoDB Atlas (non-blocking - doesn't stop server if connection fails)
connectDB().catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
});

// ==================== ROUTES ====================

/**
 * GET /
 * Basic API root endpoint - confirms server is running
 */
app.get('/', (req, res) => {
  res.json({ message: 'Care Equity API is running' });
});

/**
 * GET /health
 * Health check endpoint - used to verify server is responding
 * Returns current timestamp
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * GET /db-status
 * Database status endpoint - used for debugging MongoDB connection
 * Returns MongoDB connection state and database info
 * 
 * Try: curl http://localhost:5001/db-status
 */
app.get('/db-status', (req, res) => {
  res.json({
    status: 'OK',
    db: getDBStatus(), // Returns connection state from database.ts
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /test-collections
 * 
 * Debug endpoint to check what collections exist and how many documents are in each
 */
app.get('/test-collections', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.json({ error: 'Database not connected' });
    }
    
    const collections = await db.listCollections().toArray();
    const collectionInfo = await Promise.all(
      collections.map(async (col) => {
        const count = await db.collection(col.name).countDocuments();
        return { name: col.name, count };
      })
    );
    
    res.json({
      database: mongoose.connection.name,
      collections: collectionInfo,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to list collections',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /ratings
 * 
 * Returns all hospitals with their calculated ratings joined together.
 * This endpoint:
 * 1. Fetches all hospitals from the 'hospitals' collection
 * 2. Fetches all ratings from the 'calculatedRatings' collection
 * 3. Joins them by matching hospitalId in ratings to _id in hospitals
 * 4. Returns a combined array with hospital info + rating data
 * 
 * Used by the frontend Quality Ratings page to display the hospital table.
 */
app.get('/ratings', async (req, res) => {
  try {
    // Step 1: Fetch all hospitals from MongoDB
    // .lean() returns plain JavaScript objects (faster, no Mongoose overhead)
    const hospitals = await Hospital.find({}).lean();
    console.log(`[DEBUG] Found ${hospitals.length} hospitals in 'hospitals' collection`);
    
    // Step 2: Fetch all calculated ratings from MongoDB
    const ratings = await CalculatedRating.find({}).lean();
    console.log(`[DEBUG] Found ${ratings.length} ratings in 'CalculatedRatings' collection`);
    
    // Debug: Log first rating to see structure
    if (ratings.length > 0) {
      console.log(`[DEBUG] Sample rating structure:`, JSON.stringify(ratings[0], null, 2));
    }
    
    // Step 3: Create a Map for O(1) lookup performance
    // Maps hospitalId (e.g., "HOSP_001") to its rating object
    // This is faster than nested loops when joining data
    const ratingMap = new Map(ratings.map(r => [r.hospitalId, r]));
    
    // Step 4: Join hospitals with their ratings
    // For each hospital, find its matching rating and combine the data
    const hospitalsWithRatings = hospitals.map(hospital => {
      // Look up the rating for this hospital (returns undefined if not found)
      const rating = ratingMap.get(hospital._id);
      
      // Return combined object with hospital info + rating data
      // Use optional chaining (?.) and nullish coalescing (||) for safe defaults
      return {
        hospitalId: hospital._id,           // Hospital ID (e.g., "HOSP_001")
        name: hospital.name,                // Hospital name
        city: hospital.city,                // City location
        state: hospital.state,              // State location
        location: `${hospital.city}, ${hospital.state}`, // Combined location string
        overallGrade: rating?.overallGrade || 'N/A',     // Overall grade (A-D) or 'N/A' if no rating
        overallScore: rating?.overallScore || null,       // Overall score (0-100) or null
        equityGapScore: rating?.equityGapScore || null,   // Equity gap score or null
        // Extract byGroup data - handle both object and nested structure
        byGroup: rating?.byGroup && typeof rating.byGroup === 'object' && Object.keys(rating.byGroup).length > 0
          ? rating.byGroup
          : {},                   // Ratings by demographic group or empty object
      };
    });
    
    // Step 5: Return success response with joined data
    res.json({
      success: true,
      data: hospitalsWithRatings,          // Array of hospitals with ratings
      count: hospitalsWithRatings.length,  // Total count for frontend display
    });
  } catch (error) {
    // Handle any errors (database connection, query failures, etc.)
    console.error('Error fetching ratings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ratings',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
    });
  }
});

/**
 * GET /hospitals
 * 
 * Returns a list of all hospitals for use in dropdowns/selects.
 * Used by the frontend report form to populate the hospital selection.
 */
app.get('/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.find({}).lean();
    
    // Format hospitals for frontend (simple list with id and name)
    const hospitalList = hospitals.map(hospital => ({
      id: hospital._id,
      name: hospital.name,
      location: `${hospital.city}, ${hospital.state}`,
    }));
    
    res.json({
      success: true,
      data: hospitalList,
      count: hospitalList.length,
    });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hospitals',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /reports
 * 
 * Creates a new anonymous patient report/review.
 * 
 * Request body should contain:
 * - hospitalId: string (required) - ID of the hospital being reviewed
 * - rating: number (required) - Rating from 1-5 (1 = poor, 5 = excellent)
 * - comment: string (required) - Written review/comment (max 5000 chars)
 * 
 * Returns the created report with a success message.
 */
app.post('/reports', async (req, res) => {
  try {
    const { hospitalId, rating, comment } = req.body;
    
    // Validate required fields
    if (!hospitalId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'hospitalId, rating, and comment are required',
      });
    }
    
    // Validate rating is between 1 and 5
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rating',
        message: 'Rating must be a number between 1 and 5',
      });
    }
    
    // Validate comment is not empty
    if (typeof comment !== 'string' || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid comment',
        message: 'Comment cannot be empty',
      });
    }
    
    // Validate hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found',
        message: `Hospital with ID ${hospitalId} does not exist`,
      });
    }
    
    // Create the report
    const report = new PatientReport({
      hospitalId,
      rating,
      comment: comment.trim(),
      isAnonymous: true,
    });
    
    await report.save();
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        id: report._id,
        hospitalId: report.hospitalId,
        rating: report.rating,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit report',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /hospitals/:id/reviews
 * 
 * Returns all reviews for a specific hospital.
 */
app.get('/hospitals/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate hospital exists
    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found',
        message: `Hospital with ID ${id} does not exist`,
      });
    }
    
    // Fetch all reviews for this hospital, sorted by newest first
    const reviews = await PatientReport.find({ hospitalId: id })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      data: reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /hospitals/:id/sentiment
 * 
 * Returns aggregated sentiment analysis for a hospital based on all reviews.
 * Uses a simple algorithm to calculate sentiment from ratings and keywords.
 */
app.get('/hospitals/:id/sentiment', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate hospital exists
    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found',
        message: `Hospital with ID ${id} does not exist`,
      });
    }
    
    // Fetch all reviews for this hospital
    const reviews = await PatientReport.find({ hospitalId: id }).lean();
    
    if (reviews.length === 0) {
      return res.json({
        success: true,
        data: {
          sentiment: 'neutral',
          summary: 'No reviews available yet.',
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
          },
        },
      });
    }
    
    // Calculate average rating
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    // Simple sentiment analysis based on rating
    let sentiment: 'positive' | 'neutral' | 'negative';
    if (averageRating >= 4) {
      sentiment = 'positive';
    } else if (averageRating >= 3) {
      sentiment = 'neutral';
    } else {
      sentiment = 'negative';
    }
    
    // Generate summary from reviews (simple aggregation)
    const allComments = reviews.map(r => r.comment).join(' ');
    const wordCount = allComments.split(/\s+/).length;
    
    // Simple summary based on ratings and common keywords
    let summary = '';
    if (averageRating >= 4.5) {
      summary = 'Patients consistently report excellent experiences with high-quality care and positive interactions.';
    } else if (averageRating >= 4) {
      summary = 'Patients generally report good experiences with mostly positive feedback about care quality.';
    } else if (averageRating >= 3) {
      summary = 'Patients report mixed experiences with both positive and negative aspects noted.';
    } else if (averageRating >= 2) {
      summary = 'Patients report concerns about care quality and overall experience.';
    } else {
      summary = 'Patients report significant concerns and dissatisfaction with care quality.';
    }
    
    // Add review count context
    summary += ` Based on ${reviews.length} review${reviews.length !== 1 ? 's' : ''}.`;
    
    res.json({
      success: true,
      data: {
        sentiment,
        summary,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: reviews.length,
        ratingDistribution: {
          5: reviews.filter(r => r.rating === 5).length,
          4: reviews.filter(r => r.rating === 4).length,
          3: reviews.filter(r => r.rating === 3).length,
          2: reviews.filter(r => r.rating === 2).length,
          1: reviews.filter(r => r.rating === 1).length,
        },
      },
    });
  } catch (error) {
    console.error('Error calculating sentiment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate sentiment',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /articles
 * 
 * Returns all articles/links stored in the database.
 * Used by the frontend links/newsletters page to display research articles.
 */
app.get('/articles', async (req, res) => {
  try {
    const articles = await Article.find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();
    
    res.json({
      success: true,
      data: articles,
      count: articles.length,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch articles',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /articles
 * 
 * Creates a new article/link in the database.
 * 
 * Request body should contain:
 * - title: string (required)
 * - description: string (required)
 * - url: string (required) - must be unique
 * - source: string (required)
 * - date: string (optional)
 */
app.post('/articles', async (req, res) => {
  try {
    const { title, description, url, source, date } = req.body;
    
    // Validate required fields
    if (!title || !description || !url || !source) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'title, description, url, and source are required',
      });
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL',
        message: 'Please provide a valid URL',
      });
    }
    
    // Check if URL already exists
    const existingArticle = await Article.findOne({ url });
    if (existingArticle) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate URL',
        message: 'An article with this URL already exists',
      });
    }
    
    // Create the article
    const article = new Article({
      title: title.trim(),
      description: description.trim(),
      url: url.trim(),
      source: source.trim(),
      date: date ? date.trim() : undefined,
    });
    
    await article.save();
    
    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: article,
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create article',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /articles/seed
 * 
 * Seeds the database with initial articles if the collection is empty.
 * This is a one-time operation to populate initial data.
 */
app.post('/articles/seed', async (req, res) => {
  try {
    // Check if articles already exist
    const existingCount = await Article.countDocuments();
    if (existingCount > 0) {
      return res.json({
        success: true,
        message: 'Articles already exist in database',
        count: existingCount,
      });
    }
    
    // Initial articles to seed
    const initialArticles = [
      {
        title: 'Maternal Mortality Rates by Race and Ethnicity',
        description: 'Data analysis showing that Black women are three times more likely to die from pregnancy-related causes than White women, highlighting systemic healthcare inequities.',
        url: 'https://www.cdc.gov/nchs/data/hestat/maternal-mortality/2021/maternal-mortality-rates-2021.htm',
        source: 'CDC National Center for Health Statistics',
        date: '2021',
      },
      {
        title: 'Healthcare Access and Quality Disparities',
        description: 'Report on how geographic location, socioeconomic status, and race impact access to quality healthcare services and health outcomes.',
        url: 'https://www.ahrq.gov/research/findings/nhqrdr/index.html',
        source: 'Agency for Healthcare Research and Quality',
        date: '2022',
      },
      {
        title: 'Healthcare Provider Bias and Patient Outcomes',
        description: 'Research on how healthcare provider biases, both explicit and implicit, affect treatment decisions and patient outcomes across different demographic groups.',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4843483/',
        source: 'Journal of General Internal Medicine',
        date: '2016',
      },
    ];
    
    // Insert articles
    const insertedArticles = await Article.insertMany(initialArticles);
    
    res.status(201).json({
      success: true,
      message: `Successfully seeded ${insertedArticles.length} articles`,
      count: insertedArticles.length,
    });
  } catch (error) {
    console.error('Error seeding articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed articles',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

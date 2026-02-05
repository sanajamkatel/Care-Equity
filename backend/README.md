# Care Equity Backend

Backend API for the Care Equity project — stores and scores hospital maternal and infant health outcomes across racial/ethnic groups to identify and track healthcare disparities.

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account with connection URI (see `.env` setup)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create or update `.env` in the `backend/` folder:
   ```env
   PORT=5001
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```

3. **Seed database (optional):**
   ```bash
   npm run seed
   ```
   This inserts 4 sample hospital outcomes for testing. Skips if DB already has records.

4. **Start dev server:**
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:5001 with hot reload via nodemon.

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Database Schema

### HospitalOutcome Collection

Stores outcome metrics for a hospital by year and race/ethnicity.

```typescript
{
  _id: ObjectId,
  hospitalId: string,           // e.g., "HOSP_001"
  year: number,                 // e.g., 2025
  maternalMortalityPer100k: {
    Black?: number,
    White?: number,
    Hispanic?: number,
  },
  infantMortalityPer1000: {
    Black?: number,
    White?: number,
    Hispanic?: number,
  },
  severeComplicationsRate: {
    Black?: number,
    White?: number,
    Hispanic?: number,
  },
  cSectionRate: {
    Black?: number,
    White?: number,
    Hispanic?: number,
  },
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
- `hospitalId`
- `year`
- Compound index on `(hospitalId, year)` for efficient lookups

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Hospital Outcomes

#### Create Outcome
```
POST /api/hospital-outcomes
Content-Type: application/json

{
  "hospitalId": "HOSP_001",
  "year": 2025,
  "maternalMortalityPer100k": { "Black": 48, "White": 12, "Hispanic": 16 },
  "infantMortalityPer1000": { "Black": 9.8, "White": 3.5, "Hispanic": 5.2 },
  "severeComplicationsRate": { "Black": 4.2, "White": 1.8, "Hispanic": 2.5 },
  "cSectionRate": { "Black": 34, "White": 26, "Hispanic": 29 }
}
```

**Response:** 201 Created + saved document with `_id`.

#### List/Query Outcomes
```
GET /api/hospital-outcomes
GET /api/hospital-outcomes?hospitalId=HOSP_001
GET /api/hospital-outcomes?year=2025
GET /api/hospital-outcomes?hospitalId=HOSP_001&year=2025
```

**Response:** Array of outcomes, sorted by year descending.

#### Get Single Outcome
```
GET /api/hospital-outcomes/:id
```

Returns outcome by MongoDB ID.

### Scoring

Scoring calculates equity disparities and assigns an equity score (0–100, higher = more equitable).

#### Score Single Outcome
```
GET /api/scores/:id/score
```

**Response:**
```json
{
  "outcome": { ...full outcome object },
  "score": {
    "hospitialId": "HOSP_001",
    "year": 2025,
    "metrics": {
      "maternalMortalityDisparity": 75.0,
      "infantMortalityDisparity": 64.3,
      "complicationsDisparity": 56.67,
      "cSectionDisparity": 30.77
    },
    "overallEquityScore": 56.45
  }
}
```

#### Bulk Score Outcomes
```
GET /api/scores/bulk
GET /api/scores/bulk?hospitalId=HOSP_001
GET /api/scores/bulk?year=2025
```

Returns array of scored outcomes (without full outcome docs, just scores).

### Admin UI

#### Submission Form
```
GET /admin
```

Opens a simple HTML form to submit hospital outcomes manually. Ideal for hospital admins.

#### Submit Outcome (POST)
```
POST /admin/submit
Content-Type: application/x-www-form-urlencoded

hospitalId=HOSP_001&year=2025&maternalMortalityPer100k[Black]=48&...
```

Form data is parsed and saved to DB. Redirects to success or error page.

## Scoring Logic

The equity score measures disparity across racial/ethnic groups for each metric:

1. **Disparity Calculation** (for each metric):
   - Find max and min values across all race/ethnicity groups
   - Calculate: `disparity% = ((max - min) / min) × 100`
   - Example: If Black=48 and White=12, disparity = (48−12)/12 × 100 = 300%

2. **Overall Equity Score**:
   - Average disparities from all 4 metrics
   - Convert to 0–100 scale: `score = 100 − avgDisparity`
   - Example: avg disparity = 56.45%, score = 43.55

**Interpretation:**
- **Score > 80**: Low disparity, more equitable care
- **Score 50–80**: Moderate disparity, room for improvement
- **Score < 50**: High disparity, urgent action needed

## Example Usage

### PowerShell

Create an outcome:
```powershell
$body = @{
  hospitalId = 'HOSP_002'
  year = 2025
  maternalMortalityPer100k = @{ Black = 35; White = 10; Hispanic = 14 }
  infantMortalityPer1000 = @{ Black = 7.5; White = 3.2; Hispanic = 4.8 }
  severeComplicationsRate = @{ Black = 3.2; White = 1.5; Hispanic = 2.1 }
  cSectionRate = @{ Black = 31; White = 24; Hispanic = 27 }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri 'http://localhost:5001/api/hospital-outcomes' `
  -Method Post -Body $body -ContentType 'application/json'
```

Get all scores:
```powershell
Invoke-RestMethod -Uri 'http://localhost:5001/api/scores/bulk' | ConvertTo-Json -Depth 10
```

Score a single outcome:
```powershell
Invoke-RestMethod -Uri 'http://localhost:5001/api/scores/<mongo-id>/score'
```

### curl (Windows)

```bash
curl.exe -X POST http://localhost:5001/api/hospital-outcomes `
  -H "Content-Type: application/json" `
  -d "{\"hospitalId\":\"HOSP_003\",\"year\":2025,...}"

curl.exe http://localhost:5001/api/scores/bulk
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # MongoDB connection
│   ├── models/
│   │   └── HospitalOutcome.ts # Mongoose schema
│   ├── routes/
│   │   ├── hospitalOutcomes.ts
│   │   ├── scores.ts
│   │   └── admin.ts
│   ├── utils/
│   │   └── scoring.ts         # Equity score calculation
│   ├── scripts/
│   │   └── seed.ts            # Database seeder
│   └── server.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

```bash
npm run dev        # Start dev server with hot reload
npm run build      # Compile TypeScript to dist/
npm start          # Run compiled server (production)
npm run seed       # Seed database with sample data
```

## Notes

- **CORS enabled** for all origins (development mode) — restrict in production
- **Database logging** included for debugging connection issues
- **Server continues** if DB connection fails (allows offline testing)
- **Validation** enforces required fields and correct data types
- **Timestamps** (createdAt, updatedAt) auto-managed by Mongoose

## Future Enhancements

- Authentication/authorization for admin endpoints
- Duplicate detection (unique index on hospitalId + year)
- Data import/export (CSV)
- Trend analysis over time
- Comparison/benchmarking across hospitals

# Pleny Brand Data Transformer

A TypeScript tool that cleans, transforms, and seeds brand data for the Pleny technical assessment (Part 2). It takes a messy brands.json file, corrects the data in-place according to a strict Mongoose schema, adds 10 new realistic brand entries using Faker.js, and exports the final collection as JSON.

## What it does

- Reads the original brands.json (10 documents with intentional errors)
- Imports them into MongoDB while preserving original _id values
- Transforms each document in-place (same collection, same _id) by:
  - Extracting brandName from brandName or brand.name
  - Extracting yearFounded from yearFounded, yearCreated, or yearsFounded (converts strings to numbers; falls back to 1600 if missing or invalid)
  - Extracting headquarters from headquarters or hqAddress (falls back to 'Unknown HQ')
  - Extracting numberOfLocations from numberOfLocations, numLocations, or branches (falls back to 1)
- Validates every corrected document against the Mongoose schema (required fields, min/max values)
- Seeds 10 additional brand documents with different edge cases (oldest year, single location, missing HQ, etc.)
- Documents each seed case in an Excel file (seed-documentation.xlsx)
- Exports the whole brands collection to data/brands-final.json

## Technology Stack

- Node.js with TypeScript
- Mongoose – schema validation and database operations
- Faker.js – realistic fake data for seeding
- ExcelJS – generate Excel documentation
- Docker – optional for running MongoDB

## Getting Started

### Prerequisites

- Node.js (version 18 or later)
- MongoDB running locally or via Docker

### Installation

1. Clone the repository
   git clone https://github.com/zuck2001/pleny-brand-transformer.git
   cd pleny-brand-transformer

2. Install dependencies
   npm install

3. Place the original brands.json inside the data/ folder (provided by Pleny)

4. Start MongoDB (using Docker – recommended)
   docker run --name mongodb-brand -p 27017:27017 -d mongodb/mongodb-community-server:latest

5. (Optional) Create a .env file for custom connection string
   MONGO_URI=mongodb://localhost:27017/brand_transformation

## How to run

The main script includes the import step, so run:

npx ts-node src/transformers/transform-brands.ts

This will:
- Connect to MongoDB
- Import data/brands.json if the collection is empty
- Transform every document in-place
- Log progress to the console

Then add the 10 new brands and generate the Excel documentation:

npx ts-node src/seeders/seed-brands.ts

Finally, export the entire collection to JSON:

npx ts-node src/exporters/export-brands.ts

After these steps you will have:
- data/brands-final.json – the complete, corrected collection (20 documents)
- seed-documentation.xlsx – explanation of each seed case

## Project Structure

pleny-brand-transformer/
├── data/
│   ├── brands.json            # original (provided by Pleny)
│   └── brands-final.json      # generated after transformation + seeding
├── src/
│   ├── models/
│   │   └── Brand.ts           # Mongoose schema (exactly as required)
│   ├── transformers/
│   │   └── transform-brands.ts  # import + in-place correction
│   ├── seeders/
│   │   └── seed-brands.ts        # create 10 new brands + Excel doc
│   └── exporters/
│       └── export-brands.ts      # export to JSON
├── seed-documentation.xlsx    # generated
├── .env (optional)
├── package.json
├── tsconfig.json
└── README.md

## Seed Cases (Excel content)

The Excel file describes 10 distinct scenarios:

1. Standard modern brand (year 2010, 150 locations)
2. Very old brand (minimum year 1600, 2 locations)
3. Brand with huge number of locations (5000)
4. Single location brand
5. Brand with current year as founding year
6. Missing headquarters (falls back to random city)
7. Completely random realistic data using Faker
8. Brand with a very long name
9. Brand from an emerging market
10. Year exactly 1800 (near minimum)

## Important Notes

- In-place transformation – the original documents are updated inside the same collection. No data is moved to another database.
- Validation – every corrected document is validated against the schema; warnings are shown but transformation continues.
- Idempotency – running the script again will not re-import the original file (checks countDocuments first).
- No mongoimport required – the script handles importing via Mongoose.

## Evaluation Criteria Met

- Accurate data transformation following the provided schema
- Extraction from alternative field names (yearCreated, hqAddress, brand.name, etc.)
- Use of minimum values when data is missing
- Validation during transformation (Mongoose validateSync)
- Seeding with Faker.js + Excel documentation
- Clean, readable TypeScript code
- Export of final brands-final.json

## Author

Prepared for Pleny, Inc. – Software and Data Engineer Technical Assessment (Part 2)
Karam M. Morgan
import mongoose from 'mongoose';
import { Brand } from '../models/Brand';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/brand_transformation';

function extractYearFounded(doc: any): number {
  const currentYear = new Date().getFullYear();
  const candidates = [doc.yearFounded, doc.yearCreated, doc.yearsFounded];
  for (const val of candidates) {
    if (val !== undefined && val !== null) {
      const num = Number(val);
      if (!isNaN(num) && isFinite(num) && num >= 1600 && num <= currentYear) {
        return num;
      }
    }
  }
  return 1600;
}

function extractNumberOfLocations(doc: any): number {
  const candidates = [doc.numberOfLocations, doc.numLocations, doc.branches];
  for (const val of candidates) {
    if (val !== undefined && val !== null) {
      const num = Number(val);
      if (!isNaN(num) && isFinite(num) && num >= 1) {
        return Math.floor(num);
      }
    }
  }
  return 1;
}

function extractHeadquarters(doc: any): string {
  if (doc.headquarters && typeof doc.headquarters === 'string' && doc.headquarters.trim()) {
    return doc.headquarters.trim();
  }
  if (doc.hqAddress && typeof doc.hqAddress === 'string' && doc.hqAddress.trim()) {
    return doc.hqAddress.trim();
  }
  return 'Unknown HQ';
}

function extractBrandName(doc: any): string {
  if (doc.brandName && typeof doc.brandName === 'string' && doc.brandName.trim()) {
    return doc.brandName.trim();
  }
  if (doc.brand && typeof doc.brand === 'object' && doc.brand.name) {
    return doc.brand.name.trim();
  }
  return 'Unknown Brand';
}

async function importAndTransform() {
  await mongoose.connect(MONGO_URI);
  console.log(' Connected to MongoDB');

  const count = await Brand.countDocuments();
  if (count === 0) {
    console.log(' No brands found. Importing from brands.json...');
    const rawData = fs.readFileSync(path.join(__dirname, '../../data/brands.json'), 'utf-8');
    const docs = JSON.parse(rawData);

    const processedDocs = docs.map((doc: any) => {
      if (doc._id && doc._id.$oid) {
        doc._id = new mongoose.Types.ObjectId(doc._id.$oid);
      }
      return doc;
    });

    for (const doc of processedDocs) {
      const brandDoc = new Brand(doc);
      await brandDoc.save({ validateBeforeSave: false });
    }
    console.log(`📥 Imported ${processedDocs.length} documents.`);
  } else {
    console.log(` Collection already has ${count} documents. Skipping import.`);
  }

  const allDocs = await Brand.find().lean();
  console.log(` Found ${allDocs.length} brands to transform.`);

  for (const doc of allDocs) {
    const corrected = {
      brandName: extractBrandName(doc),
      yearFounded: extractYearFounded(doc),
      headquarters: extractHeadquarters(doc),
      numberOfLocations: extractNumberOfLocations(doc),
    };

    const dummy = new Brand(corrected);
    const validationError = dummy.validateSync();
    if (validationError) {
      console.warn(` Validation warning for ${doc._id}: ${validationError.toString()}`);
    }

    await Brand.updateOne({ _id: doc._id }, { $set: corrected });
    console.log(` Updated brand ${doc._id}`);
  }

  console.log(' Transformation completed (in-place)');
  await mongoose.disconnect();
}

importAndTransform().catch(console.error);
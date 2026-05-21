import mongoose from 'mongoose';
import { Brand } from '../models/Brand';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/brand_transformation';

async function exportBrands() {
  await mongoose.connect(MONGO_URI);
  const brands = await Brand.find().lean();
  const outputPath = path.join(__dirname, '../../data/brands-final.json');
  fs.writeFileSync(outputPath, JSON.stringify(brands, null, 2));
  console.log(` Exported ${brands.length} brands to ${outputPath}`);
  await mongoose.disconnect();
}

exportBrands().catch(console.error);
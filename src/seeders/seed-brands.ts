import mongoose from 'mongoose';
import { Brand } from '../models/Brand';
import { faker } from '@faker-js/faker';
import ExcelJS from 'exceljs';
import path from 'path';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/brand_transformation';

const scenarios = [
  { desc: 'Standard modern brand', year: 2010, locations: 150, hq: 'New York, USA' },
  { desc: 'Very old brand (minimum year)', year: 1600, locations: 2, hq: 'London, UK' },
  { desc: 'Brand with huge locations', year: 2005, locations: 5000, hq: 'Tokyo, Japan' },
  { desc: 'Single location brand', year: 2023, locations: 1, hq: 'Berlin, Germany' },
  { desc: 'Brand with year exactly current year', year: new Date().getFullYear(), locations: 10, hq: 'Paris, France' },
  { desc: 'Missing headquarters (will use fallback)', year: 1990, locations: 45, hq: null },
  { desc: 'Random realistic data (Faker)', year: faker.date.past({ years: 100 }).getFullYear(), locations: faker.number.int({ min: 1, max: 2000 }), hq: faker.location.city() },
  { desc: 'Brand with long name', year: 1985, locations: 80, hq: 'Rome, Italy' },
  { desc: 'Brand from emerging market', year: 2018, locations: 300, hq: 'Mumbai, India' },
  { desc: 'Year 1800 near minimum', year: 1800, locations: 25, hq: 'Madrid, Spain' },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected, seeding new brands...');

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Seed Cases');
  sheet.columns = [
    { header: 'Case ID', key: 'id', width: 10 },
    { header: 'Description', key: 'desc', width: 40 },
    { header: 'Brand Name', key: 'name', width: 30 },
    { header: 'Year Founded', key: 'year', width: 15 },
    { header: 'Number of Locations', key: 'locations', width: 20 },
    { header: 'Headquarters', key: 'hq', width: 30 },
  ];

  for (let i = 0; i < scenarios.length; i++) {
    const s = scenarios[i];
    const brandData = {
      brandName: s.desc.includes('long name') ? faker.company.name() + ' ' + faker.company.buzzPhrase() : (s.desc.includes('Random') ? faker.company.name() : `Brand ${i+1} - ${s.desc}`),
      yearFounded: s.year,
      headquarters: s.hq || faker.location.city() + ', ' + faker.location.country(),
      numberOfLocations: s.locations,
    };
    const created = await Brand.create(brandData);
    console.log(` Seeded: ${created.brandName} (${created._id})`);

    sheet.addRow({
      id: i+1,
      desc: s.desc,
      name: brandData.brandName,
      year: brandData.yearFounded,
      locations: brandData.numberOfLocations,
      hq: brandData.headquarters,
    });
  }

  const excelPath = path.join(__dirname, '../../seed-documentation.xlsx');
  await workbook.xlsx.writeFile(excelPath);
  console.log(` Excel documentation saved to ${excelPath}`);
  await mongoose.disconnect();
}

seed().catch(console.error);
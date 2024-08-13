const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
});

const contactSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  email: { type: String, required: true },
  fax: { type: String },
  website: { type: String },
});

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
});

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  industry: { type: String, required: true }, // Added industry field
  registrationNumber: { type: String, unique: true, required: true }, // Added registration number
  logo: { type: String }, // URL to company logo
  description: { type: String }, // Added company description
  establishedDate: { type: Date, required: true }, // Added established date
  holidays: { type: [String], required: true },
  shifts: { type: [shiftSchema], required: true },
  departments: { type: [String], required: true },
  address: { type: addressSchema, required: true },
  contact: { type: contactSchema, required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  createdAt: { type: Date, default: Date.now }, // Added creation date
  updatedAt: { type: Date, default: Date.now }, // Added updated date
});

module.exports = mongoose.model('Company', companySchema);

// new Company({
//     name: 'Tech Innovators',
//     type: 'Private',
//     industry: 'IT',
//     registrationNumber: '1234567890',
//     logo: 'https://example.com/logo.png',
//     description: 'A leading company in tech innovations.',
//     establishedDate: new Date('2000-01-01'),
//     holidays: ['Saturday', 'Sunday'],
//     shifts: [
//       { start: '08:00', end: '17:00' },
//       { start: '09:00', end: '18:00' },
//     ],
//     departments: ['Engineering', 'Marketing', 'Sales', 'HR'],
//     address: {
//       street: '123 Main St',
//       city: 'Tech City',
//       state: 'CA',
//       zipCode: '12345',
//       country: 'USA',
//     },
//     contact: {
//       phone: '123-456-7890',
//       email: 'info@techinnovators.com',
//       fax: '123-456-7891',
//       website: 'https://techinnovators.com',
//     },
//     adminId: '60d6fe451fc5364d8c8b4567', // Example admin ID
//   });

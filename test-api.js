#!/usr/bin/env node

const http = require('http');

const testData = {
  companyName: "TechFlow Solutions " + Date.now(),
  companyEmail: "admin-" + Date.now() + "@techflow.com",
  industryType: "Software Development",
  companySize: "51-100",
  adminFirstName: "Sarah",
  adminLastName: "Smith",
  adminEmail: "sarah.smith-" + Date.now() + "@techflow.com",
  password: "SecurePass@123!",
  phoneNumber: "+1-555-0199",
  address: "456 Innovation Drive, Tech Park, CA 95110"
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 1969,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('========== REQUEST DATA ==========');
console.log(JSON.stringify(testData, null, 2));
console.log('===================================\n');
console.log('Sending POST request to http://localhost:1969/api/auth/register...\n');

const req = http.request(options, (res) => {
  let data = '';

  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS:`, JSON.stringify(res.headers, null, 2));
  console.log('');

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('========== RESPONSE BODY ==========');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(data);
    }
    console.log('===================================\n');
  });
});

req.on('error', (error) => {
  console.error('\n❌ ERROR: Could not connect to server');
  console.error(`Make sure backend is running on port 1969`);
  console.error(`Error details:`, error.message);
});

req.write(postData);
req.end();

// Keep process alive for 10 seconds
setTimeout(() => {
  console.log('Test completed.');
  process.exit(0);
}, 10000);

/**
 * Company API Test
 * Tests the POST /api/company endpoint to verify company creation
 * 
 * Usage: node test-company-api.js
 */

const http = require('http');

// API Configuration
const API_HOST = 'localhost';
const API_PORT = 1969;
const API_PATH = '/api/company';

// Test data for company creation
const testCompanyData = {
  name: 'Tech Innovators Inc',
  type: 'Private Limited',
  industry: 'Information Technology',
  registrationNumber: 'REG-' + Date.now(), // Unique registration number
  logo: 'https://example.com/logo.png',
  description: 'A leading company in tech innovations and digital transformation.',
  establishedDate: '2020-01-15',
  holidays: ['Saturday', 'Sunday', '2025-12-25', '2025-01-26'],
  shifts: [
    {
      start: '08:00',
      end: '17:00'
    },
    {
      start: '09:00',
      end: '18:00'
    },
    {
      start: '10:00',
      end: '19:00'
    }
  ],
  departments: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'],
  address: {
    street: '123 Innovation Drive',
    city: 'Silicon Valley',
    state: 'California',
    zipCode: '94025',
    country: 'USA'
  },
  contact: {
    phone: '+1-650-253-0000',
    email: 'info@techinnovators.com',
    fax: '+1-650-253-0001',
    website: 'https://techinnovators.com'
  }
};

/**
 * Send POST request to create company
 */
function createCompany() {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify(testCompanyData);

    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: API_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonData)
      }
    };

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🚀 TESTING COMPANY CREATION API');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log(`📍 Endpoint: POST http://${API_HOST}:${API_PORT}${API_PATH}\n`);
    
    console.log('📦 Request Payload:');
    console.log(JSON.stringify(testCompanyData, null, 2));
    console.log('\n───────────────────────────────────────────────────────────\n');

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`✅ Response Status: ${res.statusCode} ${res.statusMessage}\n`);
        console.log('📥 Response Headers:');
        Object.entries(res.headers).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
        console.log('\n📊 Response Body:');
        
        try {
          const responseData = JSON.parse(data);
          console.log(JSON.stringify(responseData, null, 2));
          
          // Additional analysis
          console.log('\n═══════════════════════════════════════════════════════════');
          if (res.statusCode === 201 || res.statusCode === 200) {
            console.log('✨ SUCCESS: Company created successfully!');
            console.log('\n🎯 Created Company Details:');
            if (responseData.data) {
              console.log(`   - Company ID: ${responseData.data._id || 'N/A'}`);
              console.log(`   - Name: ${responseData.data.name || 'N/A'}`);
              console.log(`   - Type: ${responseData.data.type || 'N/A'}`);
              console.log(`   - Industry: ${responseData.data.industry || 'N/A'}`);
              console.log(`   - Registration #: ${responseData.data.registrationNumber || 'N/A'}`);
              console.log(`   - Established: ${responseData.data.establishedDate || 'N/A'}`);
              console.log(`   - Contact Email: ${responseData.data.contact?.email || 'N/A'}`);
              console.log(`   - Departments: ${responseData.data.departments?.length || 0}`);
              console.log(`   - Shifts: ${responseData.data.shifts?.length || 0}`);
            }
          } else {
            console.log('❌ ERROR: Failed to create company');
            console.log(`   Status Code: ${res.statusCode}`);
            if (responseData.message) {
              console.log(`   Message: ${responseData.message}`);
            }
          }
          console.log('═══════════════════════════════════════════════════════════\n');
        } catch (e) {
          console.log(data);
          console.log('\n⚠️  Response is not valid JSON\n');
        }

        resolve({
          status: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Error:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.error('\n⚠️  Cannot connect to API server.');
        console.error(`   Make sure the server is running on http://${API_HOST}:${API_PORT}`);
        console.error(`   Command: npm start or nodemon in the node-api directory\n`);
      }
      reject(error);
    });

    req.write(jsonData);
    req.end();
  });
}

/**
 * Run the test
 */
async function runTest() {
  try {
    await createCompany();
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
runTest();

const http = require('http');

const testData = {
  companyName: "Tech Innovations Ltd",
  companyEmail: "admin@techinnovations.com",
  industryType: "Information Technology",
  companySize: "51-100",
  adminFirstName: "John",
  adminLastName: "Doe",
  adminEmail: "john.doe@techinnovations.com",
  password: "SecurePass@123",
  phoneNumber: "+1-555-0123",
  address: "123 Tech Street, Silicon Valley, CA 94025"
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 1969,
  path: '/api/auth/register-company',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';

  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS:`, JSON.stringify(res.headers, null, 2));

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n========== RESPONSE BODY ==========');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(data);
    }
    console.log('===================================\n');
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
  process.exit(1);
});

console.log('========== REQUEST DATA ==========');
console.log(JSON.stringify(testData, null, 2));
console.log('===================================\n');
console.log('Sending POST request to /api/auth/register-company...\n');

req.write(postData);
req.end();

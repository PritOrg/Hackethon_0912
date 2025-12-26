/**
 * Quick script to check database for employees
 * Run with: node test-db-check.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./schemas/employee');
const bcrypt = require('bcryptjs');

async function checkDatabase() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ems_db';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Find all employees
    const employees = await Employee.find({}).select('+password');
    console.log(`\n📊 Total employees in database: ${employees.length}\n`);

    if (employees.length === 0) {
      console.log('⚠️  No employees found. You need to register a company first!');
    } else {
      employees.forEach((emp, index) => {
        console.log(`--- Employee ${index + 1} ---`);
        console.log(`Email: ${emp.email}`);
        console.log(`Name: ${emp.firstName} ${emp.lastName}`);
        console.log(`Role: ${emp.role}`);
        console.log(`Status: ${emp.status}`);
        console.log(`EmpCode: ${emp.empCode}`);
        console.log(`Has Password: ${!!emp.password} (length: ${emp.password?.length})`);
        console.log(`CompanyId: ${emp.companyId}`);
        console.log('');
      });

      // Check specific email
      const testEmail = 'testadmin@gmail.com';
      const testPassword = 'Prit@007';
      const testEmployee = await Employee.findOne({ email: testEmail }).select('+password');
      
      if (testEmployee) {
        console.log(`✅ Found employee with email: ${testEmail}`);
        const isMatch = await bcrypt.compare(testPassword, testEmployee.password);
        console.log(`Password "${testPassword}" matches: ${isMatch}`);
      } else {
        console.log(`❌ No employee found with email: ${testEmail}`);
        console.log('   You need to register with this email first!');
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Database check complete');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDatabase();

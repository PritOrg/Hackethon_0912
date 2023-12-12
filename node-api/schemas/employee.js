const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: String,
    createdAt: Date,
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
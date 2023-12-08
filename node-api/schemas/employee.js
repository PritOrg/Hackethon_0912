const mongoose = require('mongoose')

const Employee = new mongoose.Schema({
    "username": String,
    "email": String,
    "password": String, // Hashed password
    "role" : String, // Role (e.g., employee, manager, admin)
    "createdAt": Date,
})

module.exports = new mongoose.model('Employee', Employee);
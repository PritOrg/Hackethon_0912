const mongoose = require('mongoose')

const Holiday = new mongoose.Schema({
    "id": String,
    "name": String,
    "date": Date,
    "createdAt": Date,
  });
  module.exports = new mongoose.model('Holiday' , Holiday);

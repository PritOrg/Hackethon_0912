const mongoose = require('mongoose')

<<<<<<< Updated upstream
const Employee = new mongoose.Schema({
  "id" : String,
  "name" : String,
  "date" : Date,
  "createdAt" : Date
})

module.exports = new mongoose.model('Holiday', Holiday);
=======
const Holiday = new mongoose.Schema({
    "id": String,
    "name": String,
    "date": Date,
    "createdAt": Date,
  });
  module.exports = new mongoose.model('Holiday' , Holiday);
>>>>>>> Stashed changes

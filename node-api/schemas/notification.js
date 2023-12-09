const mongoose = require('mongoose')

<<<<<<< Updated upstream
const LeaveRequest = new mongoose.Schema({
  "id" : String,
  "userId" : String,
  "message" : String,
  "isRead" : Boolean,
  "createdAt" : Date
  });
module.exports = new mongoose.model('Notification', Notification);
  
=======
const Notification = new mongoose.Schema({
    "id" : String,
    "userId" : String,
    "message" : String,
    "isRead" : Boolean,
    "createdAt" : Date,
  });
  module.exports = new mongoose.model('Notification' , Notification);
>>>>>>> Stashed changes

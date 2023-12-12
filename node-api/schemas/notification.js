const mongoose = require('mongoose')

const Notification = new mongoose.Schema({
    "id" : String,
    "userId" : String,
    "message" : String,
    "isRead" : Boolean,
    "createdAt" : Date,
  });
  module.exports = new mongoose.model('Notification' , Notification);

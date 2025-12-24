const mongoose = require('mongoose')

const Holiday = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },

  "id": String,
  "name": String,
  "date": Date,
  "createdAt": Date,
});
module.exports = new mongoose.model('Holiday', Holiday);

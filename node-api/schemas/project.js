const projectSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    assignedEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }], // Array of employee IDs
    status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' },
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('Project', projectSchema);
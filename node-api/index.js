const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const conStr = 'mongodb+srv://PritVasani:PritVasani@cluster1.b6zbc02.mongodb.net/LMS_DATABASE';

mongoose.connect(conStr).then(() => {
  console.log('Connection to mongoose successfully.');

  const app = express();

  const corsOptions = {
    origin: 'http://localhost:4200', // Replace with your frontend's origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));
  app.use(express.json()); // Parse JSON in the request body

  const employeeRoutes = require('./routes/employeeRoutes');
  const leaveRequestRoutes = require('./routes/leaveRequestsRoutes');
  const leaveBalanceRoutes = require('./routes/leaveBalanceRoute');
  const approvalRoutes = require('./routes/approvalRoutes');
  const holidayRoutes  = require('./routes/holidayRoutes');
  const notificationRoutes = require('./routes/notificationRoutes');

  app.use('/leave-requests', leaveRequestRoutes);
  app.use('/leave-balance' , leaveBalanceRoutes);
  app.use('/approval' , approvalRoutes);
  app.use('/holiday' , holidayRoutes);
  app.use('/notification' , notificationRoutes);
  app.use('/', employeeRoutes);

  app.listen(1969, () => {
    console.log('API running on http://localhost:1969/');
  });
});

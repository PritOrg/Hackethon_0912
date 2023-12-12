const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const conStr = 'mongodb+srv://penta-hacktivist:hacktivist@cluster0.xlxf9b4.mongodb.net/';

mongoose.connect(conStr).then(() => {
  console.log('Connection to mongoose successfully.');

  const app = express();
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  // const corsOptions = {
  //   origin: 'http://localhost:4200', // Replace with your frontend's origin
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true,
  //   optionsSuccessStatus: 204,
  // };

  // app.use(cors(corsOptions));
  app.use(bodyParser.urlencoded({ extended: false }));

  const employeeRoutes = require('./routes/employeeRoutes');
  const leaveRequestRoutes = require('./routes/leaveRequestsRoutes');
  const leaveBalanceRoutes = require('./routes/leaveBalanceRoute');
  const approvalRoutes = require('./routes/approvalRoutes');
  const holidayRoutes  = require ('./routes/holidayRoutes');
  const notificationRoutes = require ('./routes/notificationRoutes');

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

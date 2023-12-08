const express = require('express');
const bodyParser = require('body-parser');
const { Types } = require('mongoose');
const { ObjectId } = Types;
const mongoose = require('mongoose');

const conStr = 'mongodb+srv://penta-hacktivist:hacktivist@cluster0.xlxf9b4.mongodb.net/';

mongoose.connect(conStr).then( 
    ()=>{
        console.log('connection to mongoose successfully.')

        const app = express();
        app.use(bodyParser.urlencoded({ extended: false }))
        const Employee = require('./employee');
        const LeaveRequest = require('./leave-request')
        // getAll for Employee Object
        app.get('/employee', async (req, res) => {
            try {
                const employee = await Employee.find();
                res.json(employee);
                console.log(employee);
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        })

        // getAll for LeaveRequest Object
        app.get('/leave-requests', async (req, res) => {
            try {
                const leaveRequest = await LeaveRequest.find();
                res.json(leaveRequest);
                console.log(leaveRequest);
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        })

        // adding data of employee object
        app.post('/employee', async (req, res) => {
            try {
                const employeeData = req.body;
            
                // Generate a new ObjectId
                const objectId = new ObjectId();
            
                // Add the generated ObjectId to the employeeData
                employeeData._id = objectId;
            
                const newEmployee = new Employee(employeeData);
            
                await newEmployee.save();
                res.status(201).json(newEmployee);
              } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Internal Server Error' });
              }
        });

        app.listen(1969,()=>{
            console.log('API running on http://localhost:1969/')
        })
    }
)
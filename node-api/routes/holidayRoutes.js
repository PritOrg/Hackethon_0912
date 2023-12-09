const express = require('express');
const router = express.Router();
const { Types } = require('mongoose');
const { ObjectId } = Types;
const Holiday = require('../schemas/holiday');

// getAll for holiday Object
router.get('/', async (req, res) => {
  try {
    const holiday = await Holiday.find();
    res.json(holiday);
    console.log(holiday);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//get By id
router.get('/:id', async (req, res) => {
  try {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: 'Invalid ID format' });
      }

      const holidayRequest = await Holiday.findOne({ _id: id });
      if (!holidayRequest) {
          return res.status(404).json({ message: 'Person not found' });
      }
      res.json(holidayRequest);
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// adding data of Holiday object
router.post('/', async (req, res) => {
  try {
    const holidayData = req.body;
  
    // Generate a new ObjectId
    const objectId = new ObjectId();
  
    // Add the generated ObjectId to the holidayData
    holidayData._id = objectId;
  
    const newHoliday = new Holiday(holidayData);
  
    await newHoliday.save();
    res.status(201).json(newHoliday);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.patch('/:id', async (req, res) => {
    const id = req.params.id;
    const updatedData = {
    "id": String,
    "name": String,
    "date": Date,
    "createdAt": Date,
    };
    try {
        const updatedHoliday = await Holiday.findOneAndUpdate({ _id: id }, updatedData, {
            new: false,
        });
        if (!updatedHoliday) {
            return res.status(404).json({ message: 'Holiday not found' });
        }
        res.json(updatedHoliday);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Delete 
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const deletedHoliday = await Holiday.findOneAndDelete({ _id: id });
        if (!deletedHoliday) {
            return res.status(404).json({ message: 'Holiday not found' });
        }
        res.json({ message: 'Holiday deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;

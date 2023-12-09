<<<<<<< Updated upstream
holidayRoutes



=======
>>>>>>> Stashed changes
const express = require('express');
const router = express.Router();
const { Types } = require('mongoose');
const { ObjectId } = Types;
const Notification = require('../schemas/holiday');

// getAll for Notification Object
router.get('/', async (req, res) => {
  try {
    const notification = await Notification.find();
    res.json(notification);
    console.log(notification);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//get By id
app.get('/:id', async (req, res) => {
  try {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: 'Invalid ID format' });
      }

      const notificationRequest = await Notification.findOne({ _id: id });
      if (!notificationRequest) {
          return res.status(404).json({ message: 'Person not found' });
      }
      res.json(notificationRequest);
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// adding data of Notification object
router.post('/', async (req, res) => {
  try {
    const notificationData = req.body;
  
    // Generate a new ObjectId
    const objectId = new ObjectId();
  
    // Add the generated ObjectId to the notificationData
    notificationData._id = objectId;
  
    const newNotification = new Notification(notificationData);
  
    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.patch('/:id', async (req, res) => {
    const id = req.params.id;
    const updatedData = {
    "id" : String,
    "userId" : String,
    "message" : String,
    "isRead" : Boolean,
    "createdAt" : Date,
    };
    try {
        const updatedNotification = await Notification.findOneAndUpdate({ _id: id }, updatedData, {
            new: false,
        });
        if (!updatedNotification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json(updatedNotification);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Delete 
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const deletedNotification = await Notification.findOneAndDelete({ _id: id });
        if (!deletedNotification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes

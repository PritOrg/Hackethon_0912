const express = require('express');
const router = express.Router();
const PerformanceReview = require('../schemas/performanceReview');
const Employee = require('../schemas/employee_v2');
const authMiddleware = require('./auth.middleware');

// Create new performance review
router.post('/', authMiddleware, async (req, res) => {
  try {
    const reviewData = req.body;
    
    if (!reviewData.companyId || !reviewData.employeeId || !reviewData.reviewerId || !reviewData.reviewType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate employee exists
    const employee = await Employee.findOne({ 
      _id: reviewData.employeeId,
      companyId: reviewData.companyId,
      isDeleted: false 
    });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Validate reviewer exists
    const reviewer = await Employee.findOne({ 
      _id: reviewData.reviewerId,
      companyId: reviewData.companyId,
      isDeleted: false 
    });
    if (!reviewer) {
      return res.status(404).json({ message: 'Reviewer not found' });
    }

    const review = new PerformanceReview({
      ...reviewData,
      createdBy: req.user?.id
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reviews for a company
router.get('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status, reviewType, employeeId } = req.query;

    const filter = { companyId };
    if (status) filter.status = status;
    if (reviewType) filter.reviewType = reviewType;
    if (employeeId) filter.employeeId = employeeId;

    const reviews = await PerformanceReview.find(filter)
      .populate('employeeId', 'firstName lastName empCode position department')
      .populate('reviewerId', 'firstName lastName empCode')
      .sort({ reviewDate: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for an employee
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;

    const reviews = await PerformanceReview.find({ employeeId })
      .populate('reviewerId', 'firstName lastName empCode')
      .sort({ reviewDate: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get review by ID
router.get('/:id', async (req, res) => {
  try {
    const review = await PerformanceReview.findById(req.params.id)
      .populate('employeeId', 'firstName lastName empCode position department email')
      .populate('reviewerId', 'firstName lastName empCode position')
      .populate('peerFeedback.peerId', 'firstName lastName empCode')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Calculate weighted score
    const weightedScore = review.calculateWeightedScore();

    res.json({ ...review.toObject(), weightedScore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update review
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const review = await PerformanceReview.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    updates.updatedBy = req.user?.id;
    Object.assign(review, updates);
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit review (change status)
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const review = await PerformanceReview.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.status !== 'Draft') {
      return res.status(400).json({ message: 'Review has already been submitted' });
    }

    review.status = 'Submitted';
    review.updatedBy = req.user?.id;
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Employee acknowledges review
router.post('/:id/acknowledge', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const review = await PerformanceReview.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.status !== 'Completed') {
      return res.status(400).json({ message: 'Review must be completed before acknowledgment' });
    }

    review.employeeAcknowledged = true;
    review.employeeAcknowledgedDate = new Date();
    review.employeeComments = comments;
    review.status = 'Acknowledged';
    review.updatedBy = req.user?.id;

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add peer feedback
router.post('/:id/peer-feedback', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { peerId, peerName, rating, comments } = req.body;

    if (!peerId || !rating || !comments) {
      return res.status(400).json({ message: 'Peer ID, rating, and comments are required' });
    }

    const review = await PerformanceReview.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.peerFeedback.push({
      peerId,
      peerName,
      rating,
      comments,
      submittedDate: new Date()
    });

    review.updatedBy = req.user?.id;
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add self-assessment
router.post('/:id/self-assessment', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const selfAssessmentData = req.body;

    const review = await PerformanceReview.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.selfAssessment = {
      ...selfAssessmentData,
      submittedDate: new Date()
    };

    review.updatedBy = req.user?.id;
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get overdue reviews for company
router.get('/company/:companyId/overdue', async (req, res) => {
  try {
    const { companyId } = req.params;

    const reviews = await PerformanceReview.find({ 
      companyId,
      status: { $ne: 'Completed' }
    })
      .populate('employeeId', 'firstName lastName empCode')
      .populate('reviewerId', 'firstName lastName');

    const overdueReviews = reviews.filter(review => review.isOverdue());

    res.json(overdueReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

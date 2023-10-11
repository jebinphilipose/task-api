const express = require('express');
const taskRoutes = require('./task');

const router = express.Router();

// Ready call for health check
router.get('/ready', (req, res) => res.send('API is up and running!'));

// Register task routes
router.use('/tasks', taskRoutes);

module.exports = router;

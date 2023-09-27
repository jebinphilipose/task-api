const express = require('express');
const { validate } = require('express-validation');
const taskValidations = require('../validations/task');
const controller = require('../controllers/Task');

const router = express.Router();

// Create a task
router.post('/', validate(taskValidations.createTask), controller.createTask);

// Update a task
router.put('/:id', validate(taskValidations.updateTask), controller.updateTask);

module.exports = router;

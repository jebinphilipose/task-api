const { PrismaClient } = require('@prisma/client');
const requestError = require('../loaders/requestError');

const prisma = new PrismaClient();

module.exports = {
  createTask: async (req, res) => {
    const { description, status } = req.body;
    const task = await prisma.tasks.create({
      data: {
        description,
        status,
      },
    });
    res.status(201).json(task);
  },
  updateTask: async (req, res) => {
    const { description, status } = req.body;
    if (!description && !status) {
      return res.status(400).json(requestError(400, 'Empty body - Please input description or status'));
    }
    const task = await prisma.tasks.update({
      where: {
        id: req.params.id,
      },
      data: {
        description,
        status,
      },
    });
    if (!task) {
      return res.status(400).json(requestError(400, 'Record to update not found'));
    }
    return res.status(200).json(task);
  },
  getTasks: async (req, res) => {
    let { page = 1, limit = 10 } = req.query;
    const DECIMAL_RADIX = 10;
    page = parseInt(page, DECIMAL_RADIX);
    limit = parseInt(limit, DECIMAL_RADIX);
    if (page < 1) return res.status(400).json(requestError(400, "Page can't be negative or zero"));
    const tasksToSkip = (page - 1) * limit;
    const tasks = await prisma.tasks.findMany({
      skip: tasksToSkip,
      take: limit,
    });
    return res.status(200).json({
      tasks,
      page,
      count: tasks.length,
    });
  },
};

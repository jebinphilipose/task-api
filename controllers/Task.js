const { PrismaClient } = require('@prisma/client');

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
};

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
  getMetrics: async (req, res) => {
    const { type = 'count-by-status' } = req.query;
    if (type === 'count-by-status') {
      let metrics = await prisma.$queryRaw`
        WITH status_counts AS
          (SELECT status,
                  COUNT(status)
          FROM tasks
          GROUP BY status),
            statuses AS
          (SELECT unnest(enum_range(NULL::status)) AS status)
        SELECT s.status,
              coalesce(c.count, 0) AS COUNT
        FROM status_counts c
        RIGHT JOIN statuses s ON c.status = s.status;
      `;
      metrics = metrics.reduce((acc, m) => {
        const key = `${m.status.toLowerCase()}_tasks`;
        acc[key] = Number(m.count);
        return acc;
      }, {});
      return res.status(200).json(metrics);
    }
    if (type === 'count-by-timeline') {
      let metrics = await prisma.$queryRaw`
        WITH month_counts AS
          (SELECT To_char(month_year, 'Month YYYY') AS month_year,
                  status,
                  count
          FROM
            (SELECT Date_trunc('month', created_at) AS month_year,
                    status,
                    Count(status) AS count
              FROM tasks
              GROUP BY month_year,
                      status
              ORDER BY month_year,
                      status) sq),
            months AS
          (SELECT DISTINCT month_year AS month_year
          FROM month_counts),
            month_statuses AS
          (SELECT *
          FROM months
          CROSS JOIN
            (SELECT unnest(enum_range(NULL::status)) AS status))
        SELECT m.month_year,
              m.status,
              COALESCE(c.count, 0) AS count
        FROM month_counts c
        RIGHT JOIN month_statuses m ON c.month_year = m.month_year
        AND c.status = m.status
        ORDER BY to_date(m.month_year, 'Month YYYY'),
                status;
      `;
      metrics = metrics.reduce((acc, m) => {
        if (!acc[m.month_year]) {
          acc[m.month_year] = {};
        }
        acc[m.month_year][`${m.status.toLowerCase()}_tasks`] = Number(m.count);
        return acc;
      }, {});
      metrics = Object.keys(metrics).map((date) => ({
        date,
        metrics: metrics[date],
      }));
      return res.status(200).json(metrics);
    }
  },
};

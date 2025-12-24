const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const formatTask = (task) => {
  if (!task) return null;
  return {
    ...task,
    dueDate: task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate,
    createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt,
    updatedAt: task.updatedAt instanceof Date ? task.updatedAt.toISOString() : task.updatedAt,
  };
};

const tasks = async (_, { filter }, { prisma, user }) => {
  const where = {};

  if (filter) {
    if (filter.status) where.status = filter.status;
    if (filter.priority) where.priority = filter.priority;
    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: "insensitive" } },
        { description: { contains: filter.search, mode: "insensitive" } },
      ];
    }
    if (filter.assignedToId) where.assignedToId = filter.assignedToId;
    if (filter.createdById) where.createdById = filter.createdById;
    if (filter.dueDate) {
        const startOfDay = dayjs.utc(filter.dueDate).startOf('day').toDate();
        const endOfDay = dayjs.utc(filter.dueDate).endOf('day').toDate();
        where.dueDate = {
            gte: startOfDay,
            lte: endOfDay
        };
    }
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: true,
      assignedTo: true
    }
  });

  return tasks.map(formatTask);
};

const task = async (_, { id }, { prisma }) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      createdBy: true,
      assignedTo: true
    }
  });
  if (!task) throw new Error('Task not found');
  return formatTask(task);
};

module.exports = {
  tasks,
  task
};

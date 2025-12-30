const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const { sendPushNotification } = require('../../utils/notifications');
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

const createTask = async (_, { input }, { prisma, user: authUser }) => {
  if (!authUser) throw new Error('Not authenticated');

  const { title, description, status, priority, dueDate, assignedToId } = input;

  const data = {
    title,
    description,
    status: status || 'PENDING',
    priority: priority || 'MEDIUM',
    createdById: authUser.id,
  };

  // Ensure dueDate is stored as UTC Midnight to prevent timezone shifting
  if (dueDate) data.dueDate = dayjs.utc(dueDate).startOf('day').toDate();

  if (assignedToId) {
    const assignee = await prisma.user.findUnique({ where: { id: assignedToId } });
    if (!assignee) throw new Error('Assigned user not found');
    data.assignedToId = assignedToId;
  }

  const task = await prisma.task.create({
    data,
    include: {
      createdBy: true,
      assignedTo: true
    }
  });

  // Notification Logic
  if (task.assignedToId && task.assignedToId !== authUser.id && task.assignedTo?.pushToken) {
    sendPushNotification(
      task.assignedTo.pushToken,
      'New Task Assigned',
      `${authUser.name || 'Someone'} assigned you a new task: ${task.title}`,
      { taskId: task.id }
    );
  }

  return formatTask(task);
};

const buildUpdateData = (input, isCreatorOrAdmin) => {
  const { title, description, status, priority, dueDate, assignedToId } = input;
  const data = {};

  // Status can be updated by any authorized user (Creator, Admin, or Assignee)
  if (status !== undefined) {
    data.status = status;
  }

  // If user is not Creator or Admin (meaning they are just Assignee), they can't update other fields
  if (!isCreatorOrAdmin) {
    return data;
  }

  // Creator or Admin can update all other fields
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (priority !== undefined) data.priority = priority;
  if (dueDate !== undefined) data.dueDate = dayjs.utc(dueDate).startOf('day').toDate();
  if (assignedToId !== undefined) data.assignedToId = assignedToId;

  return data;
};

const updateTask = async (_, { input }, { prisma, user: authUser }) => {
  if (!authUser) throw new Error('Not authenticated');

  const { id } = input;
  const existingTask = await prisma.task.findUnique({ where: { id } });

  if (!existingTask) throw new Error('Task not found');

  const isCreator = existingTask.createdById === authUser.id;
  const isAssignee = existingTask.assignedToId === authUser.id;
  const isAdmin = authUser.role === 'ADMIN';

  if (!isCreator && !isAssignee && !isAdmin) {
    throw new Error('Not authorized to update this task');
  }

  const data = buildUpdateData(input, isCreator || isAdmin);

  const task = await prisma.task.update({
    where: { id },
    data,
    include: {
      createdBy: true,
      assignedTo: true
    }
  });

  return formatTask(task);
};

const deleteTask = async (_, { id }, { prisma, user: authUser }) => {
  if (!authUser) throw new Error('Not authenticated');

  const existingTask = await prisma.task.findUnique({ where: { id } });
  if (!existingTask) throw new Error('Task not found');

  const isCreator = existingTask.createdById === authUser.id;
  const isAdmin = authUser.role === 'ADMIN';

  if (!isCreator && !isAdmin) {
    throw new Error('Not authorized to delete this task');
  }

  const task = await prisma.task.delete({
    where: { id },
    include: {
      createdBy: true,
      assignedTo: true
    }
  });

  return formatTask(task);
};

module.exports = {
  createTask,
  updateTask,
  deleteTask
};

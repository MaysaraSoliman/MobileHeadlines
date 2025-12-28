const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const { sendPushNotification } = require('../../utils/pushNotifications');

const formatTask = (task) => {
  if (!task) return null;
  return {
    ...task,
    dueDate: task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate,
    createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt,
    updatedAt: task.updatedAt instanceof Date ? task.updatedAt.toISOString() : task.updatedAt,
  };
};

const sendTaskAssignmentNotification = async (prisma, task) => {
  try {
    const assignedUser = await prisma.user.findUnique({
      where: { id: task.assignedToId },
    });
    if (assignedUser?.expoPushToken) {
      await sendPushNotification(
        assignedUser.expoPushToken,
        "New Task Assigned",
        task.title,
        { taskId: task.id }
      );
    }
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
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

  if (dueDate) data.dueDate = new Date(dueDate);
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

  if (task.assignedToId && task.assignedToId !== authUser.id) {
    await sendTaskAssignmentNotification(prisma, task);
  }

  return formatTask(task);
};

const prepareTaskUpdateData = (input, existingTask, authUser) => {
  const { title, description, status, priority, dueDate, assignedToId } = input;
  const isCreator = existingTask.createdById === authUser.id;
  const isAssignee = existingTask.assignedToId === authUser.id;
  const isAdmin = authUser.role === 'ADMIN';

  if (!isCreator && !isAssignee && !isAdmin) {
    throw new Error('Not authorized to update this task');
  }

  const data = {};

  if (isCreator || isAdmin) {
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (priority !== undefined) data.priority = priority;
    if (dueDate !== undefined) data.dueDate = new Date(dueDate);
    if (assignedToId !== undefined) data.assignedToId = assignedToId;
    if (status !== undefined) data.status = status;
  } else if (isAssignee) {
    if (status !== undefined) data.status = status;
  }
  return data;
};

const updateTask = async (_, { input }, { prisma, user: authUser }) => {
  if (!authUser) throw new Error('Not authenticated');

  const { id } = input;

  const existingTask = await prisma.task.findUnique({ where: { id } });
  if (!existingTask) throw new Error('Task not found');

  const data = prepareTaskUpdateData(input, existingTask, authUser);

  const task = await prisma.task.update({
    where: { id },
    data,
    include: {
      createdBy: true,
      assignedTo: true
    }
  });

  if (
    task.assignedToId &&
    task.assignedToId !== existingTask.assignedToId &&
    task.assignedToId !== authUser.id
  ) {
    await sendTaskAssignmentNotification(prisma, task);
  }

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

const saveExpoPushToken = async (_, { token }, { prisma, user: authUser }) => {
  if (!authUser) throw new Error('Not authenticated');

  if (!token) throw new Error('Token is required');

  try {
    await prisma.user.update({
      where: { id: authUser.id },
      data: { expoPushToken: token },
    });
    return true;
  } catch (error) {
    console.error('Error saving Expo push token:', error);
    throw new Error('Failed to save push token');
  }
};

module.exports = { saveExpoPushToken };

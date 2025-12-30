const registerPushToken = async (_, { token }, { prisma, user }) => {
  if (!user) {
    throw new Error('Not authenticated');
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { pushToken: token },
    });
    console.log(`📱 Registered push token for user ${user.id}`);
    return true;
  } catch (error) {
    console.error('Error registering push token:', error);
    return false;
  }
};

module.exports = {
  registerPushToken,
};


const updateUser = async (parent, { input }, context) => {
    const user = await context.prisma.user.findUnique({
        where: { id: context.userId },
    });

    if (!user) {
        throw new Error('No such user found');
    }

    const updatedUser = await context.prisma.user.update({
        where: { id: user.id },
        data: input,
    });

    return {
        user: updatedUser,
    };
};

module.exports = {
    updateUser,
};

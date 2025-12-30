const { withFilter } = require('graphql-subscriptions');
const { prisma } = require('../../context');
const pubsub = require('../../pubsub');

const resolvers = {
  Query: {
    myChats: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');

      return await prisma.chat.findMany({
        where: {
          participants: {
            some: {
              userId: user.id
            }
          }
        },
        include: {
          participants: {
            include: {
              user: true
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
    },
    chatMessages: async (_, { chatId }, { user }) => {
      if (!user) throw new Error('Not authenticated');

      // Verify participation
      const participation = await prisma.chatParticipant.findUnique({
        where: {
          chatId_userId: {
            chatId,
            userId: user.id
          }
        }
      });

      if (!participation) throw new Error('Not authorized to view this chat');

      return await prisma.message.findMany({
        where: { chatId },
        include: {
          sender: true,
          chat: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }
  },
  Mutation: {
    createChat: async (_, { userIds, name }, { user }) => {
      if (!user) throw new Error('Not authenticated');

      const allUserIds = [...new Set([...userIds, user.id])];

      // Check if 1-on-1 chat already exists
      if (allUserIds.length === 2) {
        const otherUserId = allUserIds.find(id => id !== user.id);
        const existingChat = await prisma.chat.findFirst({
          where: {
            AND: [
              { participants: { some: { userId: user.id } } },
              { participants: { some: { userId: otherUserId } } },
              // We want to ensure it's a 1-on-1 chat, not just a group chat containing these two.
              // Assuming 1-on-1 chats have exactly 2 participants.
              // This logic can be refined if you have an 'isGroup' flag (which we added).
              { isGroup: false }
            ]
          },
          include: {
            participants: {
              include: { user: true }
            }
          }
        });

        if (existingChat) {
          return existingChat;
        }
      }

      const chat = await prisma.chat.create({
        data: {
          name,
          participants: {
            create: allUserIds.map(id => ({
              userId: id
            }))
          }
        },
        include: {
          participants: {
            include: { user: true }
          }
        }
      });

      return chat;
    },
    sendMessage: async (_, { chatId, content }, { user }) => {
      if (!user) throw new Error('Not authenticated');

      const participation = await prisma.chatParticipant.findUnique({
        where: {
          chatId_userId: {
            chatId,
            userId: user.id
          }
        }
      });

      if (!participation) throw new Error('Not authorized to send message to this chat');

      const message = await prisma.message.create({
        data: {
          content,
          chatId,
          senderId: user.id
        },
        include: {
          sender: true,
          chat: {
            include: {
              participants: true
            }
          }
        }
      });

      // Update chat updatedAt
      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() }
      });

      pubsub.publish('MESSAGE_SENT', {
        messageSent: message
      });

      return message;
    }
  },
  Subscription: {
    messageSent: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator(['MESSAGE_SENT']),
        (payload, variables, context) => {
          // payload.messageSent is the message object
          // variables.chatId is what the client subscribed to
          return payload.messageSent.chatId === variables.chatId;
        }
      )
    },
    messageReceived: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator(['MESSAGE_SENT']),
        (payload, variables, context) => {
          // Check if the user is a participant in the chat
          // We need the chat participants to be included in the message payload
          const message = payload.messageSent;

          // If sender is the user itself, don't notify (optional, but good UX)
          if (message.senderId === variables.userId) return false;

          // Check if user is in participants
          // Note: The sendMessage mutation includes chat.participants in the result
          if (message.chat?.participants) {
            return message.chat.participants.some(p => p.userId === variables.userId);
          }
          return false;
        }
      )
    }
  },
  Chat: {
    lastMessage: async (parent) => {
      // If messages are already loaded (e.g. from myChats include), use the first one
      if (parent.messages && parent.messages.length > 0) {
        return parent.messages[0];
      }
      // Otherwise fetch
      const messages = await prisma.message.findMany({
        where: { chatId: parent.id },
        orderBy: { createdAt: 'desc' },
        take: 1
      });
      return messages[0];
    }
  }
};

module.exports = resolvers;

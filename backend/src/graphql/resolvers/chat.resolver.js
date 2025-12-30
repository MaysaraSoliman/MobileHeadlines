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
    },
    unreadMessageCount: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');

      return await prisma.message.count({
        where: {
          chat: {
            participants: {
              some: { userId: user.id }
            }
          },
          senderId: { not: user.id },
          read: false
        }
      });
    }
  },
  Mutation: {
    markChatAsRead: async (_, { chatId }, { user }) => {
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

      if (!participation) throw new Error('Not authorized');

      await prisma.message.updateMany({
        where: {
          chatId,
          senderId: { not: user.id },
          read: false
        },
        data: {
          read: true
        }
      });

      return true;
    },
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
              participants: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      });

      // Update chat updatedAt
      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() }
      });

      // Publish to BOTH subscriptions
      pubsub.publish('MESSAGE_SENT', {
        messageSent: message
      });

      console.log('📤 Published MESSAGE_SENT for message:', message.id);

      return message;
    }
  },
  Subscription: {
    messageSent: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator(['MESSAGE_SENT']),
        (payload, variables) => {
          // For ChatRoomScreen - only messages in this specific chat
          return payload.messageSent.chatId === variables.chatId;
        }
      )
    },
    messageReceived: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator(['MESSAGE_SENT']),
        (payload, variables) => {
          const message = payload.messageSent;

          console.log("📨 Filtering messageReceived:", {
            messageId: message.id,
            senderId: message.senderId,
            subscriberUserId: variables.userId,
            chatId: message.chatId
          });

          // IMPORTANT: Don't filter out the sender's own messages here!
          // The client will handle whether to show/increment based on currentChatId

          // Check if user is in participants
          if (message.chat?.participants) {
            const isParticipant = message.chat.participants.some(
              p => p.userId === variables.userId
            );

            if (isParticipant) {
              console.log("  ✅ User IS participant, sending message");
              return true;
            } else {
              console.log("  ❌ User NOT participant, skipping");
              return false;
            }
          }

          console.log("  ⚠️ No participants found in payload");
          return false;
        }
      ),
      resolve: (payload) => {
        return payload.messageSent;
      }
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
    },
    unreadCount: async (parent, _, { user }) => {
      if (!user) return 0;

      const count = await prisma.message.count({
        where: {
          chatId: parent.id,
          senderId: { not: user.id },
          read: false
        }
      });

      console.log(`📊 Unread count for chat ${parent.id}: ${count}`);
      return count;
    }
  }
};

module.exports = resolvers;

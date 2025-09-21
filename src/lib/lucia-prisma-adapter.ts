import type { Adapter, DatabaseSession, DatabaseUser } from 'lucia'
import type { PrismaClient } from '@prisma/client'

export class CustomPrismaAdapter implements Adapter {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.prisma.session.delete({
      where: { id: sessionId },
    })
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { userId },
    })
  }

  async getSessionAndUser(
    sessionId: string
  ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
    try {
      const result = await this.prisma.session.findUnique({
        where: { id: sessionId },
        include: { User: true }, // Use uppercase User
      })

      if (!result) return [null, null]

      const { User, ...session } = result

      // Ensure User exists and has required properties
      if (!User) return [null, null]

      const userAttributes = {
        id: User.id,
        email: User.email || '',
        name: User.name || '',
        role: User.role || 'CUSTOMER',
        emailVerified: User.emailVerified || false,
      }

      return [
        {
          id: session.id,
          userId: session.userId,
          expiresAt: session.expiresAt,
          ...session,
        },
        {
          ...userAttributes,
          ...User,
        },
      ]
    } catch (error) {
      console.error('Error in getSessionAndUser:', error)
      return [null, null]
    }
  }

  async getUserSessions(userId: string): Promise<DatabaseSession[]> {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
    })

    return sessions.map((session) => ({
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
      ...session,
    }))
  }

  async setSession(session: DatabaseSession): Promise<void> {
    await this.prisma.session.create({
      data: {
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
      },
    })
  }

  async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { expiresAt },
    })
  }

  async deleteExpiredSessions(): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
    })
  }
}
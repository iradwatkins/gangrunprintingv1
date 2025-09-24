/**
 * auth - misc definitions
 * Auto-refactored by BMAD
 */

import { PrismaAdapter } from '@lucia-auth/adapter-prisma'
import { prisma } from '@/lib/prisma'

const adapter = new PrismaAdapter(prisma.session, prisma.user)

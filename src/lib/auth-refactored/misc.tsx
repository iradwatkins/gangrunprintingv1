/**
 * auth - misc definitions
 * Auto-refactored by BMAD
 */

import { cookies } from 'next/headers'
import { Lucia, TimeSpan } from 'lucia'
import { PrismaAdapter } from '@lucia-auth/adapter-prisma'
import { generateRandomString } from 'oslo/crypto'
import { MAGIC_LINK_EXPIRY, SERVICE_ENDPOINTS, STRING_GENERATION, SESSION_CONFIG } from '@/config/constants'
import { authLogger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import resend from '@/lib/resend'




const adapter = new PrismaAdapter(prisma.session, prisma.user)

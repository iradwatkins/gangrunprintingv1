/**
 * auth - Refactored Entry Point
 * Original: 545 lines
 * Refactored: Multiple modules < 300 lines each
 */

import { cookies } from 'next/headers'
import { Lucia, TimeSpan } from 'lucia'
import { PrismaAdapter } from '@lucia-auth/adapter-prisma'
import { generateRandomString } from 'oslo/crypto'
import { MAGIC_LINK_EXPIRY, SERVICE_ENDPOINTS, STRING_GENERATION, SESSION_CONFIG } from '@/config/constants'
import { authLogger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import resend from '@/lib/resend'

// Re-export refactored modules
export * from './auth-refactored/misc';
export * from './auth-refactored/utils';
export * from './auth-refactored/types';

// Main export (if component file)


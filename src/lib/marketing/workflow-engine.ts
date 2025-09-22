/**
 * workflow-engine - Refactored Entry Point
 * Original: 769 lines
 * Refactored: Multiple modules < 300 lines each
 */

import { prisma } from '@/lib/prisma'
import {
import { CampaignService } from './campaign-service'

// Re-export refactored modules
export * from './workflow-engine-refactored/misc';
export * from './workflow-engine-refactored/types';

// Main export (if component file)


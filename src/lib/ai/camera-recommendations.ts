/**
 * Camera Recommendation Engine
 *
 * Purpose: Query and retrieve intelligent camera-guided workflow recommendations
 *
 * Workflow:
 * 1. getCameraTypes() - List all cameras
 * 2. getPictureTypesForCamera(camera) - Show what camera is best for
 * 3. getAnglesForPictureType(camera, pictureType) - Show recommended angles
 * 4. getRecommendation(camera, pictureType, angle) - Get auto-fill modifiers
 *
 * Date: October 27, 2025
 */

import { prisma } from '@/lib/prisma'

// Types
export interface CameraType {
  value: string
  label: string
  description: string
}

export interface PictureType {
  value: string
  label: string
  description: string
}

export interface AngleType {
  value: string
  label: string
  description: string
}

export interface ModifierRecommendation {
  camera: string
  pictureType: string
  angle: string
  technical: string[]
  style: string[]
  negative: string[]
}

/**
 * Get all available camera types
 */
export async function getCameraTypes(): Promise<CameraType[]> {
  // Get unique camera types from recommendations
  const cameras = await prisma.cameraRecommendation.findMany({
    where: { isActive: true },
    distinct: ['cameraType'],
    select: {
      cameraType: true,
      cameraLabel: true,
    },
    orderBy: { sortOrder: 'asc' },
  })

  // Get camera descriptions from ModifierPreset
  const cameraModifiers = await prisma.modifierPreset.findMany({
    where: {
      category: 'CAMERA',
      label: { in: cameras.map((c) => c.cameraLabel) },
      isActive: true,
    },
    select: {
      label: true,
      description: true,
    },
  })

  const descriptionMap = new Map(
    cameraModifiers.map((m) => [m.label, m.description || ''])
  )

  return cameras.map((c) => ({
    value: c.cameraType,
    label: c.cameraLabel,
    description: descriptionMap.get(c.cameraLabel) || '',
  }))
}

/**
 * Get picture types that a camera is best for
 */
export async function getPictureTypesForCamera(
  cameraType: string
): Promise<PictureType[]> {
  const recommendations = await prisma.cameraRecommendation.findMany({
    where: {
      cameraType,
      isActive: true,
    },
    distinct: ['pictureType'],
    select: {
      pictureType: true,
      pictureTypeDesc: true,
    },
    orderBy: { sortOrder: 'asc' },
  })

  return recommendations.map((r) => ({
    value: r.pictureType,
    label: r.pictureType,
    description: r.pictureTypeDesc || '',
  }))
}

/**
 * Get recommended angles for a camera + picture type combo
 */
export async function getAnglesForPictureType(
  cameraType: string,
  pictureType: string
): Promise<AngleType[]> {
  const recommendations = await prisma.cameraRecommendation.findMany({
    where: {
      cameraType,
      pictureType,
      isActive: true,
    },
    select: {
      angleType: true,
      angleDesc: true,
    },
    orderBy: { sortOrder: 'asc' },
  })

  return recommendations.map((r) => ({
    value: r.angleType,
    label: r.angleType,
    description: r.angleDesc || '',
  }))
}

/**
 * Get complete recommendation for camera + picture type + angle
 */
export async function getRecommendation(
  cameraType: string,
  pictureType: string,
  angleType: string
): Promise<ModifierRecommendation | null> {
  const recommendation = await prisma.cameraRecommendation.findUnique({
    where: {
      cameraType_pictureType_angleType: {
        cameraType,
        pictureType,
        angleType,
      },
    },
    select: {
      recommendedTechnical: true,
      recommendedStyle: true,
      recommendedNegative: true,
    },
  })

  if (!recommendation) return null

  return {
    camera: cameraType,
    pictureType,
    angle: angleType,
    technical: recommendation.recommendedTechnical as string[],
    style: recommendation.recommendedStyle as string[],
    negative: recommendation.recommendedNegative as string[],
  }
}

/**
 * Validate that recommended modifiers exist in ModifierPreset
 *
 * This is a safety check to ensure recommendations don't reference
 * modifiers that have been deleted or deactivated
 */
export async function validateRecommendation(
  recommendation: ModifierRecommendation
): Promise<{
  valid: boolean
  missingTechnical: string[]
  missingStyle: string[]
  missingNegative: string[]
}> {
  // Get all active modifiers by category
  const [technical, style, negative] = await Promise.all([
    prisma.modifierPreset.findMany({
      where: { category: 'TECHNICAL', isActive: true },
      select: { label: true },
    }),
    prisma.modifierPreset.findMany({
      where: { category: 'STYLE', isActive: true },
      select: { label: true },
    }),
    prisma.modifierPreset.findMany({
      where: { category: 'NEGATIVE', isActive: true },
      select: { label: true },
    }),
  ])

  const technicalLabels = new Set(technical.map((m) => m.label))
  const styleLabels = new Set(style.map((m) => m.label))
  const negativeLabels = new Set(negative.map((m) => m.label))

  const missingTechnical = recommendation.technical.filter(
    (label) => !technicalLabels.has(label)
  )
  const missingStyle = recommendation.style.filter(
    (label) => !styleLabels.has(label)
  )
  const missingNegative = recommendation.negative.filter(
    (label) => !negativeLabels.has(label)
  )

  return {
    valid:
      missingTechnical.length === 0 &&
      missingStyle.length === 0 &&
      missingNegative.length === 0,
    missingTechnical,
    missingStyle,
    missingNegative,
  }
}

/**
 * Get recommendation summary stats (for admin/debugging)
 */
export async function getRecommendationStats() {
  const [total, cameras, pictureTypes, angles] = await Promise.all([
    prisma.cameraRecommendation.count({ where: { isActive: true } }),
    prisma.cameraRecommendation.groupBy({
      by: ['cameraType'],
      where: { isActive: true },
      _count: true,
    }),
    prisma.cameraRecommendation.groupBy({
      by: ['pictureType'],
      where: { isActive: true },
      _count: true,
    }),
    prisma.cameraRecommendation.groupBy({
      by: ['angleType'],
      where: { isActive: true },
      _count: true,
    }),
  ])

  return {
    total,
    byCameraType: cameras.reduce((acc, c) => {
      acc[c.cameraType] = c._count
      return acc
    }, {} as Record<string, number>),
    byPictureType: pictureTypes.reduce((acc, p) => {
      acc[p.pictureType] = p._count
      return acc
    }, {} as Record<string, number>),
    byAngleType: angles.reduce((acc, a) => {
      acc[a.angleType] = a._count
      return acc
    }, {} as Record<string, number>),
  }
}

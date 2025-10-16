import { type NextRequest, NextResponse } from 'next/server'
import { getShippingRegistry } from '@/lib/shipping/module-registry'
import { validateRequest } from '@/lib/auth'

/**
 * GET /api/admin/shipping/modules
 * Get all shipping modules and their status
 */
export async function GET() {
  try {
    // Validate admin auth
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const registry = getShippingRegistry()
    const modules = registry.getAllModules()

    return NextResponse.json({
      success: true,
      modules: modules.map((module) => ({
        id: module.id,
        name: module.name,
        carrier: module.carrier,
        enabled: module.config.enabled,
        priority: module.config.priority,
        testMode: module.config.testMode,
      })),
      status: registry.getStatus(),
    })
  } catch (error) {
    console.error('[Shipping Modules API] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch shipping modules',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/shipping/modules
 * Update shipping module configuration
 */
export async function PATCH(request: NextRequest) {
  try {
    // Validate admin auth
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { moduleId, enabled, priority } = body

    if (!moduleId) {
      return NextResponse.json({ error: 'moduleId is required' }, { status: 400 })
    }

    const registry = getShippingRegistry()

    // Update enabled status
    if (typeof enabled === 'boolean') {
      const success = enabled ? registry.enableModule(moduleId) : registry.disableModule(moduleId)

      if (!success) {
        return NextResponse.json({ error: 'Module not found' }, { status: 404 })
      }
    }

    // Update priority
    if (typeof priority === 'number') {
      const success = registry.updateModuleConfig(moduleId, { priority })

      if (!success) {
        return NextResponse.json({ error: 'Module not found' }, { status: 404 })
      }
    }

    const module = registry.getModule(moduleId)

    return NextResponse.json({
      success: true,
      module: module
        ? {
            id: module.id,
            name: module.name,
            carrier: module.carrier,
            enabled: module.config.enabled,
            priority: module.config.priority,
            testMode: module.config.testMode,
          }
        : null,
      status: registry.getStatus(),
    })
  } catch (error) {
    console.error('[Shipping Modules API] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to update shipping module',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

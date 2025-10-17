/**
 * Shipping Module Registry
 * Centralized system for managing shipping providers with enable/disable capability
 */

import { Carrier } from '@prisma/client'
import type { ShippingProvider } from './interfaces'
import { FedExProviderEnhanced } from './providers/fedex'
import { SouthwestCargoProvider } from './providers/southwest-cargo'

export interface ShippingModuleConfig {
  enabled: boolean
  priority: number // Lower number = higher priority in rate display
  testMode?: boolean
  config?: Record<string, any>
}

export interface ShippingModule {
  id: string
  name: string
  carrier: Carrier
  provider: ShippingProvider
  config: ShippingModuleConfig
}

/**
 * Shipping Module Registry
 * Manages all shipping providers with centralized enable/disable control
 */
class ShippingModuleRegistry {
  private modules: Map<string, ShippingModule> = new Map()

  constructor() {
    this.initializeModules()
  }

  /**
   * Initialize all shipping modules
   */
  private initializeModules() {
    // FedEx Module - Shows 4 services: Ground/Home, 2Day, Overnight, Ground Economy
    this.register({
      id: 'fedex',
      name: 'FedEx',
      carrier: Carrier.FEDEX,
      provider: new FedExProviderEnhanced({
        clientId: process.env.FEDEX_API_KEY || '',
        clientSecret: process.env.FEDEX_SECRET_KEY || '',
        accountNumber: process.env.FEDEX_ACCOUNT_NUMBER || '',
        testMode: process.env.FEDEX_TEST_MODE === 'true' || !process.env.FEDEX_API_KEY,
        markupPercentage: 0,
        useIntelligentPacking: true,
        enabledServices: [
          'FEDEX_GROUND',           // FedEx Ground (commercial)
          'GROUND_HOME_DELIVERY',   // FedEx Home Delivery (residential)
          'FEDEX_2_DAY',            // FedEx 2Day
          'STANDARD_OVERNIGHT',     // FedEx Standard Overnight
          'SMART_POST',             // FedEx Ground Economy
        ],
      }),
      config: {
        enabled: true, // Always enabled (falls back to test rates if no API keys)
        priority: 1,
        testMode: process.env.FEDEX_TEST_MODE === 'true' || !process.env.FEDEX_API_KEY,
      },
    })

    // Southwest Cargo Module
    this.register({
      id: 'southwest-cargo',
      name: 'Southwest Cargo',
      carrier: Carrier.SOUTHWEST_CARGO,
      provider: new SouthwestCargoProvider(),
      config: {
        enabled: true, // Enable Southwest Cargo
        priority: 2,
        testMode: false,
      },
    })
  }

  /**
   * Register a shipping module
   */
  register(module: ShippingModule) {
    this.modules.set(module.id, module)
  }

  /**
   * Get a module by ID
   */
  getModule(id: string): ShippingModule | undefined {
    return this.modules.get(id)
  }

  /**
   * Get all registered modules
   */
  getAllModules(): ShippingModule[] {
    return Array.from(this.modules.values())
  }

  /**
   * Get all enabled modules
   */
  getEnabledModules(): ShippingModule[] {
    return this.getAllModules()
      .filter((module) => module.config.enabled)
      .sort((a, b) => a.config.priority - b.config.priority)
  }

  /**
   * Enable a module
   */
  enableModule(id: string): boolean {
    const module = this.modules.get(id)
    if (module) {
      module.config.enabled = true
      return true
    }
    return false
  }

  /**
   * Disable a module
   */
  disableModule(id: string): boolean {
    const module = this.modules.get(id)
    if (module) {
      module.config.enabled = false
      return true
    }
    return false
  }

  /**
   * Get module configuration
   */
  getModuleConfig(id: string): ShippingModuleConfig | undefined {
    return this.modules.get(id)?.config
  }

  /**
   * Update module configuration
   */
  updateModuleConfig(id: string, config: Partial<ShippingModuleConfig>): boolean {
    const module = this.modules.get(id)
    if (module) {
      module.config = { ...module.config, ...config }
      return true
    }
    return false
  }

  /**
   * Get module status summary
   */
  getStatus(): Record<string, { enabled: boolean; priority: number; testMode?: boolean }> {
    const status: Record<string, { enabled: boolean; priority: number; testMode?: boolean }> = {}

    this.modules.forEach((module, id) => {
      status[id] = {
        enabled: module.config.enabled,
        priority: module.config.priority,
        testMode: module.config.testMode,
      }
    })

    return status
  }
}

// Singleton instance
let registryInstance: ShippingModuleRegistry | null = null

/**
 * Get the shipping module registry instance
 */
export function getShippingRegistry(): ShippingModuleRegistry {
  if (!registryInstance) {
    registryInstance = new ShippingModuleRegistry()
  }
  return registryInstance
}

/**
 * Reset the registry (useful for testing)
 */
export function resetShippingRegistry() {
  registryInstance = null
}

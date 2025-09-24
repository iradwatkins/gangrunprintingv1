// Permission system for role-based access control

export type Permission =
  // Dashboard
  | 'view_dashboard'

  // Orders
  | 'view_orders'
  | 'create_orders'
  | 'edit_orders'
  | 'delete_orders'
  | 'manage_order_status'
  | 'assign_vendors'
  | 'process_refunds'

  // Customers
  | 'view_customers'
  | 'create_customers'
  | 'edit_customers'
  | 'delete_customers'
  | 'view_customer_details'
  | 'manage_customer_notes'

  // Products
  | 'view_products'
  | 'create_products'
  | 'edit_products'
  | 'delete_products'
  | 'manage_categories'
  | 'manage_pricing'
  | 'manage_inventory'

  // Staff & Users
  | 'view_staff'
  | 'create_staff'
  | 'edit_staff'
  | 'delete_staff'
  | 'manage_roles'
  | 'assign_permissions'

  // Analytics & Reports
  | 'view_analytics'
  | 'view_reports'
  | 'export_data'
  | 'view_financial_reports'

  // Settings
  | 'view_settings'
  | 'edit_general_settings'
  | 'edit_payment_settings'
  | 'edit_shipping_settings'
  | 'edit_notification_settings'
  | 'manage_integrations'

  // System
  | 'manage_system'
  | 'view_logs'
  | 'backup_restore'
  | 'maintenance_mode'

export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER' | 'BROKER'

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    // Full access to everything
    'view_dashboard',
    'view_orders',
    'create_orders',
    'edit_orders',
    'delete_orders',
    'manage_order_status',
    'assign_vendors',
    'process_refunds',
    'view_customers',
    'create_customers',
    'edit_customers',
    'delete_customers',
    'view_customer_details',
    'manage_customer_notes',
    'view_products',
    'create_products',
    'edit_products',
    'delete_products',
    'manage_categories',
    'manage_pricing',
    'manage_inventory',
    'view_staff',
    'create_staff',
    'edit_staff',
    'delete_staff',
    'manage_roles',
    'assign_permissions',
    'view_analytics',
    'view_reports',
    'export_data',
    'view_financial_reports',
    'view_settings',
    'edit_general_settings',
    'edit_payment_settings',
    'edit_shipping_settings',
    'edit_notification_settings',
    'manage_integrations',
    'manage_system',
    'view_logs',
    'backup_restore',
    'maintenance_mode',
  ],

  STAFF: [
    // Limited access for staff members
    'view_dashboard',
    'view_orders',
    'create_orders',
    'edit_orders',
    'manage_order_status',
    'view_customers',
    'create_customers',
    'edit_customers',
    'view_customer_details',
    'manage_customer_notes',
    'view_products',
    'edit_products',
    'manage_inventory',
    'view_reports',
  ],

  CUSTOMER: [
    // Minimal access for customers (mainly for their own data)
  ],

  BROKER: [
    // Similar to customer but with broker-specific permissions
    'view_orders', // Only their own orders
    'create_orders', // Can create orders for customers
  ],
}

export const PERMISSION_GROUPS = {
  dashboard: {
    label: 'Dashboard',
    description: 'Access to main dashboard and overview',
    permissions: ['view_dashboard'],
  },
  orders: {
    label: 'Order Management',
    description: 'Create, view, edit, and manage orders',
    permissions: [
      'view_orders',
      'create_orders',
      'edit_orders',
      'delete_orders',
      'manage_order_status',
      'assign_vendors',
      'process_refunds',
    ],
  },
  customers: {
    label: 'Customer Management',
    description: 'Manage customer accounts and information',
    permissions: [
      'view_customers',
      'create_customers',
      'edit_customers',
      'delete_customers',
      'view_customer_details',
      'manage_customer_notes',
    ],
  },
  products: {
    label: 'Product Management',
    description: 'Manage products, categories, and inventory',
    permissions: [
      'view_products',
      'create_products',
      'edit_products',
      'delete_products',
      'manage_categories',
      'manage_pricing',
      'manage_inventory',
    ],
  },
  staff: {
    label: 'Staff Management',
    description: 'Manage staff accounts, roles, and permissions',
    permissions: [
      'view_staff',
      'create_staff',
      'edit_staff',
      'delete_staff',
      'manage_roles',
      'assign_permissions',
    ],
  },
  analytics: {
    label: 'Analytics & Reports',
    description: 'View analytics, reports, and export data',
    permissions: ['view_analytics', 'view_reports', 'export_data', 'view_financial_reports'],
  },
  settings: {
    label: 'Settings',
    description: 'Manage system settings and configuration',
    permissions: [
      'view_settings',
      'edit_general_settings',
      'edit_payment_settings',
      'edit_shipping_settings',
      'edit_notification_settings',
      'manage_integrations',
    ],
  },
  system: {
    label: 'System Administration',
    description: 'Advanced system management and maintenance',
    permissions: ['manage_system', 'view_logs', 'backup_restore', 'maintenance_mode'],
  },
}

export class PermissionService {
  /**
   * Check if a user has a specific permission
   */
  static hasPermission(userRole: Role, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || []
    return rolePermissions.includes(permission)
  }

  /**
   * Check if a user has any of the specified permissions
   */
  static hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
    return permissions.some((permission) => this.hasPermission(userRole, permission))
  }

  /**
   * Check if a user has all of the specified permissions
   */
  static hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
    return permissions.every((permission) => this.hasPermission(userRole, permission))
  }

  /**
   * Get all permissions for a role
   */
  static getRolePermissions(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role] || []
  }

  /**
   * Get permissions grouped by category
   */
  static getGroupedPermissions(role: Role) {
    const userPermissions = this.getRolePermissions(role)

    return Object.entries(PERMISSION_GROUPS).map(([key, group]) => ({
      key,
      ...group,
      permissions: group.permissions.filter((permission) =>
        userPermissions.includes(permission as Permission)
      ),
      hasAny: group.permissions.some((permission) =>
        userPermissions.includes(permission as Permission)
      ),
    }))
  }

  /**
   * Check if a role can access a specific admin route
   */
  static canAccessRoute(userRole: Role, route: string): boolean {
    const routePermissions: Record<string, Permission[]> = {
      '/admin': ['view_dashboard'],
      '/admin/dashboard': ['view_dashboard'],
      '/admin/orders': ['view_orders'],
      '/admin/orders/new': ['create_orders'],
      '/admin/customers': ['view_customers'],
      '/admin/products': ['view_products'],
      '/admin/staff': ['view_staff'],
      '/admin/analytics': ['view_analytics'],
      '/admin/reports': ['view_reports'],
      '/admin/settings': ['view_settings'],
      '/admin/inventory': ['manage_inventory'],
    }

    const requiredPermissions = routePermissions[route]
    if (!requiredPermissions) {
      return false // Route not defined, deny access
    }

    return this.hasAnyPermission(userRole, requiredPermissions)
  }

  /**
   * Filter menu items based on user permissions
   */
  static filterMenuItems(userRole: Role, menuItems: unknown[]): unknown[] {
    return menuItems.filter((item) => {
      if (item.permission) {
        return this.hasPermission(userRole, item.permission)
      }
      if (item.permissions) {
        return this.hasAnyPermission(userRole, item.permissions)
      }
      if (item.url) {
        return this.canAccessRoute(userRole, item.url)
      }
      return true // No permission specified, allow access
    })
  }

  /**
   * Get permission label for display
   */
  static getPermissionLabel(permission: Permission): string {
    const labels: Record<Permission, string> = {
      view_dashboard: 'View Dashboard',
      view_orders: 'View Orders',
      create_orders: 'Create Orders',
      edit_orders: 'Edit Orders',
      delete_orders: 'Delete Orders',
      manage_order_status: 'Manage Order Status',
      assign_vendors: 'Assign Vendors',
      process_refunds: 'Process Refunds',
      view_customers: 'View Customers',
      create_customers: 'Create Customers',
      edit_customers: 'Edit Customers',
      delete_customers: 'Delete Customers',
      view_customer_details: 'View Customer Details',
      manage_customer_notes: 'Manage Customer Notes',
      view_products: 'View Products',
      create_products: 'Create Products',
      edit_products: 'Edit Products',
      delete_products: 'Delete Products',
      manage_categories: 'Manage Categories',
      manage_pricing: 'Manage Pricing',
      manage_inventory: 'Manage Inventory',
      view_staff: 'View Staff',
      create_staff: 'Create Staff',
      edit_staff: 'Edit Staff',
      delete_staff: 'Delete Staff',
      manage_roles: 'Manage Roles',
      assign_permissions: 'Assign Permissions',
      view_analytics: 'View Analytics',
      view_reports: 'View Reports',
      export_data: 'Export Data',
      view_financial_reports: 'View Financial Reports',
      view_settings: 'View Settings',
      edit_general_settings: 'Edit General Settings',
      edit_payment_settings: 'Edit Payment Settings',
      edit_shipping_settings: 'Edit Shipping Settings',
      edit_notification_settings: 'Edit Notification Settings',
      manage_integrations: 'Manage Integrations',
      manage_system: 'Manage System',
      view_logs: 'View Logs',
      backup_restore: 'Backup & Restore',
      maintenance_mode: 'Maintenance Mode',
    }

    return labels[permission] || permission
  }

  /**
   * Check if user can perform action on resource
   */
  static canPerformAction(
    userRole: Role,
    action: 'create' | 'read' | 'update' | 'delete',
    resource: 'orders' | 'customers' | 'products' | 'staff'
  ): boolean {
    const permissionMap: Record<string, Permission> = {
      create_orders: 'create_orders',
      read_orders: 'view_orders',
      update_orders: 'edit_orders',
      delete_orders: 'delete_orders',
      create_customers: 'create_customers',
      read_customers: 'view_customers',
      update_customers: 'edit_customers',
      delete_customers: 'delete_customers',
      create_products: 'create_products',
      read_products: 'view_products',
      update_products: 'edit_products',
      delete_products: 'delete_products',
      create_staff: 'create_staff',
      read_staff: 'view_staff',
      update_staff: 'edit_staff',
      delete_staff: 'delete_staff',
    }

    const permission = permissionMap[`${action}_${resource}`]
    return permission ? this.hasPermission(userRole, permission) : false
  }
}

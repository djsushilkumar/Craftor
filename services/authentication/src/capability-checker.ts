/**
 * Craftor WordPress Capability Checker & RBAC Engine
 * Validates user roles, core WordPress capabilities, and granular permission boundaries.
 */

import { AUTH_ERROR_CODES, WordPressSecurityError } from './wordpress-auth.js';

export type WordPressRole =
  | 'administrator'
  | 'editor'
  | 'author'
  | 'contributor'
  | 'subscriber'
  | 'shop_manager'
  | 'custom';

export type WordPressStandardCapability =
  | 'manage_options'
  | 'edit_posts'
  | 'edit_pages'
  | 'upload_files'
  | 'activate_plugins'
  | 'delete_posts'
  | 'delete_pages'
  | 'edit_others_posts'
  | 'edit_others_pages'
  | 'publish_posts'
  | 'publish_pages'
  | 'manage_woocommerce'
  | 'edit_elementor_templates'
  | 'read';

export interface AuthenticatedUser {
  id: string | number;
  username: string;
  role: WordPressRole | string;
  capabilities?: string[];
}

const ROLE_CAPABILITIES_MAP: Record<string, string[]> = {
  administrator: [
    'manage_options',
    'edit_posts',
    'edit_pages',
    'upload_files',
    'activate_plugins',
    'delete_posts',
    'delete_pages',
    'edit_others_posts',
    'edit_others_pages',
    'publish_posts',
    'publish_pages',
    'manage_woocommerce',
    'edit_elementor_templates',
    'read',
  ],
  editor: [
    'edit_posts',
    'edit_pages',
    'upload_files',
    'delete_posts',
    'delete_pages',
    'edit_others_posts',
    'edit_others_pages',
    'publish_posts',
    'publish_pages',
    'edit_elementor_templates',
    'read',
  ],
  shop_manager: [
    'edit_posts',
    'edit_pages',
    'upload_files',
    'delete_posts',
    'delete_pages',
    'edit_others_posts',
    'edit_others_pages',
    'publish_posts',
    'publish_pages',
    'manage_woocommerce',
    'read',
  ],
  author: [
    'edit_posts',
    'publish_posts',
    'upload_files',
    'delete_posts',
    'read',
  ],
  contributor: [
    'edit_posts',
    'delete_posts',
    'read',
  ],
  subscriber: [
    'read',
  ],
};

/**
 * Returns the complete set of capabilities assigned to a role.
 */
export function getRoleCapabilities(role: string): Set<string> {
  const normalizedRole = role.toLowerCase();
  const caps = ROLE_CAPABILITIES_MAP[normalizedRole] ?? ['read'];
  return new Set(caps);
}

/**
 * Evaluates whether the current user has the required capability (equivalent to WordPress current_user_can).
 */
export function currentUserCan(
  user: AuthenticatedUser | null | undefined,
  requiredCapability: WordPressStandardCapability | string,
): boolean {
  if (!user) {
    return false;
  }

  // If user has custom capabilities explicitly granted
  if (user.capabilities && user.capabilities.includes(requiredCapability)) {
    return true;
  }

  // Check standard role capabilities
  const roleCaps = getRoleCapabilities(user.role);
  if (roleCaps.has(requiredCapability)) {
    return true;
  }

  // Administrator role has superuser capabilities
  if (user.role === 'administrator') {
    return true;
  }

  return false;
}

/**
 * Asserts that the authenticated user possesses the required capability, throwing -32002 if forbidden.
 */
export function assertCapability(
  user: AuthenticatedUser | null | undefined,
  requiredCapability: WordPressStandardCapability | string,
): void {
  if (!user) {
    throw new WordPressSecurityError(
      AUTH_ERROR_CODES.UNAUTHORIZED,
      'UNAUTHORIZED',
      'Unauthenticated request. User context required to verify capabilities.',
    );
  }

  if (!currentUserCan(user, requiredCapability)) {
    throw new WordPressSecurityError(
      AUTH_ERROR_CODES.FORBIDDEN_CAPABILITY,
      'FORBIDDEN_CAPABILITY',
      `User "${user.username}" (role: ${user.role}) lacks required capability: "${requiredCapability}".`,
      {
        userId: user.id,
        role: user.role,
        requiredCapability,
      },
    );
  }
}

/**
 * Immutably grants an additional custom capability to a user object.
 */
export function grantCapability(user: AuthenticatedUser, capability: string): AuthenticatedUser {
  const existingCaps = user.capabilities ?? [];
  if (existingCaps.includes(capability)) {
    return { ...user };
  }
  return {
    ...user,
    capabilities: [...existingCaps, capability],
  };
}

export type AllowedAction = 'read' | 'create' | 'update' | 'delete';
export type DeleteRule = 'hard-delete' | 'soft-delete' | 'set-null' | 'cascade';
export type CompositeKey<T = string> = T[];

export interface TableConfig {
  primaryKey: string | CompositeKey;
  allowedActions: AllowedAction[];
  deleteRule: DeleteRule;
  specialBehaviors?: unknown;
}

export const TABLE_REGISTRY: Record<string, TableConfig> = {
  // --- CORE ENTITIES ---
  statues: {
    primaryKey: 'statue_id',
    allowedActions: ['read', 'create', 'update', 'delete'],
    deleteRule: 'soft-delete',
  },
  images: {
    primaryKey: 'internal_reference_number',
    allowedActions: ['read', 'create', 'update', 'delete'],
    deleteRule: 'soft-delete',
  },

  // --- LOOKUP / DICTIONARY TABLES ---
  // Strategy: "set-null" prevents deleting the Main Entity when removing a category.
  attributes: {
    primaryKey: 'id',
    allowedActions: ['read', 'create', 'update', 'delete'],
    deleteRule: 'set-null',
  },
  materials: {
    primaryKey: 'id',
    allowedActions: ['read', 'create', 'update', 'delete'],
    deleteRule: 'set-null',
  },
  subjects: {
    primaryKey: 'id',
    allowedActions: ['read', 'create', 'update', 'delete'],
    deleteRule: 'set-null',
  },
  names: {
    primaryKey: 'id',
    allowedActions: ['read', 'create', 'update', 'delete'],
    deleteRule: 'set-null',
  },
  locations: {
    primaryKey: 'id',
    allowedActions: ['read', 'create', 'update', 'delete'],
    deleteRule: 'set-null',
  },
  photographers: {
    primaryKey: 'id',
    allowedActions: ['read', 'create', 'update', 'delete'],
    deleteRule: 'set-null',
  },
  auction_institutions: {
    primaryKey: 'id',
    allowedActions: ['read', 'create', 'update', 'delete'],
    deleteRule: 'set-null',
  },

  // --- JUNCTION TABLES (MANY-TO-MANY) ---
  // Strategy: "hard-delete" is safe here because these are just links.
  statue_attributes: {
    primaryKey: ['statue_id', 'attribute_id'] as CompositeKey, // Composite Key
    allowedActions: ['create', 'delete'], // Usually no update, just add/remove
    deleteRule: 'hard-delete',
  },
  statue_subject: {
    primaryKey: ['statue_id', 'subject_id'] as CompositeKey, // Composite Key
    allowedActions: ['create', 'delete'],
    deleteRule: 'hard-delete',
  },

  // --- VIEW ---
  // Strat: read only because the data is computed view a query
  image_attribute_overrides: {
    primaryKey: ['image_internal_reference_number', 'attribute_id'] as CompositeKey, // Composite Key
    allowedActions: ['read'],
    deleteRule: 'hard-delete', // Technically unreachable
  },

  // --- EVENTS & HISTORY ---
  auction_events: {
    primaryKey: 'id',
    allowedActions: ['read', 'create', 'update', 'delete'],
    deleteRule: 'hard-delete',
  },
  statue_current_loc: {
    primaryKey: 'id',
    allowedActions: ['read', 'create', 'update', 'delete'],
    deleteRule: 'hard-delete',
  },

  // --- ADMIN & SYSTEM ---
  admin: {
    primaryKey: 'admin_id',
    allowedActions: ['read', 'create', 'update', 'delete'],
    deleteRule: 'hard-delete',
  },
  temp_artifact_metadata: {
    primaryKey: 'id',
    allowedActions: ['read', 'create'],
    deleteRule: 'hard-delete',
  },

  // --- IGNORED / READ-ONLY ---
  spatial_ref_sys: {
    primaryKey: 'srid',
    allowedActions: ['read'], // Read-only
    deleteRule: 'hard-delete', // (Technically won't be reachable if action is blocked)
  },
};

export const ERROR_MESSAGES = {
  // Plant entity
  USER_NOT_FOUND: (uuid: string) => `User with UUID ${uuid} not found`,
  PROVINCE_NOT_FOUND: (uuid: string) => `province with UUID ${uuid} not found`,
  WAREHOUSE_NOT_FOUND: () => `warehouse not found`,
  DEVICE_SPEC_NOT_FOUND: () => `device spec not found`,
  DEVICE_TAG_MAPPING_NOT_FOUND: () => `device tag mapping not found`,
  SPEC_NOT_FOUND: () => `spec not found`,
  // Plant entity
  PLANT_NOT_FOUND: (uuid: string) => `Plant with UUID ${uuid} not found`,
  SCHEMATIC_NOT_FOUND: (uuid: string) =>
    `schematic with UUID ${uuid} not found`,
  COMPONENT_NOT_FOUND: (uuid: string) =>
    `component with UUID ${uuid} not found`,
  // Entity
  ENTITY_NOT_FOUND: (uuid: string) => `Entity with UUID ${uuid} not found`,
  COMPANY_NOT_FOUND: (uuid: string) => `Company with UUID ${uuid} not found`,

  // EntityType
  ENTITY_TYPE_NOT_FOUND: (uuid: string) =>
    `Entity type with UUID ${uuid} not found`,

  // EntityField
  ENTITY_FIELD_NOT_FOUND: (uuid: string) =>
    `Entity field with UUID ${uuid} not found`,

  ENTITY_FIELD_SCHEMA_NOT_FOUND: (uuid: string) =>
    `Entity field Schema with UUID ${uuid} not found`,

  // Source
  SOURCE_NOT_FOUND: (uuid: string) => `Source with UUID ${uuid} not found`,

  // Permission
  PERMISSION_NOT_FOUND: (uuid: string) =>
    `Permission with UUID ${uuid} not found`,

  // Role
  ROLE_NOT_FOUND: (uuid: string) => `Role with UUID ${uuid} not found`,

  // Setting
  SETTING_NOT_FOUND: (uuid: string) => `Setting with UUID ${uuid} not found`,

  // Generic fallback
  RESOURCE_NOT_FOUND: (uuid: string, resourceType: string) =>
    `${resourceType} with UUID ${uuid} not found`,
} as const;

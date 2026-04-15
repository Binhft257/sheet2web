export enum UserStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum SourceTypeEnum {
  GOOGLE_SHEET = 'google_sheet',
  EXCEL_FUTURE = 'excel_future',
}

export enum SourceStatusEnum {
  ACTIVE = 'active',
  ERROR = 'error',
  DISCONNECTED = 'disconnected',
}

export enum ThemeScopeEnum {
  SYSTEM = 'system',
  CUSTOM = 'custom',
}

export enum AccessModeEnum {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum ViewStatusEnum {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum SelectionTypeEnum {
  FULL_SHEET = 'full_sheet',
  RANGE = 'range',
  TABLE = 'table',
}

export enum PermissionTypeEnum {
  VIEW = 'view',
  EDIT = 'edit',
}

export enum SyncStatusEnum {
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}

export enum TokenTypeEnum {
  PUBLIC_SHARE = 'public_share',
  PRIVATE_INVITE = 'private_invite',
}

export enum TokenStatusEnum {
  ACTIVE = 'active',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

export enum ChangeStatusEnum {
  PENDING = 'pending',
  APPLIED = 'applied',
  ERROR = 'error',
  CANCELLED = 'cancelled',
}

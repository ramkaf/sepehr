export interface PasswordResetCacheEntry {
  uuid: string;
  code: string;
  key: string;
  try: number;
}

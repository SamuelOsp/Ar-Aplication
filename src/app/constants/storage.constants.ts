/**
 * Storage Constants
 * Centralized configuration for Supabase Storage
 */
export const STORAGE_CONSTANTS = {
    BUCKET_NAME: 'targetsimages',
    SIGNED_URL_EXPIRY_SECONDS: 3600, // 1 hour
    MAX_FILE_SIZE_MB: 5,
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
} as const;

/**
 * Local Storage Keys
 * Centralized keys for browser localStorage
 */
export const LOCAL_STORAGE_KEYS = {
    AR_TARGETS: 'arTargets'
} as const;

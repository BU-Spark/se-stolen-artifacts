/**
 * Global upload rate limiting utility
 *
 * Tracks uploads across the entire application (not per user) to prevent abuse
 * and ensure we stay within OpenRouter's rate limits.
 *
 * Uses in-memory storage. For multi-instance deployments, consider using Redis.
 */

interface RateLimitConfig {
  maxUploads: number; // Maximum number of uploads allowed
  windowMs: number; // Time window in milliseconds
}

interface UploadRecord {
  timestamp: number;
}

// Default configuration: requires environment variables
if (!process.env.UPLOAD_RATE_LIMIT_MAX || !process.env.UPLOAD_RATE_LIMIT_WINDOW_MS) {
  throw new Error('UPLOAD_RATE_LIMIT_MAX and UPLOAD_RATE_LIMIT_WINDOW_MS must be set in environment variables');
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxUploads: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX, 10),
  // Convert minutes to milliseconds: minutes × 60 seconds × 1000 milliseconds
  // Supports decimal values (e.g., 0.5 = 30 seconds, 1.5 = 90 seconds)
  windowMs: parseFloat(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS) * 60 * 1000,
};

// In-memory storage: Map of timestamps
// In production with multiple instances, use Redis or a shared database
const uploadRecords: UploadRecord[] = [];

/**
 * Clean up old records outside the time window
 */
function cleanupOldRecords(windowMs: number): void {
  const now = Date.now();
  const cutoff = now - windowMs;

  // Remove records older than the window
  while (uploadRecords.length > 0 && uploadRecords[0].timestamp < cutoff) {
    uploadRecords.shift();
  }
}

/**
 * Check if a new upload is allowed based on the rate limit
 * @returns Object with `allowed` boolean and `remaining` count
 */
export function checkUploadRateLimit(config: RateLimitConfig = DEFAULT_CONFIG): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();

  // Clean up old records
  cleanupOldRecords(config.windowMs);

  // Count uploads in the current window
  const currentCount = uploadRecords.length;

  // Check if we're at the limit
  const allowed = currentCount < config.maxUploads;
  const remaining = Math.max(0, config.maxUploads - currentCount);
  const resetAt = uploadRecords.length > 0 ? uploadRecords[0].timestamp + config.windowMs : now + config.windowMs;

  return {
    allowed,
    remaining,
    resetAt,
  };
}

/**
 * Record a new upload (call this after a successful upload)
 */
export function recordUpload(): void {
  const now = Date.now();
  uploadRecords.push({ timestamp: now });

  // Keep records sorted by timestamp (oldest first) for efficient cleanup
  uploadRecords.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Get current rate limit status without recording an upload
 */
export function getRateLimitStatus(config: RateLimitConfig = DEFAULT_CONFIG): {
  current: number;
  max: number;
  remaining: number;
  resetAt: number;
  isLimited: boolean;
} {
  const status = checkUploadRateLimit(config);

  return {
    current: uploadRecords.length,
    max: config.maxUploads,
    remaining: status.remaining,
    resetAt: status.resetAt,
    isLimited: !status.allowed,
  };
}

/**
 * Reset the rate limit (useful for testing or admin operations)
 */
export function resetRateLimit(): void {
  uploadRecords.length = 0;
}

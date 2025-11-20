import { checkUploadRateLimit, recordUpload, getRateLimitStatus, resetRateLimit } from '../uploadRateLimit';

describe('uploadRateLimit', () => {
  beforeEach(() => {
    // Reset rate limit before each test
    resetRateLimit();
  });

  afterEach(() => {
    resetRateLimit();
  });

  describe('checkUploadRateLimit', () => {
    it('should allow uploads when under the limit', () => {
      const result = checkUploadRateLimit({ maxUploads: 5, windowMs: 60000 });
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5);
    });

    it('should deny uploads when at the limit', () => {
      const config = { maxUploads: 3, windowMs: 60000 };

      // Record 3 uploads
      recordUpload();
      recordUpload();
      recordUpload();

      const result = checkUploadRateLimit(config);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should calculate remaining correctly', () => {
      const config = { maxUploads: 10, windowMs: 60000 };

      recordUpload();
      recordUpload();

      const result = checkUploadRateLimit(config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(8);
    });

    it('should clean up old records outside the window', async () => {
      const config = { maxUploads: 5, windowMs: 100 }; // 100ms window

      // Record an upload
      recordUpload();

      // Wait for the window to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      const result = checkUploadRateLimit(config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5);
    });
  });

  describe('recordUpload', () => {
    it('should record uploads correctly', () => {
      const config = { maxUploads: 5, windowMs: 60000 };

      recordUpload();
      recordUpload();

      const status = getRateLimitStatus(config);
      expect(status.current).toBe(2);
      expect(status.remaining).toBe(3);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return correct status information', () => {
      const config = { maxUploads: 10, windowMs: 60000 };

      recordUpload();
      recordUpload();
      recordUpload();

      const status = getRateLimitStatus(config);
      expect(status.current).toBe(3);
      expect(status.max).toBe(10);
      expect(status.remaining).toBe(7);
      expect(status.isLimited).toBe(false);
    });

    it('should indicate when limit is reached', () => {
      const config = { maxUploads: 2, windowMs: 60000 };

      recordUpload();
      recordUpload();

      const status = getRateLimitStatus(config);
      expect(status.isLimited).toBe(true);
      expect(status.remaining).toBe(0);
    });

    it('should calculate resetAt correctly', () => {
      const config = { maxUploads: 5, windowMs: 60000 };
      const beforeTime = Date.now();

      recordUpload();

      const status = getRateLimitStatus(config);
      const afterTime = Date.now();

      // resetAt should be within the window from when we recorded
      expect(status.resetAt).toBeGreaterThanOrEqual(beforeTime + 60000);
      expect(status.resetAt).toBeLessThanOrEqual(afterTime + 60000);
    });
  });

  describe('resetRateLimit', () => {
    it('should clear all upload records', () => {
      const config = { maxUploads: 5, windowMs: 60000 };

      recordUpload();
      recordUpload();
      recordUpload();

      expect(getRateLimitStatus(config).current).toBe(3);

      resetRateLimit();

      expect(getRateLimitStatus(config).current).toBe(0);
      expect(getRateLimitStatus(config).remaining).toBe(5);
    });
  });

  describe('integration scenarios', () => {
    it('should handle rapid uploads correctly', () => {
      const config = { maxUploads: 5, windowMs: 60000 };

      // Rapidly record 5 uploads
      for (let i = 0; i < 5; i++) {
        recordUpload();
      }

      const status = getRateLimitStatus(config);
      expect(status.current).toBe(5);
      expect(status.isLimited).toBe(true);

      // Next upload should be denied
      const check = checkUploadRateLimit(config);
      expect(check.allowed).toBe(false);
    });

    it('should allow uploads after limit expires', async () => {
      const config = { maxUploads: 2, windowMs: 100 }; // Very short window for testing

      // Fill up the limit
      recordUpload();
      recordUpload();

      expect(checkUploadRateLimit(config).allowed).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should now allow uploads
      expect(checkUploadRateLimit(config).allowed).toBe(true);
    });
  });
});

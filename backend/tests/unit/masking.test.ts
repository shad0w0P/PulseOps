import { maskPan, maskOtp, maskPassword, maskUserId } from '@anas/shared';

describe('Masking Utilities', () => {
  describe('maskPan', () => {
    it('should mask middle characters of PAN', () => {
      expect(maskPan('ABCDE1234F')).toBe('ABCD*****F');
    });

    it('should handle short strings', () => {
      expect(maskPan('ABC')).toBe('***');
    });

    it('should handle empty string', () => {
      expect(maskPan('')).toBe('');
    });
  });

  describe('maskOtp', () => {
    it('should show last 3 digits of OTP', () => {
      expect(maskOtp('123456')).toBe('***456');
    });

    it('should handle short OTP', () => {
      expect(maskOtp('12')).toBe('**');
    });
  });

  describe('maskPassword', () => {
    it('should fully mask any password', () => {
      expect(maskPassword('MyP@ssw0rd!')).toBe('**********');
    });
  });

  describe('maskUserId', () => {
    it('should mask same as PAN', () => {
      expect(maskUserId('ABCDE1234F')).toBe('ABCD*****F');
    });
  });
});

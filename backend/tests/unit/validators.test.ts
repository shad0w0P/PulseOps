import { createJobSchema, otpSchema } from '@anas/shared';

describe('Job Validator (PAN)', () => {
  describe('valid PANs', () => {
    const validPans = ['ABCDE1234F', 'ZZZZZ9999Z', 'abcde1234f'];

    for (const pan of validPans) {
      it(`should accept ${pan}`, () => {
        const result = createJobSchema.safeParse({ pan });
        expect(result.success).toBe(true);
        if (result.success) {
          // Should be uppercased
          expect(result.data.pan).toBe(pan.toUpperCase());
        }
      });
    }
  });

  describe('invalid PANs', () => {
    const invalidPans = [
      { pan: '', reason: 'empty' },
      { pan: 'ABC', reason: 'too short' },
      { pan: '1234567890', reason: 'all digits' },
      { pan: 'ABCDE12345', reason: 'wrong pattern (5 digits)' },
      { pan: 'ABCD12345F', reason: 'wrong pattern (4 letters)' },
      { pan: 'ABCDE1234', reason: 'missing last letter' },
      { pan: 'ABCDE1234F1', reason: 'too long' },
      { pan: 'ABCDE1234!', reason: 'special character' },
    ];

    for (const { pan, reason } of invalidPans) {
      it(`should reject PAN: ${reason} (${pan})`, () => {
        const result = createJobSchema.safeParse({ pan });
        expect(result.success).toBe(false);
      });
    }
  });

  describe('edge cases', () => {
    it('should trim whitespace', () => {
      const result = createJobSchema.safeParse({ pan: '  ABCDE1234F  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pan).toBe('ABCDE1234F');
      }
    });

    it('should require pan field', () => {
      const result = createJobSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

describe('OTP Validator', () => {
  describe('valid OTPs', () => {
    const validOtps = ['123456', '000000', '999999'];

    for (const otp of validOtps) {
      it(`should accept ${otp}`, () => {
        const result = otpSchema.safeParse({ otp });
        expect(result.success).toBe(true);
      });
    }
  });

  describe('invalid OTPs', () => {
    const invalidOtps = [
      { otp: '', reason: 'empty' },
      { otp: '12345', reason: 'too short (5 digits)' },
      { otp: '1234567', reason: 'too long (7 digits)' },
      { otp: 'abcdef', reason: 'letters' },
      { otp: '12345a', reason: 'mixed' },
      { otp: '12 345', reason: 'spaces' },
    ];

    for (const { otp, reason } of invalidOtps) {
      it(`should reject OTP: ${reason} (${otp})`, () => {
        const result = otpSchema.safeParse({ otp });
        expect(result.success).toBe(false);
      });
    }
  });

  describe('edge cases', () => {
    it('should trim whitespace', () => {
      const result = otpSchema.safeParse({ otp: '  123456  ' });
      expect(result.success).toBe(true);
    });
  });
});

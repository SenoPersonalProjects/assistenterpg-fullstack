import { describe, expect, it } from 'vitest';
import {
  PASSWORD_POLICY,
  passwordUtf8ByteLength,
  validateNewPassword,
} from './password-policy';

describe('password policy', () => {
  it('requires at least eight characters', () => {
    expect(validateNewPassword('1234567')).toContain(
      String(PASSWORD_POLICY.minCharacters),
    );
    expect(validateNewPassword('12345678')).toBeNull();
  });

  it('accepts exactly 72 UTF-8 bytes and rejects more', () => {
    expect(passwordUtf8ByteLength('a'.repeat(72))).toBe(72);
    expect(validateNewPassword('a'.repeat(72))).toBeNull();
    expect(validateNewPassword('a'.repeat(73))).toContain(
      String(PASSWORD_POLICY.maxUtf8Bytes),
    );
  });

  it('counts multibyte characters by UTF-8 bytes', () => {
    const password = 'á'.repeat(37);
    expect(passwordUtf8ByteLength(password)).toBe(74);
    expect(validateNewPassword(password)).toContain('UTF-8');
  });
});

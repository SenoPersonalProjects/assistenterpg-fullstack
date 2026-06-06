export const PASSWORD_POLICY = {
  minCharacters: 8,
  maxUtf8Bytes: 72,
} as const;

export const PASSWORD_REQUIREMENTS_TEXT = `Use pelo menos ${PASSWORD_POLICY.minCharacters} caracteres e no máximo ${PASSWORD_POLICY.maxUtf8Bytes} bytes.`;

export function passwordUtf8ByteLength(password: string): number {
  return new TextEncoder().encode(password).length;
}

export function validateNewPassword(password: string): string | null {
  if (Array.from(password).length < PASSWORD_POLICY.minCharacters) {
    return `A senha deve ter pelo menos ${PASSWORD_POLICY.minCharacters} caracteres.`;
  }

  if (passwordUtf8ByteLength(password) > PASSWORD_POLICY.maxUtf8Bytes) {
    return `A senha deve ter no máximo ${PASSWORD_POLICY.maxUtf8Bytes} bytes em UTF-8.`;
  }

  return null;
}

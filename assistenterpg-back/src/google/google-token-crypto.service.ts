import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const TAG_BYTES = 16;
const MIN_SECRET_LENGTH = 32;

@Injectable()
export class GoogleTokenCryptoService {
  constructor(private readonly configService: ConfigService) {}

  encrypt(value: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.resolveKey(), iv, {
      authTagLength: TAG_BYTES,
    });
    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return [
      'v1',
      iv.toString('base64url'),
      tag.toString('base64url'),
      encrypted.toString('base64url'),
    ].join(':');
  }

  decrypt(value: string): string {
    const [version, ivText, tagText, encryptedText] = value.split(':');
    if (version !== 'v1' || !ivText || !tagText || !encryptedText) {
      throw new Error('Formato de token criptografado inválido.');
    }

    const decipher = createDecipheriv(
      ALGORITHM,
      this.resolveKey(),
      Buffer.from(ivText, 'base64url'),
      { authTagLength: TAG_BYTES },
    );
    decipher.setAuthTag(Buffer.from(tagText, 'base64url'));

    return Buffer.concat([
      decipher.update(Buffer.from(encryptedText, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  }

  private resolveKey(): Buffer {
    const secret = this.configService.get<string>(
      'GOOGLE_TOKEN_ENCRYPTION_KEY',
    );
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    if (!secret || secret.length < MIN_SECRET_LENGTH) {
      if (nodeEnv === 'production') {
        throw new Error(
          `GOOGLE_TOKEN_ENCRYPTION_KEY deve ter pelo menos ${MIN_SECRET_LENGTH} caracteres em produção.`,
        );
      }
      throw new Error(
        `GOOGLE_TOKEN_ENCRYPTION_KEY deve ter pelo menos ${MIN_SECRET_LENGTH} caracteres.`,
      );
    }

    const base64Key = Buffer.from(secret, 'base64');
    if (base64Key.length === 32) return base64Key;

    return createHash('sha256').update(secret).digest();
  }
}

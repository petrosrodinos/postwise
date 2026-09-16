import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

// Encrypts long-lived, high-privilege secrets before they hit the database
// (Integration.api_token_encrypted / access_token_encrypted /
// refresh_token_encrypted).
@Injectable()
export class EncryptionService {
  constructor(private readonly configService: ConfigService) {}

  private getKey(): Buffer {
    const key = this.configService.get<string>('CREDENTIALS_ENCRYPTION_KEY');
    if (!key) {
      throw new Error(
        'CREDENTIALS_ENCRYPTION_KEY is not configured — cannot encrypt/decrypt credentials',
      );
    }

    const buffer = Buffer.from(key, 'base64');
    if (buffer.length !== 32) {
      throw new Error(
        'CREDENTIALS_ENCRYPTION_KEY must decode to exactly 32 bytes (base64-encoded)',
      );
    }

    return buffer;
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.getKey(), iv);
    const ciphertext = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
      iv.toString('base64'),
      authTag.toString('base64'),
      ciphertext.toString('base64'),
    ].join(':');
  }

  decrypt(payload: string): string {
    const [ivB64, authTagB64, ciphertextB64] = payload.split(':');
    if (!ivB64 || !authTagB64 || !ciphertextB64) {
      throw new Error('Malformed encrypted payload');
    }

    const decipher = createDecipheriv(
      ALGORITHM,
      this.getKey(),
      Buffer.from(ivB64, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(authTagB64, 'base64'));

    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertextB64, 'base64')),
      decipher.final(),
    ]);

    return plaintext.toString('utf8');
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * EncryptionService provides AES-256-GCM encryption/decryption for sensitive data
 * Used primarily for storing login credentials securely in the database
 */
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly encryptionKey: Buffer;

  constructor(private configService: ConfigService) {
    const key = this.configService.get<string>('ENCRYPTION_KEY');
    
    if (!key) {
      throw new Error('ENCRYPTION_KEY is not configured in environment variables');
    }

    // Convert hex string to buffer (key should be 32 bytes = 64 hex characters)
    if (key.length !== 64) {
      throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
    }

    this.encryptionKey = Buffer.from(key, 'hex');
  }

  /**
   * Encrypts text using AES-256-GCM
   * @param text - Plain text to encrypt
   * @returns Encrypted text in format: iv:authTag:encrypted (all hex encoded)
   */
  encrypt(text: string): string {
    if (!text) {
      return '';
    }

    // Generate random IV (Initialization Vector) - 16 bytes for GCM
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get authentication tag (GCM provides authentication)
    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:encrypted (all in hex)
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypts text encrypted with encrypt()
   * @param encryptedText - Encrypted text in format: iv:authTag:encrypted
   * @returns Decrypted plain text
   */
  decrypt(encryptedText: string): string {
    if (!encryptedText) {
      return '';
    }

    try {
      // Split the encrypted text into its components
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted text format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
      
      // Set authentication tag
      decipher.setAuthTag(authTag);

      // Decrypt
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Generates a random encryption key (32 bytes = 64 hex characters)
   * This is a utility method for generating new encryption keys
   * @returns Hex-encoded 32-byte key
   */
  static generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}


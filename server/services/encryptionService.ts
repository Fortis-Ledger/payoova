import crypto from 'crypto';

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 12;
  private static readonly TAG_LENGTH = 16;

  private static getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
    return crypto.scryptSync(key, 'salt', this.KEY_LENGTH);
  }

  static encrypt(text: string): string {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.IV_LENGTH);
      
      const cipher = crypto.createCipher(this.ALGORITHM, key);
      cipher.setAAD(Buffer.from('additional-auth-data'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Combine iv, tag, and encrypted data
      const combined = iv.toString('hex') + tag.toString('hex') + encrypted;
      return combined;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  static decrypt(encryptedData: string): string {
    try {
      const key = this.getEncryptionKey();
      
      // Extract components
      const iv = Buffer.from(encryptedData.slice(0, this.IV_LENGTH * 2), 'hex');
      const tag = Buffer.from(encryptedData.slice(this.IV_LENGTH * 2, (this.IV_LENGTH + this.TAG_LENGTH) * 2), 'hex');
      const encrypted = encryptedData.slice((this.IV_LENGTH + this.TAG_LENGTH) * 2);
      
      const decipher = crypto.createDecipher(this.ALGORITHM, key);
      decipher.setAAD(Buffer.from('additional-auth-data'));
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  static hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
import twilio from 'twilio';

export class PhoneService {
  private static readonly client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );
  private static readonly verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;
  
  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendVerificationCode(phone: string, code: string): Promise<boolean> {
    try {
      await this.client.verify.services(this.verifyServiceSid)
        .verifications
        .create({
          to: phone,
          channel: 'sms'
        });

      console.log(`📱 Verification code sent to ${phone}`);
      return true;
    } catch (error) {
      console.error('Failed to send SMS verification:', error);
      return false;
    }
  }

  static isValidPhoneNumber(phone: string): boolean {
    // Basic international phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  }

  static formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Ensure it starts with + if it doesn't already
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }

  static isCodeExpired(expiryTime: Date): boolean {
    return new Date() > expiryTime;
  }

  static getCodeExpiryTime(): Date {
    // 10 minutes from now
    return new Date(Date.now() + 10 * 60 * 1000);
  }

  // Mock verification for development - remove in production
  static async sendTestVerificationCode(phone: string): Promise<string> {
    const code = this.generateVerificationCode();
    console.log(`🧪 TEST: Verification code for ${phone}: ${code}`);
    return code;
  }

  static async verifyCode(phone: string, code: string): Promise<boolean> {
    try {
      const verification = await this.client.verify.services(this.verifyServiceSid)
        .verificationChecks
        .create({
          to: phone,
          code: code
        });

      return verification.status === 'approved';
    } catch (error) {
      console.error('Failed to verify SMS code:', error);
      return false;
    }
  }

  static validateCode(inputCode: string, storedCode: string): boolean {
    return inputCode === storedCode;
  }
}
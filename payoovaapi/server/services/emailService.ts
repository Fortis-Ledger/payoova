import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export class EmailService {
  private static readonly FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@cryptowallet.app';

  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static async sendVerificationEmail(
    email: string,
    verificationToken: string,
    firstName?: string
  ): Promise<boolean> {
    const verificationUrl = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;
    
    const msg = {
      to: email,
      from: this.FROM_EMAIL,
      subject: 'Verify your CryptoWallet account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to CryptoWallet</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #f8f9fa;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">
              ${firstName ? `Hi ${firstName},` : 'Hello!'}
            </h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Thank you for signing up for CryptoWallet! To complete your registration and secure your account, 
              please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${verificationUrl}" 
                 style="background: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #4F46E5; word-break: break-all;">
                ${verificationUrl}
              </a>
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 30px;">
              <h3 style="color: #1f2937; margin-bottom: 15px;">What happens next?</h3>
              <ul style="color: #4b5563; line-height: 1.8;">
                <li>✅ Your email will be verified</li>
                <li>🔐 Your secure crypto wallets will be automatically generated</li>
                <li>💰 You can start managing Ethereum, Polygon, and BNB Smart Chain assets</li>
                <li>📱 Access your dashboard and start transacting</li>
              </ul>
            </div>
          </div>
          
          <div style="background: #1f2937; color: #9ca3af; padding: 30px 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">
              This verification link expires in 24 hours for security.
            </p>
            <p style="margin: 0;">
              If you didn't create this account, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
      text: `
Welcome to CryptoWallet!

${firstName ? `Hi ${firstName},` : 'Hello!'}

Thank you for signing up! Please verify your email address to complete your registration:

${verificationUrl}

What happens next:
✅ Your email will be verified
🔐 Your secure crypto wallets will be automatically generated  
💰 You can start managing Ethereum, Polygon, and BNB Smart Chain assets
📱 Access your dashboard and start transacting

This verification link expires in 24 hours for security.

If you didn't create this account, you can safely ignore this email.
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Verification email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }

  static async sendWalletCreatedEmail(
    email: string,
    walletAddresses: Array<{ network: string; address: string }>,
    firstName?: string
  ): Promise<boolean> {
    const walletsHtml = walletAddresses.map(wallet => 
      `<li><strong>${wallet.network.toUpperCase()}</strong>: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${wallet.address}</code></li>`
    ).join('');

    const walletsText = walletAddresses.map(wallet => 
      `${wallet.network.toUpperCase()}: ${wallet.address}`
    ).join('\n');

    const msg = {
      to: email,
      from: this.FROM_EMAIL,
      subject: 'Your crypto wallets are ready!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Wallets Created!</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #f8f9fa;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">
              ${firstName ? `Hi ${firstName},` : 'Hello!'}
            </h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Great news! Your crypto wallets have been successfully created and are ready to use. 
              You now have secure wallets for multiple blockchain networks.
            </p>
            
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin-bottom: 15px;">Your Wallet Addresses:</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${walletsHtml}
              </ul>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h4 style="color: #92400e; margin: 0 0 10px 0;">🔒 Security Reminder</h4>
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                Your private keys are encrypted and securely stored. Never share your private keys or seed phrases with anyone.
              </p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.APP_BASE_URL || 'http://localhost:3000'}"
                 style="background: #10B981; color: white; padding: 15px 30px; text-decoration: none;
                        border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Access Your Dashboard
              </a>
            </div>
          </div>
          
          <div style="background: #1f2937; color: #9ca3af; padding: 30px 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0;">
              Start managing your crypto assets across Ethereum, Polygon, and BNB Smart Chain networks!
            </p>
          </div>
        </div>
      `,
      text: `
🎉 Your crypto wallets are ready!

${firstName ? `Hi ${firstName},` : 'Hello!'}

Great news! Your crypto wallets have been successfully created and are ready to use.

Your Wallet Addresses:
${walletsText}

🔒 Security Reminder: Your private keys are encrypted and securely stored. Never share your private keys or seed phrases with anyone.

Access your dashboard: ${process.env.APP_BASE_URL || 'http://localhost:3000'}

Start managing your crypto assets across Ethereum, Polygon, and BNB Smart Chain networks!
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Wallet creation email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send wallet creation email:', error);
      return false;
    }
  }

  static async sendTransactionNotificationEmail(
    email: string,
    transaction: {
      type: 'send' | 'receive';
      amount: string;
      currency: string;
      network: string;
      transactionHash?: string;
      toAddress?: string;
      fromAddress?: string;
    },
    firstName?: string
  ): Promise<boolean> {
    const isReceive = transaction.type === 'receive';
    const title = isReceive ? 'Crypto Received!' : 'Transaction Sent';
    const emoji = isReceive ? '📈' : '📤';
    const actionText = isReceive ? 'received' : 'sent';
    
    const msg = {
      to: email,
      from: this.FROM_EMAIL,
      subject: `${emoji} ${title} - ${transaction.amount} ${transaction.currency}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${isReceive ? '#10B981' : '#6366F1'}; padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">
              ${emoji} ${title}
            </h1>
          </div>
          
          <div style="padding: 30px 20px; background: #f8f9fa;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">
              ${firstName ? `Hi ${firstName},` : 'Hello!'}
            </h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              You have successfully ${actionText} <strong>${transaction.amount} ${transaction.currency}</strong> 
              on the ${transaction.network} network.
            </p>
            
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
              <h3 style="color: #1f2937; margin-bottom: 15px;">Transaction Details:</h3>
              <ul style="list-style: none; padding: 0; margin: 0; color: #4b5563;">
                <li style="margin-bottom: 8px;"><strong>Amount:</strong> ${transaction.amount} ${transaction.currency}</li>
                <li style="margin-bottom: 8px;"><strong>Network:</strong> ${transaction.network}</li>
                <li style="margin-bottom: 8px;"><strong>Type:</strong> ${transaction.type}</li>
                ${transaction.transactionHash ? `<li style="margin-bottom: 8px;"><strong>Hash:</strong> <code style="font-size: 12px; word-break: break-all;">${transaction.transactionHash}</code></li>` : ''}
                ${transaction.toAddress ? `<li style="margin-bottom: 8px;"><strong>To:</strong> <code style="font-size: 12px; word-break: break-all;">${transaction.toAddress}</code></li>` : ''}
                ${transaction.fromAddress ? `<li style="margin-bottom: 8px;"><strong>From:</strong> <code style="font-size: 12px; word-break: break-all;">${transaction.fromAddress}</code></li>` : ''}
              </ul>
            </div>
          </div>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Transaction notification email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send transaction notification email:', error);
      return false;
    }
  }
}
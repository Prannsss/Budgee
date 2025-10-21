import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import { config } from 'dotenv';

config();

/**
 * Email Service
 * Handles sending emails via Brevo (formerly Sendinblue) API
 * 
 * Note: This service uses Brevo's API for reliable transactional email delivery
 * with better deliverability and tracking capabilities.
 */

// Initialize Brevo API client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY || '';

// Create API instance for sending transactional emails
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Helper function to format Brevo API errors
 */
const formatBrevoError = (error: any): string => {
  if (error.response) {
    const body = error.response.body;
    if (typeof body === 'object' && body !== null) {
      return `Brevo API Error: ${body.message || body.code || JSON.stringify(body)}`;
    }
    return `Brevo API Error: Status ${error.response.status}`;
  }
  return error.message || 'Unknown Brevo API error';
};

/**
 * Verify Brevo API connection on startup
 */
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.error('❌ BREVO_API_KEY is not configured in environment variables');
      return false;
    }
    
    if (!process.env.EMAIL_FROM) {
      console.error('❌ EMAIL_FROM is not configured in environment variables');
      return false;
    }

    // Test the API by attempting to get account info
    const accountApi = new SibApiV3Sdk.AccountApi();
    const accountInfo = await accountApi.getAccount();
    
    console.log('✅ Email service (Brevo API) is ready to send emails');
    console.log(`📧 Sender email: ${process.env.EMAIL_FROM}`);
    console.log(`👤 Account: ${accountInfo.email}`);
    
    // Check if sender email is verified
    if (accountInfo.email !== process.env.EMAIL_FROM) {
      console.warn('⚠️  WARNING: EMAIL_FROM does not match Brevo account email');
      console.warn(`   Brevo account: ${accountInfo.email}`);
      console.warn(`   Configured sender: ${process.env.EMAIL_FROM}`);
      console.warn('   Make sure your sender email is verified in Brevo dashboard');
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Email service connection failed:');
    console.error('   Error:', formatBrevoError(error));
    console.log('\n💡 Troubleshooting steps:');
    console.log('   1. Verify BREVO_API_KEY is correct in .env file');
    console.log('   2. Check that your sender email is verified in Brevo dashboard');
    console.log('   3. Go to https://app.brevo.com/settings/keys/api to manage API keys');
    console.log('   4. Go to https://app.brevo.com/senders to verify sender emails\n');
    return false;
  }
};


/**
 * Send verification email with OTP code
 */
export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationCode: string
): Promise<boolean> => {
  console.log(`\n📤 Attempting to send verification email to: ${email}`);
  console.log(`   Verification code: ${verificationCode}`);
  
  try {
    // Validate inputs
    if (!email || !name || !verificationCode) {
      console.error('❌ Missing required parameters:', { email: !!email, name: !!name, code: !!verificationCode });
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format:', email);
      return false;
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              color: #333;
              margin-bottom: 20px;
            }
            .otp-box {
              background-color: #f8f9fa;
              border: 2px dashed #667eea;
              border-radius: 8px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-label {
              font-size: 14px;
              color: #666;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .info-text {
              color: #666;
              line-height: 1.6;
              margin: 20px 0;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning-text {
              color: #856404;
              margin: 0;
              font-size: 14px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #e0e0e0;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 Budgee</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px;">Smart Finance Tracking</p>
            </div>
            
            <div class="content">
              <p class="greeting">Hello ${name},</p>
              
              <p class="info-text">
                Welcome to <strong>Budgee</strong>! We're excited to have you on board. 
                To complete your registration and start managing your finances, please verify your email address.
              </p>
              
              <div class="otp-box">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${verificationCode}</div>
              </div>
              
              <p class="info-text">
                Enter this code on the verification page to activate your account. 
                This code will expire in <strong>10 minutes</strong>.
              </p>
              
              <div class="warning">
                <p class="warning-text">
                  <strong>Security Tip:</strong> Never share this code with anyone. 
                  Budgee will never ask for your verification code via email or phone.
                </p>
              </div>
              
              <p class="info-text">
                If you didn't create a Budgee account, please ignore this email or contact our support team.
              </p>
              
              <p class="info-text" style="margin-top: 30px;">
                Best regards,<br>
                <strong>The Budgee Team</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Budgee. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    const textContent = `
Hello ${name},

Welcome to Budgee! Please verify your email address by entering the following code:

Verification Code: ${verificationCode}

This code will expire in 10 minutes.

If you didn't create a Budgee account, please ignore this email.

Best regards,
The Budgee Team
      `.trim();

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    // Sender configuration
    sendSmtpEmail.sender = {
      name: process.env.EMAIL_FROM_NAME || 'Budgee Buddy',
      email: process.env.EMAIL_FROM || 'noreply@budgeebuddy.com',
    };
    
    // Recipient
    sendSmtpEmail.to = [{ email: email.trim(), name: name.trim() }];
    
    // Email content
    sendSmtpEmail.subject = 'Verify Your Budgee Account';
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.textContent = textContent;
    
    // Optional: Add tags for tracking
    sendSmtpEmail.tags = ['verification', 'signup'];

    console.log('   Sending email via Brevo API...');
    console.log(`   From: ${sendSmtpEmail.sender.name} <${sendSmtpEmail.sender.email}>`);
    console.log(`   To: ${name} <${email}>`);
    
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('✅ Verification email sent successfully!');
    console.log(`   Message ID: ${data.messageId}`);
    console.log(`   You can track this email in Brevo dashboard: https://app.brevo.com/`);
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to send verification email');
    console.error('   Recipient:', email);
    console.error('   Error details:', formatBrevoError(error));
    
    // Log full error for debugging
    if (error.response) {
      console.error('   API Response Status:', error.response.status);
      console.error('   API Response Body:', JSON.stringify(error.response.body, null, 2));
    }
    
    return false;
  }
};


/**
 * Send password reset email with OTP code
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetCode: string
): Promise<boolean> => {
  console.log(`\n📤 Attempting to send password reset email to: ${email}`);
  console.log(`   Reset code: ${resetCode}`);
  
  try {
    // Validate inputs
    if (!email || !name || !resetCode) {
      console.error('❌ Missing required parameters');
      return false;
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
            }
            .info-text {
              color: #666;
              line-height: 1.6;
              margin: 20px 0;
            }
            .otp-box {
              background-color: #f8f9fa;
              border: 2px dashed #667eea;
              border-radius: 8px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-label {
              font-size: 14px;
              color: #666;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning-text {
              color: #856404;
              margin: 0;
              font-size: 14px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #e0e0e0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Budgee</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px;">Password Reset Request</p>
            </div>
            
            <div class="content">
              <p>Hello ${name},</p>
              
              <p class="info-text">
                We received a request to reset your Budgee account password. 
                Use the code below to proceed with resetting your password:
              </p>
              
              <div class="otp-box">
                <div class="otp-label">Your Reset Code</div>
                <div class="otp-code">${resetCode}</div>
              </div>
              
              <p class="info-text">
                Enter this code on the password reset page to create a new password. 
                This code will expire in <strong>10 minutes</strong>.
              </p>
              
              <div class="warning">
                <p class="warning-text">
                  <strong>Security Alert:</strong> If you didn't request a password reset, 
                  please ignore this email and your password will remain unchanged. 
                  Consider changing your password if you suspect unauthorized access.
                </p>
              </div>
              
              <p class="info-text" style="margin-top: 30px;">
                Best regards,<br>
                <strong>The Budgee Team</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Budgee. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    const textContent = `
Hello ${name},

We received a request to reset your password. Use the code below to proceed:

Reset Code: ${resetCode}

This code will expire in 10 minutes.

If you didn't request a password reset, please ignore this email.

Best regards,
The Budgee Team
      `.trim();

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = {
      name: process.env.EMAIL_FROM_NAME || 'Budgee Buddy',
      email: process.env.EMAIL_FROM || 'noreply@budgeebuddy.com',
    };
    sendSmtpEmail.to = [{ email: email.trim(), name: name.trim() }];
    sendSmtpEmail.subject = 'Reset Your Budgee Password';
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.textContent = textContent;
    sendSmtpEmail.tags = ['password-reset'];

    console.log('   Sending password reset email via Brevo API...');
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Password reset email sent successfully!');
    console.log(`   Message ID: ${data.messageId}`);
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to send password reset email');
    console.error('   Recipient:', email);
    console.error('   Error details:', formatBrevoError(error));
    
    if (error.response) {
      console.error('   API Response:', JSON.stringify(error.response.body, null, 2));
    }
    
    return false;
  }
};


/**
 * Send welcome email after successful verification
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<boolean> => {
  console.log(`\n📤 Attempting to send welcome email to: ${email}`);
  
  try {
    // Validate inputs
    if (!email || !name) {
      console.error('❌ Missing required parameters');
      return false;
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
            }
            .info-text {
              color: #666;
              line-height: 1.6;
              margin: 20px 0;
            }
            .feature-list {
              background-color: #f8f9fa;
              border-radius: 8px;
              padding: 20px 30px;
              margin: 20px 0;
            }
            .feature-list ul {
              margin: 0;
              padding-left: 20px;
            }
            .feature-list li {
              color: #333;
              margin: 10px 0;
              line-height: 1.6;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #e0e0e0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Budgee!</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px;">Your Financial Journey Starts Here</p>
            </div>
            
            <div class="content">
              <p>Hi ${name},</p>
              
              <p class="info-text">
                Your email has been verified successfully! 🎊 You're all set to start 
                taking control of your finances with Budgee.
              </p>
              
              <div class="feature-list">
                <p style="margin-top: 0; color: #333; font-weight: bold;">Here's what you can do next:</p>
                <ul>
                  <li>💳 Connect your bank accounts and e-wallets</li>
                  <li>📊 Track your income and expenses automatically</li>
                  <li>🎯 Set financial goals and monitor your progress</li>
                  <li>📈 Get detailed spending insights and reports</li>
                  <li>🤖 Access AI-powered financial recommendations (Premium)</li>
                </ul>
              </div>
              
              <p class="info-text">
                Ready to get started? Head to your dashboard and begin your journey to better financial health!
              </p>
              
              <p style="text-align: center;">
                <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}/dashboard" class="button">
                  Go to Dashboard →
                </a>
              </p>
              
              <p class="info-text" style="margin-top: 30px;">
                Need help? Check out our <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}/docs" style="color: #667eea;">documentation</a> 
                or contact our support team anytime.
              </p>
              
              <p class="info-text">
                Best regards,<br>
                <strong>The Budgee Team</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Budgee. All rights reserved.</p>
              <p>You're receiving this email because you created a Budgee account.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    const textContent = `
Hi ${name},

Welcome to Budgee! 🎉

Your email has been verified successfully! You're all set to start tracking your finances.

Here's what you can do next:
- Connect your bank accounts and e-wallets
- Track your income and expenses
- Set financial goals
- Get AI-powered insights (Premium)

Get started: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}/dashboard

Best regards,
The Budgee Team
      `.trim();

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = {
      name: process.env.EMAIL_FROM_NAME || 'Budgee Buddy',
      email: process.env.EMAIL_FROM || 'noreply@budgeebuddy.com',
    };
    sendSmtpEmail.to = [{ email: email.trim(), name: name.trim() }];
    sendSmtpEmail.subject = 'Welcome to Budgee! 🎉';
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.textContent = textContent;
    sendSmtpEmail.tags = ['welcome', 'onboarding'];

    console.log('   Sending welcome email via Brevo API...');
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Welcome email sent successfully!');
    console.log(`   Message ID: ${data.messageId}`);
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to send welcome email');
    console.error('   Recipient:', email);
    console.error('   Error details:', formatBrevoError(error));
    
    if (error.response) {
      console.error('   API Response:', JSON.stringify(error.response.body, null, 2));
    }
    
    return false;
  }
};

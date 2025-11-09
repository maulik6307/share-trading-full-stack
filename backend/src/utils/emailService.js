const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Check if we should use mock email service for development
    if (process.env.USE_MOCK_EMAIL === 'true' || (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
      console.log('Using mock email service (emails will be logged to console)');
      this.transporter = null; // Will use mock service
      return;
    }
    
    if (process.env.NODE_ENV === 'production') {
      // Production email configuration
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS.replace(/\s/g, '') // Remove spaces from app password
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    } else {
      // Development configuration - using Gmail with app password
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS.replace(/\s/g, '') // Remove spaces from app password
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }
  }

  async verifyConnection() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      console.log('Verifying email connection...');
      await this.transporter.verify();
      console.log('Email connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email connection verification failed:', error.message);
      return false;
    }
  }

  async sendEmail(options) {
    try {
      // Use mock email service if transporter is not configured
      if (!this.transporter) {
        return this.sendMockEmail(options);
      }

      const mailOptions = {
        from: `${process.env.FROM_NAME || 'ShareTrading'} <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      console.log('Attempting to send email to:', options.email);

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('Email sent successfully:', info.messageId);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Email sending failed:', error.message);
      console.error('Error code:', error.code);
      console.error('Error command:', error.command);
      
      // Provide more specific error messages
      if (error.code === 'ESOCKET') {
        throw new Error('Failed to connect to email server. Please check your internet connection and email configuration.');
      } else if (error.code === 'EAUTH') {
        throw new Error('Email authentication failed. Please check your email credentials.');
      } else if (error.code === 'EMESSAGE') {
        throw new Error('Invalid email message format.');
      } else {
        throw new Error(`Email sending failed: ${error.message}`);
      }
    }
  }

  sendMockEmail(options) {
    console.log('\n=== MOCK EMAIL SERVICE ===');
    console.log('📧 Email would be sent to:', options.email);
    console.log('📋 Subject:', options.subject);
    console.log('📄 Text content:');
    console.log(options.text);
    console.log('🌐 HTML content available:', !!options.html);
    console.log('=========================\n');
    
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
      mock: true
    };
  }

  async sendPasswordResetEmail(email, resetToken, resetUrl) {
    const subject = 'Password Reset Request - ShareTrading';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e1e5e9;
            border-top: none;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
            border: 1px solid #e1e5e9;
            border-top: none;
            border-radius: 0 0 8px 8px;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
          <p>ShareTrading Platform</p>
        </div>
        
        <div class="content">
          <h2>Hello!</h2>
          
          <p>We received a request to reset your password for your ShareTrading account. If you didn't make this request, you can safely ignore this email.</p>
          
          <p>To reset your password, click the button below:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset My Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
            ${resetUrl}
          </p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This link will expire in 10 minutes for security reasons. If you need a new reset link, please request another password reset.
          </div>
          
          <p>If you're having trouble with the button above, you can also reset your password by visiting our website and using the "Forgot Password" feature.</p>
          
          <p>Best regards,<br>The ShareTrading Team</p>
        </div>
        
        <div class="footer">
          <p>This email was sent to ${email}</p>
          <p>If you didn't request this password reset, please contact our support team immediately.</p>
          <p>&copy; ${new Date().getFullYear()} ShareTrading. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request - ShareTrading
      
      Hello!
      
      We received a request to reset your password for your ShareTrading account.
      
      To reset your password, visit this link: ${resetUrl}
      
      This link will expire in 10 minutes for security reasons.
      
      If you didn't request this password reset, you can safely ignore this email.
      
      Best regards,
      The ShareTrading Team
    `;

    return this.sendEmail({
      email,
      subject,
      html,
      text
    });
  }

  async sendWelcomeEmail(email, name) {
    const subject = 'Welcome to ShareTrading!';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ShareTrading</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e1e5e9;
            border-top: none;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
            border: 1px solid #e1e5e9;
            border-top: none;
            border-radius: 0 0 8px 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Welcome to ShareTrading!</h1>
          <p>AI-Powered Trading Platform</p>
        </div>
        
        <div class="content">
          <h2>Hello ${name}!</h2>
          
          <p>Welcome to ShareTrading! We're excited to have you join our community of traders and investors.</p>
          
          <p>With ShareTrading, you can:</p>
          <ul>
            <li>📊 Create and backtest trading strategies</li>
            <li>🤖 Use AI-powered trading algorithms</li>
            <li>📈 Practice with paper trading</li>
            <li>📋 Track your portfolio performance</li>
            <li>🎯 Set up automated alerts</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">Get Started</a>
          </div>
          
          <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
          
          <p>Happy trading!<br>The ShareTrading Team</p>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ShareTrading. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to ShareTrading!
      
      Hello ${name}!
      
      Welcome to ShareTrading! We're excited to have you join our community of traders and investors.
      
      With ShareTrading, you can:
      - Create and backtest trading strategies
      - Use AI-powered trading algorithms
      - Practice with paper trading
      - Track your portfolio performance
      - Set up automated alerts
      
      Visit ${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard to get started.
      
      Happy trading!
      The ShareTrading Team
    `;

    return this.sendEmail({
      email,
      subject,
      html,
      text
    });
  }

  async sendContactConfirmation(email, name, subject) {
    const emailSubject = 'We received your message - ShareTrading';
    const html = `
      <h2>Thank you for contacting us!</h2>
      <p>Hi ${name},</p>
      <p>We've received your message regarding: <strong>${subject}</strong></p>
      <p>Our support team will review your inquiry and get back to you within 24-48 hours.</p>
      <p>If your matter is urgent, please reply to this email with "URGENT" in the subject line.</p>
      <br>
      <p>Best regards,<br>The ShareTrading Team</p>
    `;
    const text = `
      Thank you for contacting us!
      
      Hi ${name},
      
      We've received your message regarding: ${subject}
      
      Our support team will review your inquiry and get back to you within 24-48 hours.
      
      Best regards,
      The ShareTrading Team
    `;

    return this.sendEmail({
      email,
      subject: emailSubject,
      html,
      text
    });
  }

  async sendContactNotification({ name, email, subject, message, contactId }) {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    const emailSubject = `New Contact Form Submission: ${subject}`;
    const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <p><strong>Contact ID:</strong> ${contactId}</p>
      <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      <br>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/contacts/${contactId}">View in Admin Panel</a></p>
    `;
    const text = `
      New Contact Form Submission
      
      From: ${name} (${email})
      Subject: ${subject}
      Message: ${message}
      Contact ID: ${contactId}
      Submitted: ${new Date().toLocaleString()}
    `;

    return this.sendEmail({
      email: adminEmail,
      subject: emailSubject,
      html,
      text
    });
  }
}

module.exports = new EmailService();
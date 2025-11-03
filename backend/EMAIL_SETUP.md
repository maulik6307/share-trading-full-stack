# Email Configuration Setup

This guide will help you set up email functionality for the ShareTrading backend, specifically for password reset emails.

## Gmail Setup (Recommended for Development)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to "Security"
3. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. In Google Account settings, go to "Security"
2. Under "2-Step Verification", click on "App passwords"
3. Select "Mail" as the app and "Other" as the device
4. Enter "ShareTrading Backend" as the device name
5. Copy the generated 16-character password

### Step 3: Update Environment Variables
Update your `backend/.env` file with your Gmail credentials:

```env
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=your-16-character-app-password
FROM_NAME=ShareTrading
FROM_EMAIL=your-actual-email@gmail.com
```

### Step 4: Test the Configuration
1. Start your backend server: `npm run dev`
2. Use the forgot password API endpoint with a valid email
3. Check if the email is received

## Alternative Email Services

### SendGrid
```env
EMAIL_SERVICE=SendGrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

### Outlook/Hotmail
```env
EMAIL_SERVICE=hotmail
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Custom SMTP
```env
EMAIL_HOST=your-smtp-host.com
EMAIL_PORT=587
EMAIL_USER=your-username
EMAIL_PASS=your-password
```

## Testing Email Functionality

### Using Postman or curl
```bash
curl -X POST http://localhost:5000/api/v1/auth/forgotpassword \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Expected Response
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

## Troubleshooting

### Common Issues

1. **"Invalid login" error**
   - Make sure you're using an app password, not your regular Gmail password
   - Verify 2-factor authentication is enabled

2. **"Connection timeout" error**
   - Check your internet connection
   - Verify SMTP settings are correct

3. **"Authentication failed" error**
   - Double-check your email and app password
   - Make sure the email account exists and is accessible

4. **Email not received**
   - Check spam/junk folder
   - Verify the recipient email address is correct
   - Check server logs for any errors

### Development Mode
In development mode, the API response will include the reset token and URL for testing purposes:

```json
{
  "success": true,
  "message": "Password reset email sent successfully",
  "resetToken": "abc123...",
  "resetUrl": "http://localhost:3000/reset-password/abc123..."
}
```

## Security Notes

- Never commit your actual email credentials to version control
- Use environment variables for all sensitive configuration
- In production, consider using a dedicated email service like SendGrid or AWS SES
- The reset token expires in 10 minutes for security
- Reset tokens are hashed before storing in the database

## Production Considerations

For production deployment:

1. Use a professional email service (SendGrid, AWS SES, etc.)
2. Set up proper DNS records (SPF, DKIM, DMARC)
3. Use a dedicated sending domain
4. Monitor email delivery rates and reputation
5. Implement email templates with your branding
6. Set up proper error handling and logging
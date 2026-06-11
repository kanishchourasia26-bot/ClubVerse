# Email Verification Setup

## Required Environment Variables

Add these to your `backend/.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account Settings
   - Security → 2-Step Verification
   - Scroll down to "App passwords"
   - Generate a new app password for "Mail"
   - Copy the 16-character password
3. **Add to .env:**
   - `EMAIL_USER`: Your Gmail address (e.g., `yourname@gmail.com`)
   - `EMAIL_PASSWORD`: The 16-character app password (not your regular password)

## Alternative Email Services

### SendGrid (Recommended for Production)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

### Mailtrap (For Development/Testing)
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password
```

Update `backend/src/utils/email.js` to use the custom SMTP configuration if needed.



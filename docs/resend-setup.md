# Resend Email Setup

## Environment Variables

Add these to your `.env.local` file:

```bash
# Resend API Configuration
RESEND_API_KEY=re_Tuo46a2c_HzZ2uPjVYhXfPgX6LDk87iRJ

# Email Configuration
FEEDBACK_EMAIL=sarmadh+pp@joblogic.com
FROM_EMAIL=onboarding@resend.dev
```

## Setup Instructions

1. Create `.env.local` file in your project root
2. Add the environment variables above
3. Restart your development server
4. The feedback system will now use Resend for email delivery

## Testing

The feedback form will send emails to `sarmadh+pp@joblogic.com` using the Resend service.



# 🆓 Free Slack Integration Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Slack Webhook (FREE)

1. **Go to your Slack workspace**
2. **Click on your workspace name → Settings & administration → Manage apps**
3. **Search for "Incoming Webhooks"**
4. **Click "Add to Slack"**
5. **Choose the channel** where you want feedback (e.g., #feedback, #general)
6. **Click "Add Incoming Webhooks integration"**
7. **Copy the webhook URL** (starts with `https://hooks.slack.com/services/...`)

### Step 2: Add Environment Variable

Create or update your `.env.local` file in your project root:

```bash
# Slack Webhook Configuration
SLACK_FEEDBACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

Replace `YOUR/SLACK/WEBHOOK` with your actual webhook URL.

### Step 3: Test the Integration

1. **Start your development server**: `npm run dev`
2. **Go to** `http://localhost:3000/feedback`
3. **Submit a test feedback**
4. **Check your Slack channel** for the message

## What You'll Get

### Slack Message Format:
```
🐛 Bug Report: Login not working
Reporter: John Doe
Type: Bug
Priority: 🔴 Urgent
Timestamp: 12/19/2024, 2:30:45 PM

Description:
The login button is not responding when clicked. This happens on Chrome browser.

📝 Submitted via PromptPilot Feedback System
```

### Features:
- ✅ **Completely FREE** - No paid services required
- ✅ **Rich formatting** - Emojis, priority indicators, structured layout
- ✅ **Real-time delivery** - Instant notifications to your team
- ✅ **Professional appearance** - Clean, organized Slack messages
- ✅ **All feedback types** - Bug reports, feature requests, improvements, questions

## Troubleshooting

### Common Issues:

1. **"Slack webhook not configured" error**
   - Make sure `SLACK_FEEDBACK_WEBHOOK_URL` is set in `.env.local`
   - Restart your development server after adding the variable

2. **"Failed to send feedback to Slack" error**
   - Check that your webhook URL is correct
   - Ensure the Slack app is still active in your workspace

3. **Messages not appearing in Slack**
   - Verify the webhook is pointing to the correct channel
   - Check if the Slack app has permission to post messages

### Testing the Webhook:

You can test your webhook URL directly with curl:

```bash
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"Test message from PromptPilot"}' \
YOUR_WEBHOOK_URL
```

## Security Notes

- ✅ **Webhook URLs are safe** - They only allow posting to your specific channel
- ✅ **No sensitive data** - Only feedback content is sent
- ✅ **Team-only access** - Only your workspace members can see the messages

## Alternative Free Options

If you prefer other notification methods:

### 1. Email Notifications (FREE)
- Use Nodemailer with Gmail SMTP
- Send emails to your team's email addresses

### 2. Discord Webhooks (FREE)
- Similar to Slack, but for Discord servers
- Great for gaming/tech teams

### 3. Microsoft Teams (FREE)
- Use Teams webhooks for Microsoft-focused teams

## Cost Breakdown

| Service | Cost | Features |
|---------|------|----------|
| Slack Webhooks | **FREE** | Unlimited messages, rich formatting |
| Discord Webhooks | **FREE** | Unlimited messages, custom formatting |
| Email (Gmail SMTP) | **FREE** | 100 emails/day, basic formatting |
| Teams Webhooks | **FREE** | Unlimited messages, Microsoft integration |

**Total Cost: $0.00** 🎉




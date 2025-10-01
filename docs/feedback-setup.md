# Feedback System Setup

## Overview
The feedback system allows team members to submit feedback directly to a Slack channel via webhooks.

## Setup Instructions

### 1. Create a Slack Webhook
1. Go to your Slack workspace
2. Navigate to Apps → Incoming Webhooks
3. Create a new webhook for your desired channel
4. Copy the webhook URL

### 2. Configure Environment Variables
Add the following environment variable to your `.env.local` file:

```bash
SLACK_FEEDBACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### 3. Test the Integration
1. Start your development server
2. Navigate to `/feedback`
3. Submit a test feedback
4. Check your Slack channel for the message

## Features

### Feedback Types
- 🐛 **Bug Report**: Something is broken or not working
- ✨ **Feature Request**: Suggest a new feature
- 🔧 **Improvement**: Enhance an existing feature
- ❓ **Question**: Need help or clarification
- 💬 **Other**: Something else

### Priority Levels
- 🟢 **Low**: Nice to have
- 🟡 **Medium**: Should be addressed
- 🟠 **High**: Important to fix
- 🔴 **Urgent**: Critical issue

### Slack Message Format
The webhook sends formatted messages to Slack with:
- Reporter name
- Feedback type and priority
- Title and description
- Timestamp
- Source identification

## API Endpoint
- **URL**: `/api/feedback`
- **Method**: POST
- **Content-Type**: application/json

### Request Body
```json
{
  "type": "bug|feature|improvement|question|other",
  "priority": "low|medium|high|urgent",
  "title": "Brief title",
  "description": "Detailed description",
  "reporter": "Your name"
}
```

### Response
```json
{
  "success": true,
  "message": "Feedback sent to team successfully"
}
```

## Troubleshooting

### Common Issues
1. **Webhook not configured**: Ensure `SLACK_FEEDBACK_WEBHOOK_URL` is set
2. **Slack message not received**: Check webhook URL is correct
3. **Permission errors**: Ensure webhook has permission to post to the channel

### Debug Steps
1. Check browser console for errors
2. Check server logs for API errors
3. Test webhook URL directly with curl
4. Verify Slack app permissions



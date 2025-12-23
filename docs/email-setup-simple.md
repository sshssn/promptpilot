# 📧 Simple Email Feedback Setup (No API Required)

## How It Works

1. **User fills out feedback form**
2. **Form opens their email client** with pre-formatted message
3. **User hits send** to notify the team
4. **Done!** No servers, no APIs, no complexity

## Setup Instructions

### Step 1: Update Email Address
In `src/app/feedback/page.tsx`, line 72, change:
```javascript
const mailtoLink = `mailto:your-team@company.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
```

Replace `your-team@company.com` with your actual team email address.

### Step 2: Test It
1. Go to `http://localhost:3000/feedback`
2. Fill out the form
3. Click "Open Email Client"
4. Your email client should open with a formatted message
5. Hit send!

## What Your Team Will Receive

```
Subject: BUG: Login button not working

New Feedback from John Doe

Type: bug
Priority: urgent
Title: Login button not working

Description:
The login button is not responding when clicked. This happens on Chrome browser.

---
Submitted via PromptPilot Feedback System
```

## Benefits

✅ **Completely FREE** - No servers, no APIs, no costs  
✅ **Works everywhere** - Any device with email  
✅ **No setup required** - Just change the email address  
✅ **Professional formatting** - Clean, organized messages  
✅ **Instant delivery** - Email is sent immediately  
✅ **No dependencies** - Works without any external services  

## Customization Options

### Change Email Format
Edit the `emailBody` in the `handleSubmit` function to customize the message format.

### Add More Recipients
```javascript
const mailtoLink = `mailto:team1@company.com,team2@company.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
```

### Add CC/BCC
```javascript
const mailtoLink = `mailto:team@company.com?cc=manager@company.com&bcc=dev@company.com&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
```

## Troubleshooting

### Email Client Doesn't Open
- Make sure the user has a default email client set up
- On mobile, they might need to choose an email app

### Formatting Issues
- The email body uses plain text for maximum compatibility
- All email clients support the basic formatting used

### Multiple Recipients
- Use commas to separate multiple email addresses
- Some email clients have limits on the number of recipients

## Cost: $0.00 🎉

This solution requires:
- ✅ No external services
- ✅ No API keys
- ✅ No server configuration
- ✅ No monthly fees
- ✅ No rate limits

Just change the email address and you're done!




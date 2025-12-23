#!/usr/bin/env node

/**
 * Test script for Slack webhook integration
 * Run with: node test-slack-webhook.js
 */

const https = require('https');

// Replace with your actual webhook URL
const WEBHOOK_URL = process.env.SLACK_FEEDBACK_WEBHOOK_URL || 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK';

if (WEBHOOK_URL.includes('YOUR/SLACK/WEBHOOK')) {
  console.log('❌ Please set your SLACK_FEEDBACK_WEBHOOK_URL environment variable');
  console.log('   Add this to your .env.local file:');
  console.log('   SLACK_FEEDBACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK');
  process.exit(1);
}

const testMessage = {
  text: "🧪 Test message from PromptPilot",
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🧪 Test Feedback'
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: '*Reporter:*\nTest User'
        },
        {
          type: 'mrkdwn',
          text: '*Type:*\nTest'
        },
        {
          type: 'mrkdwn',
          text: '*Priority:*\n🟡 Medium'
        },
        {
          type: 'mrkdwn',
          text: '*Timestamp:*\n' + new Date().toLocaleString()
        }
      ]
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Description:*\nThis is a test message to verify the Slack webhook integration is working correctly.'
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '📝 Test message from PromptPilot Feedback System'
        }
      ]
    }
  ]
};

const postData = JSON.stringify(testMessage);

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🚀 Testing Slack webhook...');
console.log('📡 URL:', WEBHOOK_URL.replace(/\/services\/[^\/]+\/[^\/]+\/[^\/]+/, '/services/***/***/***'));

const req = https.request(WEBHOOK_URL, options, (res) => {
  console.log('📊 Status:', res.statusCode);
  console.log('📋 Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Success! Check your Slack channel for the test message.');
    } else {
      console.log('❌ Failed:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
});

req.write(postData);
req.end();




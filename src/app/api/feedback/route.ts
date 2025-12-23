import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Type definitions
interface FeedbackData {
  type: string;
  priority: string;
  title: string;
  description: string;
  reporter: string;
}

// Email configuration
const FEEDBACK_EMAIL = process.env.FEEDBACK_EMAIL || 'sarmadh+pp@joblogic.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

// Priority and type styling
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return '#dc2626'; // red
    case 'high': return '#ea580c'; // orange
    case 'medium': return '#d97706'; // amber
    case 'low': return '#16a34a'; // green
    default: return '#6b7280'; // gray
  }
};

const getTypeEmoji = (type: string) => {
  switch (type) {
    case 'bug': return '🐛';
    case 'feature': return '✨';
    case 'improvement': return '🔧';
    case 'question': return '❓';
    case 'other': return '💬';
    default: return '📝';
  }
};

export async function POST(request: NextRequest) {
  try {
    const data: FeedbackData = await request.json();
    
    // Validate required fields
    if (!data.type || !data.title || !data.description || !data.reporter) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Create HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Feedback - PromptPilot</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center; border-radius: 0;">
              <div style="display: inline-flex; align-items: center; gap: 12px; background: rgba(255, 255, 255, 0.15); padding: 12px 24px; border-radius: 50px; backdrop-filter: blur(10px);">
                <span style="font-size: 24px;">${getTypeEmoji(data.type)}</span>
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">
                  New Feedback Received
                </h1>
              </div>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 16px 0 0 0; font-size: 16px; font-weight: 500;">
                PromptPilot Team Notification
              </p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 32px 24px;">
              
              <!-- Feedback Title & Description -->
              <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); padding: 24px; border-radius: 16px; margin-bottom: 24px; border-left: 4px solid #3b82f6;">
                <h2 style="margin: 0 0 12px 0; color: #1e293b; font-size: 20px; font-weight: 600; line-height: 1.4;">
                  ${data.title || 'No title provided'}
                </h2>
                <p style="margin: 0; color: #475569; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${data.description}</p>
              </div>
              
              <!-- Metadata Grid -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
                
                <!-- Reporter -->
                <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
                    <h3 style="margin: 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Reporter</h3>
                  </div>
                  <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600;">${data.reporter}</p>
                </div>
                
                <!-- Type -->
                <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;"></div>
                    <h3 style="margin: 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Type</h3>
                  </div>
                  <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600; text-transform: capitalize;">${data.type}</p>
                </div>
                
                <!-- Priority -->
                <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <div style="width: 8px; height: 8px; background: ${getPriorityColor(data.priority)}; border-radius: 50%;"></div>
                    <h3 style="margin: 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Priority</h3>
                  </div>
                  <p style="margin: 0; color: ${getPriorityColor(data.priority)}; font-size: 16px; font-weight: 700; text-transform: capitalize;">${data.priority}</p>
                </div>
                
                <!-- Timestamp -->
                <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <div style="width: 8px; height: 8px; background: #8b5cf6; border-radius: 50%;"></div>
                    <h3 style="margin: 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Submitted</h3>
                  </div>
                  <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600;">${new Date().toLocaleString()}</p>
                </div>
              </div>
              
              <!-- Action Footer -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 24px; border-radius: 16px; text-align: center; border: 1px solid #e2e8f0;">
                <div style="display: inline-flex; align-items: center; gap: 8px; background: #ffffff; padding: 12px 20px; border-radius: 50px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
                  <span style="font-size: 16px;">📝</span>
                  <p style="margin: 0; color: #475569; font-size: 14px; font-weight: 500;">
                    Submitted via PromptPilot Feedback System
                  </p>
                </div>
                <p style="margin: 16px 0 0 0; color: #64748b; font-size: 12px;">
                  This feedback was automatically generated and sent to the development team.
                </p>
              </div>
              
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                © 2024 PromptPilot. All rights reserved.
              </p>
            </div>
            
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: FROM_EMAIL,
      to: [FEEDBACK_EMAIL],
      subject: `${getTypeEmoji(data.type)} [${data.priority.toUpperCase()}] ${data.title} - PromptPilot Feedback`,
      html: htmlContent,
    });

    console.log('Email sent successfully:', emailResponse);

    return NextResponse.json({ 
      success: true, 
      messageId: emailResponse.data?.id 
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
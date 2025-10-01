import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface FeedbackData {
  type: string;
  priority: string;
  title: string;
  description: string;
  reporter: string;
}

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

    // Email configuration (using Gmail SMTP - FREE)
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS  // Your Gmail app password
      }
    });

    const priorityEmoji = {
      low: '🟢',
      medium: '🟡', 
      high: '🟠',
      urgent: '🔴'
    };

    const typeEmoji = {
      bug: '🐛',
      feature: '✨',
      improvement: '🔧',
      question: '❓',
      other: '💬'
    };

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">
            ${typeEmoji[data.type as keyof typeof typeEmoji] || '💬'} New Feedback
          </h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef;">
          <h2 style="color: #333; margin-top: 0;">${data.title}</h2>
          
          <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Reporter:</td>
                <td style="padding: 8px;">${data.reporter}</td>
              </tr>
              <tr style="background: #f8f9fa;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Type:</td>
                <td style="padding: 8px;">${data.type.charAt(0).toUpperCase() + data.type.slice(1)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Priority:</td>
                <td style="padding: 8px;">${priorityEmoji[data.priority as keyof typeof priorityEmoji] || '🟡'} ${data.priority.charAt(0).toUpperCase() + data.priority.slice(1)}</td>
              </tr>
              <tr style="background: #f8f9fa;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Timestamp:</td>
                <td style="padding: 8px;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 6px;">
            <h3 style="color: #333; margin-top: 0;">Description:</h3>
            <p style="line-height: 1.6; color: #555; white-space: pre-wrap;">${data.description}</p>
          </div>
        </div>
        
        <div style="background: #e9ecef; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6c757d;">
          📝 Submitted via PromptPilot Feedback System
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.TEAM_EMAIL || process.env.EMAIL_USER, // Send to team or yourself
      subject: `${typeEmoji[data.type as keyof typeof typeEmoji] || '💬'} ${data.title} - ${data.priority.toUpperCase()}`,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback sent to team via email' 
    });

  } catch (error) {
    console.error('Email feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to send feedback email' },
      { status: 500 }
    );
  }
}



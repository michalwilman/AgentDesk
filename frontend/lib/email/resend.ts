import { Resend } from 'resend'

// Initialize Resend only if API key is available
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

interface ContactRequestEmailData {
  fullName: string
  email: string
  company?: string
  message: string
  requestId: string
}

export async function sendContactRequestEmail(data: ContactRequestEmailData) {
  // If Resend is not configured, log a warning and skip email
  if (!resend) {
    console.warn('⚠️ Resend API key not configured. Email notification skipped.')
    console.log('📧 Contact request received from:', data.email)
    return { success: false, message: 'Email service not configured' }
  }

  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #00D9FF 0%, #00B8D4 100%);
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 24px;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .info-row {
              background: white;
              padding: 15px;
              margin: 10px 0;
              border-radius: 5px;
              border-left: 4px solid #00D9FF;
            }
            .info-row strong {
              color: #00B8D4;
              display: inline-block;
              min-width: 120px;
            }
            .message-box {
              background: white;
              padding: 20px;
              margin: 20px 0;
              border-radius: 5px;
              border: 1px solid #e0e0e0;
              white-space: pre-wrap;
              font-family: 'Courier New', monospace;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              color: #666;
              font-size: 12px;
            }
            .badge {
              display: inline-block;
              background: #4CAF50;
              color: white;
              padding: 5px 15px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎯 New Premium Plan Inquiry</h1>
            <div class="badge">CONTACT REQUEST</div>
          </div>
          
          <div class="content">
            <p>שלום מיכל! 👋</p>
            <p>התקבלה פנייה חדשה לתוכנית Premium במערכת AgentDesk:</p>
            
            <div class="info-row">
              <strong>👤 שם מלא:</strong> ${data.fullName}
            </div>
            
            <div class="info-row">
              <strong>📧 אימייל:</strong> <a href="mailto:${data.email}">${data.email}</a>
            </div>
            
            ${data.company ? `
            <div class="info-row">
              <strong>🏢 חברה:</strong> ${data.company}
            </div>
            ` : ''}
            
            <div class="info-row">
              <strong>🆔 מזהה פנייה:</strong> <code>${data.requestId}</code>
            </div>
            
            <h3 style="color: #00B8D4; margin-top: 30px;">💬 ההודעה:</h3>
            <div class="message-box">
${data.message}
            </div>
            
            <p style="margin-top: 30px;">
              <a href="mailto:${data.email}?subject=Re: Premium Plan Inquiry" 
                 style="display: inline-block; background: linear-gradient(135deg, #00D9FF 0%, #00B8D4 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                📧 השב ללקוח
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>מערכת AgentDesk | Contact Request Notification</p>
            <p style="color: #999; font-size: 11px;">Request ID: ${data.requestId}</p>
          </div>
        </body>
      </html>
    `

    const { data: emailData, error } = await resend.emails.send({
      from: 'AgentDesk <onboarding@resend.dev>', // You'll need to verify your domain
      to: ['michal.vilman@gmail.com'],
      subject: `🎯 פנייה חדשה ל-Premium Plan מ-${data.fullName}`,
      html: emailHtml,
      replyTo: data.email
    })

    if (error) {
      console.error('Failed to send email:', error)
      return { success: false, message: error.message }
    }

    console.log('✅ Email sent successfully:', emailData)
    return { success: true, emailId: emailData?.id }

  } catch (error: any) {
    console.error('Error in sendContactRequestEmail:', error)
    return { success: false, message: error.message }
  }
}


const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // Check if we want to simulate emails (useful for development)
  const simulateEmails = process.env.SIMULATE_EMAILS === 'true';
  
  if (simulateEmails) {
    // Create a test transporter that logs instead of sending
    return {
      sendMail: async (mailOptions) => {
        console.log('📧 Email sending attempt (SIMULATED):');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('HTML Content Length:', mailOptions.html ? mailOptions.html.length : 0);
        
        // Extract OTP from HTML content if it's an OTP email
        if (mailOptions.subject.includes('OTP')) {
          const otpMatch = mailOptions.html.match(/font-family: 'Courier New'[^>]*>([0-9]{6})</i);
          if (otpMatch) {
            console.log('🔐 OTP CODE:', otpMatch[1]);
          }
        }
        
        console.log('✅ Email delivery simulated');
        return { messageId: 'demo-' + Date.now() };
      }
    };
  }
  
  // Use actual nodemailer transporter
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Faculty Management System - Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Password Reset Request</h2>
        <p>You requested a password reset for your Faculty Management System account.</p>
        <p>Click the link below to reset your password (valid for 1 hour):</p>
        <a href="${resetUrl}" 
           style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
          Reset Password
        </a>
        <p>If the button above doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>For security reasons, this link will expire in 1 hour.</p>
        <hr style="margin: 24px 0;">
        <p style="color: #666; font-size: 14px;">
          Faculty Management System<br>
          This is an automated message, please do not reply.
        </p>
      </div>
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email, 'Message ID:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email: ' + error.message);
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, firstName, userType) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Faculty Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Welcome to Faculty Management System!</h2>
        <p>Hello ${firstName},</p>
        <p>Your account has been successfully created as a <strong>${userType}</strong>.</p>
        ${userType === 'faculty' ? 
          '<p><strong>Note:</strong> Your account is pending approval from the administrator. You will receive another email once your account is activated.</p>' :
          '<p>You can now log in and start using the system.</p>'
        }
        <a href="${process.env.FRONTEND_URL}" 
           style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
          Login to System
        </a>
        <p>If you have any questions, please contact the administrator.</p>
        <hr style="margin: 24px 0;">
        <p style="color: #666; font-size: 14px;">
          Faculty Management System<br>
          This is an automated message, please do not reply.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email failure - it's not critical
    return false;
  }
};

// Send OTP email
const sendOTPEmail = async (email, otp, purpose) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Centurion University - OTP Verification`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e3a8a; margin-bottom: 10px;">CENTURION UNIVERSITY</h1>
          <p style="color: #666; margin: 0;">Excellence in Education & Research</p>
        </div>
        
        <h2 style="color: #3b82f6;">Email Verification Required</h2>
        <p>You requested to proceed with your <strong>${purpose}</strong>.</p>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; padding: 20px; border-radius: 10px; 
                    text-align: center; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-size: 16px;">Your verification code is:</p>
          <h1 style="margin: 0; font-size: 36px; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Valid for 10 minutes</p>
        </div>
        
        <p><strong>Important:</strong></p>
        <ul style="color: #666;">
          <li>This OTP is valid for 10 minutes only</li>
          <li>You have 3 attempts to enter the correct OTP</li>
          <li>Do not share this code with anyone</li>
        </ul>
        
        <p>If you didn't request this verification, please ignore this email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 14px; text-align: center;">
          © 2024 Centurion University - All Rights Reserved<br>
          This is an automated message, please do not reply.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to: ${email} for ${purpose}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 OTP email sending simulated for development mode');
      return true;
    }
    return false; // Don't throw error, just return false
  }
};

// Send faculty application confirmation email
const sendFacultyApplicationConfirmation = async (email, firstName, applicationId) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Centurion University - Faculty Application Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e3a8a; margin-bottom: 10px;">CENTURION UNIVERSITY</h1>
          <p style="color: #666; margin: 0;">Excellence in Education & Research</p>
        </div>
        
        <h2 style="color: #16a34a;">✅ Application Submitted Successfully!</h2>
        
        <p>Dear ${firstName},</p>
        
        <p>Thank you for your interest in joining Centurion University as a faculty member. We have successfully received your application.</p>
        
        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">Application Details</h3>
          <p style="margin: 5px 0;"><strong>Application ID:</strong> ${applicationId}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> Under Review</p>
          <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <h3 style="color: #3b82f6;">What's Next?</h3>
        <ol style="color: #666; line-height: 1.6;">
          <li><strong>Review Process:</strong> Our HR team will carefully examine your qualifications and experience</li>
          <li><strong>Initial Screening:</strong> We will assess your fit with our academic requirements</li>
          <li><strong>Shortlisting:</strong> Qualified candidates will be contacted for the next round</li>
          <li><strong>Interview:</strong> Final selection will include interviews with department heads</li>
        </ol>
        
        <div style="background: #ecfdf5; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #166534;"><strong>📅 Timeline:</strong> We will contact you within 5-7 business days with an update on your application status.</p>
        </div>
        
        <p>Please keep your application ID safe for future reference. If you have any questions, feel free to contact our HR department.</p>
        
        <p>We appreciate your interest in contributing to our academic excellence and look forward to potentially welcoming you to our faculty family.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <div style="text-align: center;">
          <p style="color: #666; font-size: 14px; margin: 5px 0;">📧 hr@centurionuniversity.edu | 📞 +1 (555) 234-5678</p>
          <p style="color: #666; font-size: 14px; margin: 5px 0;">© 2024 Centurion University - All Rights Reserved</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Faculty application confirmation sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw error for confirmation email failure
    return false;
  }
};

// Send application status update email
const sendApplicationStatusUpdate = async (email, firstName, applicationId, newStatus) => {
  const transporter = createTransporter();
  
  const statusInfo = {
    'under-review': { title: 'Application Under Review', color: '#f59e0b', emoji: '📋' },
    'shortlisted': { title: 'Congratulations! You\'ve been Shortlisted', color: '#10b981', emoji: '🎉' },
    'rejected': { title: 'Application Update', color: '#ef4444', emoji: '📄' },
    'hired': { title: 'Welcome to Centurion University!', color: '#16a34a', emoji: '🎊' }
  };
  
  const status = statusInfo[newStatus] || { title: 'Application Update', color: '#6b7280', emoji: '📄' };
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Centurion University - ${status.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e3a8a; margin-bottom: 10px;">CENTURION UNIVERSITY</h1>
          <p style="color: #666; margin: 0;">Excellence in Education & Research</p>
        </div>
        
        <h2 style="color: ${status.color};">${status.emoji} ${status.title}</h2>
        
        <p>Dear ${firstName},</p>
        
        <p>We wanted to update you on the status of your faculty application.</p>
        
        <div style="background: #f8fafc; border-left: 4px solid ${status.color}; padding: 16px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Application ID:</strong> ${applicationId}</p>
          <p style="margin: 5px 0;"><strong>New Status:</strong> <span style="color: ${status.color}; font-weight: bold; text-transform: capitalize;">${newStatus.replace('-', ' ')}</span></p>
          <p style="margin: 5px 0;"><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        ${newStatus === 'shortlisted' ? `
          <div style="background: #ecfdf5; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #166534;"><strong>Next Steps:</strong> Our HR team will contact you within 2-3 business days to schedule your interview. Please keep your phone and email accessible.</p>
          </div>
        ` : ''}
        
        ${newStatus === 'hired' ? `
          <div style="background: #ecfdf5; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #166534;"><strong>Welcome Aboard!</strong> We are excited to have you join our faculty. Our HR team will send you onboarding information and next steps within 24 hours.</p>
          </div>
        ` : ''}
        
        ${newStatus === 'rejected' ? `
          <p>While we were impressed with your qualifications, we have decided to move forward with other candidates whose experience more closely matches our current needs.</p>
          <p>We encourage you to apply for future openings that match your expertise. Your application will remain in our system for consideration for relevant positions.</p>
        ` : ''}
        
        <p>If you have any questions about this update, please don't hesitate to contact our HR department.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <div style="text-align: center;">
          <p style="color: #666; font-size: 14px; margin: 5px 0;">📧 hr@centurionuniversity.edu | 📞 +1 (555) 234-5678</p>
          <p style="color: #666; font-size: 14px; margin: 5px 0;">© 2024 Centurion University - All Rights Reserved</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Status update email sent to: ${email} - Status: ${newStatus}`);
    return true;
  } catch (error) {
    console.error('Error sending status update email:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOTPEmail,
  sendFacultyApplicationConfirmation,
  sendApplicationStatusUpdate
};
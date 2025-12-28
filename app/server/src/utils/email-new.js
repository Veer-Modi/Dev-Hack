import nodemailer from 'nodemailer';

// Create Ethereal account for development
async function createTestAccount() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Ethereal account created:');
    console.log('Email:', testAccount.user);
    console.log('Password:', testAccount.pass);
    console.log('SMTP URL:', nodemailer.getTestMessageUrl(testAccount));
    return testAccount;
  } catch (error) {
    console.error('Failed to create Ethereal account:', error);
    return null;
  }
}

let transporter = null;
let testAccount = null;

// Initialize transporter
async function initTransporter() {
  if (!transporter) {
    testAccount = await createTestAccount();
    if (testAccount) {
      transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }
  }
  return transporter;
}

export const sendPasswordEmail = async (email, name, password, role) => {
  try {
    const mailTransporter = await initTransporter();
    
    if (!mailTransporter) {
      throw new Error('Failed to create email transporter');
    }
    
    const mailOptions = {
      from: '"Rapid Response System" <noreply@rapidresponse.com>',
      to: email,
      subject: `Your ${role.charAt(0).toUpperCase() + role.slice(1)} Account Credentials`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Rapid Response System</h2>
          <p>Hello ${name},</p>
          <p>An administrator has created a ${role} account for you in the Rapid Response System.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> <code style="background: #fff; padding: 2px 4px; border-radius: 3px;">${password}</code></p>
            <p><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
          </div>
          <p>Please keep this information secure and change your password after first login.</p>
          <p>You can login at: <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/login">Login Portal</a></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `,
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log('Password email sent:', info.messageId);
    
    // Log the preview URL
    if (testAccount) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Failed to send password email:', error);
    // Always log the password to console as backup
    console.log(`=== USER CREDENTIALS ===`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${role}`);
    console.log(`========================`);
    return false;
  }
};

import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Welcome to Starup!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to Starup!</h1>
          <p>Hi ${user.username},</p>
          <p>Welcome to our promotional training platform! We're excited to have you on board.</p>
          <p>Your referral link: <a href="${user.getReferralLink()}">${user.getReferralLink()}</a></p>
          <p>Start your journey by watching today's daily video and beginning your 7-day training program.</p>
          <p>Best regards,<br>The Starup Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully');
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  async sendPinApprovalEmail(user, pinRequest) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Pin Request Approved!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">Pin Request Approved!</h1>
          <p>Hi ${user.username},</p>
          <p>Great news! Your pin request for ${pinRequest.requestedLevel} has been approved.</p>
          <p>Your pin: <strong>${pinRequest.pin}</strong></p>
          <p>Please log in to your account to activate your pin and complete the upgrade process.</p>
          <p>Best regards,<br>The Starup Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Pin approval email sent successfully');
    } catch (error) {
      console.error('Error sending pin approval email:', error);
    }
  }

  async sendWithdrawalStatusEmail(user, withdrawal) {
    const statusColors = {
      completed: '#10b981',
      rejected: '#ef4444',
      processing: '#f59e0b'
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Withdrawal Request ${withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: ${statusColors[withdrawal.status]};">Withdrawal Update</h1>
          <p>Hi ${user.username},</p>
          <p>Your withdrawal request of ₹${withdrawal.amount} has been ${withdrawal.status}.</p>
          ${withdrawal.transactionId ? `<p>Transaction ID: <strong>${withdrawal.transactionId}</strong></p>` : ''}
          ${withdrawal.notes ? `<p>Notes: ${withdrawal.notes}</p>` : ''}
          <p>Best regards,<br>The Starup Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Withdrawal status email sent successfully');
    } catch (error) {
      console.error('Error sending withdrawal status email:', error);
    }
  }
}

export default new EmailService();
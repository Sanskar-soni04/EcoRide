const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOTP(email, otp, subject, messagePrefix) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'EcoRide <onboarding@resend.dev>', // until you verify your own domain
      to: [email],
      subject: subject || 'EcoRide OTP',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#050a0e;border-radius:24px;padding:40px;border:1px solid rgba(255,255,255,0.08);">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#00e676,#26c6da);display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
              <svg width="28" height="28" viewBox="0 0 26 26" fill="none"><path d="M13 3C13 3 6 7.5 6 14C6 17.86 9.14 21 13 21C16.86 21 20 17.86 20 14C20 7.5 13 3 13 3Z" fill="rgba(5,10,14,0.82)"/><line x1="13" y1="3" x2="13" y2="19.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.1" strokeLinecap="round"/><line x1="13" y1="10" x2="16.5" y2="7.5" stroke="rgba(255,255,255,0.38)" strokeWidth="0.9" strokeLinecap="round"/><line x1="13" y1="13.5" x2="9.5" y2="11" stroke="rgba(255,255,255,0.38)" strokeWidth="0.9" strokeLinecap="round"/></svg>
            </div>
            <h1 style="color:#e8f4f0;font-size:22px;font-weight:800;margin:0;">EcoRide</h1>
            <p style="color:rgba(232,244,240,0.4);font-size:14px;margin:6px 0 0;">Green commute · Campus</p>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;text-align:center;">
            <p style="color:rgba(232,244,240,0.7);font-size:15px;margin:0 0 16px;">${messagePrefix || 'Your EcoRide verification code'}</p>
            <div style="background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.2);border-radius:12px;padding:16px;display:inline-block;">
              <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#00e676;font-family:monospace;">${otp}</span>
            </div>
            <p style="color:rgba(232,244,240,0.3);font-size:12px;margin:16px 0 0;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Failed to send email:', err);
    throw err;
  }
}

module.exports = { sendOTP };
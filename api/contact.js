const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const b = req.body || {};
    const resend = new Resend(process.env.RESEND_API_KEY);
    const subject = (b.form_type === 'quote' ? 'New Quote Request' : 'New BPO Enquiry') +
      ' — ' + (b.company || b.first_name || 'Unknown');

    await resend.emails.send({
      from: 'Serviquent Global Solutions <noreply@serviquentgs.com>',
      to: ['info@serviquent.com'],
      reply_to: b.email || undefined,
      subject: subject,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#0ea5c8,#1a6fc4);padding:28px 32px;border-radius:10px 10px 0 0">
          <h2 style="color:#fff;margin:0;font-size:20px">${b.form_type === 'quote' ? 'New Quote Request' : 'New BPO Enquiry'}</h2>
          <p style="color:rgba(255,255,255,.8);margin:4px 0 0;font-size:13px">Received via serviquentgs.com</p>
        </div>
        <div style="background:#fff;padding:28px 32px;border:1px solid #e5e7eb;border-top:none">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:10px 0;width:30%;color:#6b7280;font-weight:600">Name</td><td style="padding:10px 0;color:#111">${b.first_name || ''} ${b.last_name || ''}</td></tr>
            <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:10px 0;color:#6b7280;font-weight:600">Email</td><td style="padding:10px 0"><a href="mailto:${b.email}" style="color:#0ea5c8">${b.email || ''}</a></td></tr>
            <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:10px 0;color:#6b7280;font-weight:600">Phone</td><td style="padding:10px 0;color:#111">${b.phone || 'Not provided'}</td></tr>
            <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:10px 0;color:#6b7280;font-weight:600">Company</td><td style="padding:10px 0;color:#111;font-weight:500">${b.company || 'Not provided'}</td></tr>
            <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:10px 0;color:#6b7280;font-weight:600">Country</td><td style="padding:10px 0;color:#111">${b.country || 'Not provided'}</td></tr>
            <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:10px 0;color:#6b7280;font-weight:600">Service</td><td style="padding:10px 0"><span style="background:#eff6ff;color:#0ea5c8;padding:3px 10px;border-radius:20px;font-weight:600;font-size:12px">${b.service || 'Not specified'}</span></td></tr>
            ${b.team_size ? `<tr style="border-bottom:1px solid #f3f4f6"><td style="padding:10px 0;color:#6b7280;font-weight:600">Team Size</td><td style="padding:10px 0;color:#111">${b.team_size}</td></tr>` : ''}
            <tr><td style="padding:10px 0;color:#6b7280;font-weight:600;vertical-align:top">Message</td><td style="padding:10px 0;color:#374151;line-height:1.7">${(b.message || 'No message').replace(/\n/g, '<br/>')}</td></tr>
          </table>
        </div>
        <div style="background:#f9fafb;padding:14px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px">
          <p style="margin:0;font-size:12px;color:#9ca3af">Submitted from <strong>serviquentgs.com</strong></p>
        </div>
      </div>`
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: err.message });
  }
};

const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const b = req.body || {};
    const first_name = b.first_name || '';
    const last_name  = b.last_name  || '';
    const email      = b.email      || '';
    const phone      = b.phone      || 'Not provided';
    const company    = b.company    || 'Not provided';
    const country    = b.country    || 'Not provided';
    const service    = b.service    || 'Not specified';
    const team_size  = b.team_size  || '';
    const message    = b.message    || 'No message provided';
    const form_type  = b.form_type  || 'contact';

    const resend = new Resend(process.env.RESEND_API_KEY);

    const subject = form_type === 'quote'
      ? 'New Quote Request — ' + (company || first_name || 'Unknown')
      : 'New BPO Enquiry — '   + (company || first_name || 'Unknown');

    await resend.emails.send({
      from: 'Serviquent Global Solutions <noreply@serviquentgs.com>',
      to:   ['info@serviquent.com'],
      reply_to: email || undefined,
      subject:  subject,
      html: `
<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
  <div style="background:linear-gradient(135deg,#0ea5c8,#1a6fc4);padding:30px 32px">
    <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">${form_type === 'quote' ? 'New Quote Request' : 'New BPO Enquiry'}</h1>
    <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">Received via serviquentgs.com</p>
  </div>
  <div style="padding:32px;background:#ffffff">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:12px 0;width:32%;color:#6b7280;font-weight:600">Name</td><td style="padding:12px 0;color:#111827;font-weight:500">${first_name} ${last_name}</td></tr>
      <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:12px 0;color:#6b7280;font-weight:600">Email</td><td style="padding:12px 0"><a href="mailto:${email}" style="color:#0ea5c8">${email}</a></td></tr>
      <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:12px 0;color:#6b7280;font-weight:600">Phone</td><td style="padding:12px 0;color:#111827">${phone}</td></tr>
      <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:12px 0;color:#6b7280;font-weight:600">Company</td><td style="padding:12px 0;color:#111827;font-weight:500">${company}</td></tr>
      <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:12px 0;color:#6b7280;font-weight:600">Country</td><td style="padding:12px 0;color:#111827">${country}</td></tr>
      <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:12px 0;color:#6b7280;font-weight:600">Service</td><td style="padding:12px 0"><span style="background:#eff6ff;color:#0ea5c8;padding:4px 12px;border-radius:20px;font-weight:600;font-size:13px">${service}</span></td></tr>
      ${team_size ? `<tr style="border-bottom:1px solid #f3f4f6"><td style="padding:12px 0;color:#6b7280;font-weight:600">Team Size</td><td style="padding:12px 0;color:#111827">${team_size}</td></tr>` : ''}
      <tr><td style="padding:12px 0;color:#6b7280;font-weight:600;vertical-align:top">Message</td><td style="padding:12px 0;color:#374151;line-height:1.7">${message.replace(/\n/g, '<br/>')}</td></tr>
    </table>
  </div>
  <div style="padding:18px 32px;background:#f9fafb;border-top:1px solid #e5e7eb">
    <p style="margin:0;font-size:12px;color:#9ca3af">Submitted from <strong>serviquentgs.com</strong> &mdash; Serviquent Global Solutions</p>
  </div>
</div>`
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send', details: err.message });
  }
};

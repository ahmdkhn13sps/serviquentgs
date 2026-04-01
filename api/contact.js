import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      company,
      country,
      service,
      team_size,
      message,
      form_type
    } = req.body;

    const subject = form_type === 'quote'
      ? `New Quote Request — ${company || first_name || 'Unknown'}`
      : `New BPO Enquiry — ${company || first_name || 'Unknown'}`;

    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;border-radius:8px;overflow:hidden">
        <div style="background:#0ea5c8;padding:28px 32px">
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">
            ${form_type === 'quote' ? '&#127881; New Quote Request' : '&#128231; New BPO Enquiry'}
          </h1>
          <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">
            Received from serviquentgs.com
          </p>
        </div>
        <div style="padding:32px;background:#fff">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;width:35%"><strong style="color:#555;font-size:13px">Name</strong></td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#111;font-size:14px">${first_name || ''} ${last_name || ''}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0"><strong style="color:#555;font-size:13px">Email</strong></td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0"><a href="mailto:${email}" style="color:#0ea5c8;font-size:14px">${email || ''}</a></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0"><strong style="color:#555;font-size:13px">Phone</strong></td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#111;font-size:14px">${phone || 'N/A'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0"><strong style="color:#555;font-size:13px">Company</strong></td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#111;font-size:14px">${company || 'N/A'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0"><strong style="color:#555;font-size:13px">Country</strong></td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#111;font-size:14px">${country || 'N/A'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0"><strong style="color:#555;font-size:13px">Service</strong></td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#111;font-size:14px"><strong style="color:#0ea5c8">${service || 'N/A'}</strong></td></tr>
            ${team_size ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0"><strong style="color:#555;font-size:13px">Team Size</strong></td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#111;font-size:14px">${team_size}</td></tr>` : ''}
            <tr><td style="padding:10px 0" valign="top"><strong style="color:#555;font-size:13px">Message</strong></td><td style="padding:10px 0;color:#111;font-size:14px;line-height:1.6">${(message || 'No message provided').replace(/\n/g, '<br/>')}</td></tr>
          </table>
        </div>
        <div style="padding:20px 32px;background:#f9f9f9;border-top:1px solid #eee">
          <p style="margin:0;font-size:12px;color:#999">Sent from serviquentgs.com &#183; Serviquent Global Solutions</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'Serviquent Global Solutions <noreply@serviquentgs.com>',
      to: ['info@serviquent.com'],
      reply_to: email,
      subject: subject,
      html: htmlBody,
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}

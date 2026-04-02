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
    const isCareers = b.form_type === 'careers';
    const isQuote   = b.form_type === 'quote';

    const subject = isCareers
      ? '[Careers] New Application: ' + (b.service || 'Open Role') + ' - ' + (b.first_name || '') + ' ' + (b.last_name || '')
      : isQuote
        ? '[Quote] ' + (b.company || b.first_name || 'New Lead') + ' - ' + (b.service || 'Service Enquiry')
        : '[Enquiry] ' + (b.company || b.first_name || 'New Lead') + ' - ' + (b.service || 'BPO Enquiry');

    const rows = isCareers ? [
      ['Name',       (b.first_name||'') + ' ' + (b.last_name||'')],
      ['Email',      b.email || ''],
      ['Phone',      b.phone || 'Not provided'],
      ['Role',       b.service || 'Not specified'],
      ['City',       b.country || 'Not provided'],
      ['Experience', b.team_size || 'Not specified'],
      ['About',      (b.message || '').replace(/\n/g,'<br/>')]
    ] : [
      ['Name',      (b.first_name||'') + ' ' + (b.last_name||'')],
      ['Email',     b.email || ''],
      ['Phone',     b.phone || 'Not provided'],
      ['Company',   b.company || 'Not provided'],
      ['Country',   b.country || 'Not provided'],
      ['Service',   b.service || 'Not specified'],
      ['Team Size', b.team_size || 'N/A'],
      ['Message',   (b.message || '').replace(/\n/g,'<br/>')]
    ];

    const tableRows = rows.map(([k,v]) =>
      `<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;width:28%;color:#666;font-weight:600;font-size:13px;vertical-align:top">${k}</td><td style="padding:10px 0;color:#111;font-size:13px;vertical-align:top">${v}</td></tr>`
    ).join('');

    const accentColor = isCareers ? '#1a6fc4' : '#0ea5c8';
    const emoji = isCareers ? '&#128101;' : (isQuote ? '&#128179;' : '&#128231;');
    const title = isCareers ? 'New Job Application' : (isQuote ? 'New Quote Request' : 'New BPO Enquiry');
    const source = isCareers ? 'serviquentgs.com/careers' : 'serviquentgs.com';

    const html = `<!DOCTYPE html><html><body>
<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
  <div style="background:${accentColor};padding:24px 28px">
    <h2 style="color:#fff;margin:0;font-size:18px">${emoji} ${title}</h2>
    <p style="color:rgba(255,255,255,.8);margin:4px 0 0;font-size:12px">Received via ${source}</p>
  </div>
  <div style="padding:24px 28px;background:#fff">
    <table style="width:100%;border-collapse:collapse">${tableRows}</table>
  </div>
  <div style="padding:12px 28px;background:#f9f9f9;border-top:1px solid #eee">
    <p style="margin:0;font-size:11px;color:#999">Reply directly to this email to respond to the enquiry.</p>
  </div>
</div></body></html>`;

    const result = await resend.emails.send({
      from: 'Serviquent Website <onboarding@resend.dev>',
      to: ['info@serviquent.com'],
      reply_to: b.email || undefined,
      subject: subject,
      html: html
    });

    console.log('Resend result:', JSON.stringify(result));
    return res.status(200).json({ success: true, id: result.data ? result.data.id : null });

  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

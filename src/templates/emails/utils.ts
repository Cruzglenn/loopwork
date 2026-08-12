export type TemplateBadge = {
  text: string;
  variant: 'success' | 'danger' | 'info' | 'warning';
};

export type TemplateDetail = {
  label: string;
  value: string;
};

export type TemplateOptions = {
  heading: string;
  subheading?: string;
  badge?: TemplateBadge;
  content?: string;
  details?: TemplateDetail[];
  cta?: { label: string; href: string };
};

export function templateHtml(
  headingOrOptions: string | TemplateOptions,
  legacyContent?: string,
  legacyCta?: { label: string; href: string },
): string {
  const options: TemplateOptions =
    typeof headingOrOptions === 'string'
      ? {
          heading: headingOrOptions,
          content: legacyContent,
          cta: legacyCta,
        }
      : headingOrOptions;

  const { heading, subheading, badge, content, details, cta } = options;

  let badgeHtml = '';
  if (badge) {
    let bg = '#eff6ff';
    let textCol = '#1d4ed8';
    let borderCol = '#bfdbfe';

    if (badge.variant === 'success') {
      bg = '#ecfdf5';
      textCol = '#047857';
      borderCol = '#a7f3d0';
    } else if (badge.variant === 'danger') {
      bg = '#fef2f2';
      textCol = '#b91c1c';
      borderCol = '#fecaca';
    } else if (badge.variant === 'warning') {
      bg = '#fffbeb';
      textCol = '#b45309';
      borderCol = '#fde68a';
    }

    badgeHtml = `
      <div style="display: inline-block; margin-bottom: 20px; padding: 6px 14px; background-color: ${bg}; border: 1px solid ${borderCol}; border-radius: 0px; color: ${textCol}; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
        ${badge.text}
      </div>`;
  }

  let detailsHtml = '';
  if (details && details.length > 0) {
    const rows = details
      .map(
        (d, idx) => `
      <tr class="detail-row">
        <td style="padding: 14px 16px; font-size: 13px; font-weight: 600; color: #64748b; ${idx < details.length - 1 ? 'border-bottom: 1px solid #e2e8f0;' : ''} width: 40%; vertical-align: middle; box-sizing: border-box;" class="detail-label">${d.label}</td>
        <td style="padding: 14px 16px; font-size: 14px; font-weight: 700; color: #0f172a; ${idx < details.length - 1 ? 'border-bottom: 1px solid #e2e8f0;' : ''} text-align: right; word-break: break-all; vertical-align: middle; box-sizing: border-box;" class="detail-val">${d.value}</td>
      </tr>`,
      )
      .join('');

    detailsHtml = `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 24px; margin-bottom: 12px; background-color: #f8fafc; border-radius: 0px; border: 1px solid #cbd5e1; border-collapse: separate; border-spacing: 0; table-layout: fixed; width: 100%; box-sizing: border-box;" class="detail-box">
        <tbody>
          ${rows}
        </tbody>
      </table>`;
  }

  const subheadingHtml = subheading
    ? `<p style="margin: 0 0 16px 0; font-size: 15px; color: #475569; line-height: 1.6;" class="email-muted">${subheading}</p>`
    : '';

  const contentHtml = content
    ? `<div style="font-size: 15px; line-height: 1.6; color: #334155;" class="email-text">${content}</div>`
    : '';

  const ctaHtml = cta
    ? `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 28px;">
      <tr>
        <td align="center">
          <a href="${cta.href}" target="_blank" style="display: inline-block; background-color: #0A11EB; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 0px; letter-spacing: 0.3px; border: none;" class="cta-btn">
            ${cta.label}
          </a>
        </td>
      </tr>
    </table>`
    : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Loopwork</title>
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }

    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 16px 8px !important; }
      .email-card { padding: 24px 16px !important; border-radius: 0px !important; }
      .detail-box { width: 100% !important; table-layout: auto !important; }
      .detail-row { display: block !important; width: 100% !important; }
      .detail-label { display: block !important; width: 100% !important; text-align: left !important; padding: 10px 12px 2px 12px !important; border-bottom: none !important; font-size: 12px !important; }
      .detail-val { display: block !important; width: 100% !important; text-align: left !important; padding: 2px 12px 12px 12px !important; font-size: 14px !important; word-break: break-all !important; }
      .cta-btn { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; padding: 14px 16px !important; }
    }

    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #0f172a !important; }
      .email-card { background-color: #1e293b !important; border-color: #334155 !important; }
      .email-title { color: #f8fafc !important; }
      .email-text { color: #cbd5e1 !important; }
      .email-muted { color: #94a3b8 !important; }
      .detail-box { background-color: #0f172a !important; border-color: #334155 !important; }
      .detail-label { color: #94a3b8 !important; border-color: #334155 !important; }
      .detail-val { color: #f8fafc !important; border-color: #334155 !important; }
      .email-footer { color: #64748b !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;" class="email-bg">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; table-layout: fixed;" class="email-bg">
    <tr>
      <td align="center" style="padding: 32px 12px;" class="email-container">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 0 auto;">
          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <a href="https://eurielleivy.site" target="_blank" style="text-decoration: none;">
                <img src="https://eygaannaqiztkkxfkpsh.supabase.co/storage/v1/object/public/photos/default-org-id/ChatGPT_Image_Aug_10__2026__04_12_04_AM.webp" alt="Loopwork" height="44" style="display: block; height: 44px; max-height: 44px; width: auto; border: 0;" />
              </a>
            </td>
          </tr>
          <!-- Main Card (Sharp Corners) -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 0px; padding: 36px 32px; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06); border: 1px solid #cbd5e1;" class="email-card">
              ${badgeHtml}
              <h1 style="margin: 0 0 14px 0; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3;" class="email-title">
                ${heading}
              </h1>
              ${subheadingHtml}
              ${contentHtml}
              ${detailsHtml}
              ${ctaHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 24px; font-size: 12px; color: #64748b; line-height: 1.6;" class="email-footer">
              <p style="margin: 0;">This notification was sent automatically by <strong>Loopwork HRIS</strong>.</p>
              <p style="margin: 4px 0 0 0;" class="email-muted">© ${new Date().getFullYear()} Loopwork. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

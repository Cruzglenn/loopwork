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
      <div style="display: inline-block; margin-bottom: 20px; padding: 6px 14px; background-color: ${bg}; border: 1px solid ${borderCol}; border-radius: 9999px; color: ${textCol}; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
        ${badge.text}
      </div>`;
  }

  let detailsHtml = '';
  if (details && details.length > 0) {
    const rows = details
      .map(
        (d, idx) => `
      <tr>
        <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #64748b; ${idx < details.length - 1 ? 'border-bottom: 1px solid #e2e8f0;' : ''} width: 45%;" class="detail-label">${d.label}</td>
        <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #0f172a; ${idx < details.length - 1 ? 'border-bottom: 1px solid #e2e8f0;' : ''} text-align: right;" class="detail-val">${d.value}</td>
      </tr>`,
      )
      .join('');

    detailsHtml = `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 24px; margin-bottom: 8px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; border-collapse: separate; border-spacing: 0; overflow: hidden;" class="detail-box">
        ${rows}
      </table>`;
  }

  const subheadingHtml = subheading
    ? `<p style="margin: 0 0 16px 0; font-size: 15px; color: #64748b; line-height: 1.5;" class="email-muted">${subheading}</p>`
    : '';

  const contentHtml = content
    ? `<div style="font-size: 15px; line-height: 1.6; color: #475569;" class="email-text">${content}</div>`
    : '';

  const ctaHtml = cta
    ? `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 28px;">
      <tr>
        <td align="center">
          <a href="${cta.href}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
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
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 0 auto;">
          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <span style="font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;" class="email-title">
                      Loop<span style="color: #2563eb;">work</span>
                    </span>
                    <span style="display: inline-block; margin-left: 8px; padding: 3px 8px; background-color: #e0e7ff; color: #3730a3; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; vertical-align: middle;">HRIS</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Main Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 16px; padding: 36px 32px; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04); border: 1px solid #e2e8f0;" class="email-card">
              ${badgeHtml}
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;" class="email-title">
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
            <td align="center" style="padding-top: 28px; font-size: 12px; color: #64748b; line-height: 1.6;" class="email-footer">
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

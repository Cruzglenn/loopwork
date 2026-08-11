export function templateHtml(
  heading: string,
  content: string,
  cta?: { label: string; href: string },
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loopwork</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 0 auto;">
          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <span style="font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Loop<span style="color: #2563eb;">work</span>
              </span>
            </td>
          </tr>
          <!-- Main Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 12px; padding: 36px 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a; line-height: 1.4;">
                ${heading}
              </h1>
              <div style="font-size: 15px; line-height: 1.6; color: #475569;">
                ${content}
              </div>
              ${
                cta
                  ? `
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 28px;">
                <tr>
                  <td align="center">
                    <a href="${cta.href}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
                      ${cta.label}
                    </a>
                  </td>
                </tr>
              </table>
              `
                  : ''
              }
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 24px; font-size: 13px; color: #94a3b8; line-height: 1.5;">
              <p style="margin: 0;">This email was sent automatically by Loopwork HRIS.</p>
              <p style="margin: 4px 0 0 0;">© ${new Date().getFullYear()} Loopwork. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

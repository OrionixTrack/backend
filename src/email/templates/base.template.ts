export interface BaseTemplateOptions {
  content: string;
  preheader?: string;
}

export const baseEmailTemplate = ({
  content,
  preheader,
}: BaseTemplateOptions): string => {
  return `
<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>OrionixTrack</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    body {
      margin: 0;
      padding: 0;
      width: 100%;
      word-break: break-word;
      -webkit-font-smoothing: antialiased;
      background-color: #f4f7fa;
    }

    * {
      box-sizing: border-box;
    }

    table {
      border-collapse: collapse;
      border-spacing: 0;
    }

    img {
      max-width: 100%;
      border: 0;
      line-height: 100%;
      vertical-align: middle;
    }

    a {
      color: #2563eb;
      text-decoration: none;
    }

    .wrapper {
      width: 100%;
      background-color: #f4f7fa;
      padding: 40px 0;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
    }

    .header {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      padding: 32px 40px;
      text-align: center;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .header-title {
      margin: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
    }

    .header-subtitle {
      margin: 8px 0 0 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.9);
      letter-spacing: 0.3px;
    }

    .content {
      padding: 40px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 16px;
      line-height: 1.7;
      color: #374151;
    }

    .footer {
      background-color: #f9fafb;
      padding: 32px 40px;
      border-top: 1px solid #e5e7eb;
    }

    .footer-content {
      text-align: center;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #6b7280;
    }

    .footer-logo {
      font-size: 18px;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 12px;
      display: block;
    }

    .footer-divider {
      width: 80px;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
      margin: 20px auto;
      border-radius: 2px;
    }

    .social-links {
      margin-top: 20px;
    }

    .social-links a {
      display: inline-block;
      margin: 0 8px;
      color: #6b7280;
      transition: color 0.2s;
    }

    .social-links a:hover {
      color: #2563eb;
    }

    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .button:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
    }

    .secondary-button {
      background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%);
      box-shadow: 0 4px 12px rgba(100, 116, 139, 0.25);
    }

    .info-box {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 6px;
    }

    .warning-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 6px;
    }

    .success-box {
      background-color: #d1fae5;
      border-left: 4px solid #10b981;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 6px;
    }

    h1, h2, h3 {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #1f2937;
      margin-top: 0;
      line-height: 1.3;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 20px;
    }

    h2 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    h3 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    p {
      margin: 0 0 16px 0;
    }

    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 24px 0;
    }

    .text-muted {
      color: #6b7280;
      font-size: 14px;
    }

    .text-small {
      font-size: 13px;
      line-height: 1.5;
    }

    .preheader {
      display: none;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
    }

    @media only screen and (max-width: 600px) {
      .wrapper {
        padding: 20px 0;
      }

      .container {
        margin: 0 16px;
      }

      .header {
        padding: 24px 24px;
      }

      .header-title {
        font-size: 24px;
      }

      .content {
        padding: 24px;
      }

      .footer {
        padding: 24px;
      }

      .button {
        display: block;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  ${preheader ? `<div class="preheader">${preheader}</div>` : ''}

  <div class="wrapper">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <div class="container">
            <div class="header">
              <h1 class="header-title">OrionixTrack</h1>
              <p class="header-subtitle">Integrated Fleet Operations Platform</p>
            </div>

            <div class="content">
              ${content}
            </div>

            <div class="footer">
              <div class="footer-content">
                <span class="footer-logo">OrionixTrack</span>
                <p class="text-small" style="margin: 8px 0;">
                  Transform your daily operations into a managed, efficient, and reliable process
                </p>

                <div class="footer-divider"></div>

                <p class="text-small text-muted" style="margin: 16px 0;">
                  This email was sent to you as part of your OrionixTrack account.<br>
                  If you have any questions, please contact our support team.
                </p>

                <p class="text-small text-muted" style="margin-top: 20px;">
                  &copy; ${new Date().getFullYear()} OrionixTrack. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();
};

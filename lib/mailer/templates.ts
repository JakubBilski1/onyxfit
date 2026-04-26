import "server-only";
import type { MailMessage } from "./index";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://onyxfit.app";
const SUPPORT = process.env.MAIL_SUPPORT_ADDRESS ?? "verification@onyx.coach";

function wrap(title: string, body: string): string {
  return `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#0c0c0c;color:#e9e3d6;margin:0;padding:32px;">
  <table align="center" width="560" style="background:#111;border:1px solid #222;border-radius:4px;padding:32px;">
    <tr><td>
      <h1 style="font-family:Georgia,serif;font-size:28px;line-height:1.2;margin:0 0 24px;color:#fff;">${title}</h1>
      <div style="font-size:14px;line-height:1.6;color:#c9c2b3;">${body}</div>
      <hr style="border:none;border-top:1px solid #222;margin:32px 0;" />
      <p style="font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#666;margin:0;">
        Onyx Coach · Forged in iron.<br/>
        Reply to this email or write to ${SUPPORT}.
      </p>
    </td></tr>
  </table>
</body></html>`;
}

export function kycApprovedEmail(args: {
  to: string;
  fullName: string | null;
}): MailMessage {
  const greet = args.fullName ? `Hi ${args.fullName.split(" ")[0]},` : "Hi,";
  return {
    to: args.to,
    subject: "You're verified — welcome to Onyx Coach",
    text: [
      greet,
      "",
      "Your application has been approved. The console is unlocked — sign in and your roster, forge, and storefront are ready.",
      "",
      `Sign in: ${APP_URL}/login`,
      "",
      "Forged in iron,",
      "The Onyx team",
    ].join("\n"),
    html: wrap(
      "You're in.",
      `
      <p>${greet}</p>
      <p>Your application has been <strong>approved</strong>. The console is unlocked — sign in and your roster, forge, and storefront are ready.</p>
      <p style="margin:32px 0;">
        <a href="${APP_URL}/login" style="display:inline-block;background:#ffb133;color:#0c0c0c;text-decoration:none;padding:12px 24px;font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">
          Sign in →
        </a>
      </p>
      <p>Forged in iron,<br/>The Onyx team</p>
      `,
    ),
  };
}

export function kycRejectedEmail(args: {
  to: string;
  fullName: string | null;
  reason: string;
}): MailMessage {
  const greet = args.fullName ? `Hi ${args.fullName.split(" ")[0]},` : "Hi,";
  return {
    to: args.to,
    subject: "Onyx Coach — application not approved",
    text: [
      greet,
      "",
      "We've reviewed your application and weren't able to approve it at this time.",
      "",
      `Reason: ${args.reason}`,
      "",
      `You can correct your file and re-submit at ${APP_URL}/pending-verification.`,
      `Questions? Reach out to ${SUPPORT}.`,
      "",
      "— The Onyx team",
    ].join("\n"),
    html: wrap(
      "Application not approved.",
      `
      <p>${greet}</p>
      <p>We've reviewed your application and weren't able to approve it at this time.</p>
      <p style="border-left:2px solid #ffb133;padding:8px 16px;margin:24px 0;color:#fff;">
        <strong>Reason:</strong> ${escapeHtml(args.reason)}
      </p>
      <p>You can correct your file and re-submit at
        <a href="${APP_URL}/pending-verification" style="color:#ffb133;">${APP_URL}/pending-verification</a>.
      </p>
      <p>Questions? Write to <a href="mailto:${SUPPORT}" style="color:#ffb133;">${SUPPORT}</a>.</p>
      <p>— The Onyx team</p>
      `,
    ),
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

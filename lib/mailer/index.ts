// Mailer abstraction. The current driver is selected via MAIL_DRIVER env var:
//
//   MAIL_DRIVER=gmail      → Gmail SMTP via nodemailer
//                            (GMAIL_USER + GMAIL_APP_PASSWORD)
//   MAIL_DRIVER=smtp       → generic SMTP via nodemailer
//                            (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE)
//   MAIL_DRIVER=resend     → Resend HTTP API           (RESEND_API_KEY)
//   MAIL_DRIVER=postmark   → Postmark HTTP API         (POSTMARK_SERVER_TOKEN)
//   MAIL_DRIVER=log        → console.log only (default; safe for dev)
//   MAIL_DRIVER=noop       → silently drop
//
// MAIL_FROM              — RFC 5322 "Display <addr>"
// MAIL_REPLY_TO          — optional reply-to
// MAIL_TEST_OVERRIDE_TO  — when set, every outgoing message goes here instead
//                          of its real `to`. The original recipient is shown in
//                          the subject prefix, e.g. "[→ coach@x.com] Welcome".

import "server-only";

export type MailMessage = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
};

export type MailResult = { ok: true; id?: string } | { ok: false; error: string };

export interface Mailer {
  send(msg: MailMessage): Promise<MailResult>;
}

const FROM = process.env.MAIL_FROM ?? "Onyx Coach <onboarding@resend.dev>";
const REPLY_TO = process.env.MAIL_REPLY_TO || undefined;
const OVERRIDE_TO = process.env.MAIL_TEST_OVERRIDE_TO || undefined;

function applyOverride(msg: MailMessage): MailMessage {
  if (!OVERRIDE_TO) return msg;
  const originals = (Array.isArray(msg.to) ? msg.to : [msg.to]).join(", ");
  return {
    ...msg,
    to: OVERRIDE_TO,
    subject: `[→ ${originals}] ${msg.subject}`,
  };
}

class LogMailer implements Mailer {
  async send(msg: MailMessage): Promise<MailResult> {
    console.log("[mailer:log]", { from: FROM, ...applyOverride(msg) });
    return { ok: true, id: "log" };
  }
}

class NoopMailer implements Mailer {
  async send(): Promise<MailResult> {
    return { ok: true, id: "noop" };
  }
}

class ResendMailer implements Mailer {
  constructor(private apiKey: string) {}
  async send(input: MailMessage): Promise<MailResult> {
    const msg = applyOverride(input);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: Array.isArray(msg.to) ? msg.to : [msg.to],
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
        reply_to: REPLY_TO,
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { ok: false, error: `resend ${res.status}: ${t.slice(0, 200)}` };
    }
    const j = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: j.id };
  }
}

class PostmarkMailer implements Mailer {
  constructor(private token: string) {}
  async send(input: MailMessage): Promise<MailResult> {
    const msg = applyOverride(input);
    const res = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": this.token,
      },
      body: JSON.stringify({
        From: FROM,
        To: Array.isArray(msg.to) ? msg.to.join(",") : msg.to,
        Subject: msg.subject,
        TextBody: msg.text,
        HtmlBody: msg.html,
        ReplyTo: REPLY_TO,
        MessageStream: "outbound",
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { ok: false, error: `postmark ${res.status}: ${t.slice(0, 200)}` };
    }
    const j = (await res.json().catch(() => ({}))) as { MessageID?: string };
    return { ok: true, id: j.MessageID };
  }
}

class NodemailerMailer implements Mailer {
  // Lazy import + lazy transport so this file doesn't drag nodemailer into
  // bundles that don't need it (e.g. Edge runtime middleware).
  private transporterPromise: Promise<{
    sendMail: (opts: {
      from: string;
      to: string;
      subject: string;
      text: string;
      html?: string;
      replyTo?: string;
    }) => Promise<{ messageId?: string }>;
  }> | null = null;

  constructor(
    private kind: "gmail" | "smtp",
    private opts: {
      user: string;
      pass: string;
      host?: string;
      port?: number;
      secure?: boolean;
    },
  ) {}

  private async transporter() {
    if (this.transporterPromise) return this.transporterPromise;
    this.transporterPromise = (async () => {
      const { default: nodemailer } = await import("nodemailer");
      if (this.kind === "gmail") {
        return nodemailer.createTransport({
          service: "gmail",
          auth: { user: this.opts.user, pass: this.opts.pass },
        });
      }
      return nodemailer.createTransport({
        host: this.opts.host,
        port: this.opts.port,
        secure: this.opts.secure ?? false,
        auth: { user: this.opts.user, pass: this.opts.pass },
      });
    })();
    return this.transporterPromise;
  }

  async send(input: MailMessage): Promise<MailResult> {
    const msg = applyOverride(input);
    try {
      const t = await this.transporter();
      const info = await t.sendMail({
        from: FROM,
        to: Array.isArray(msg.to) ? msg.to.join(", ") : msg.to,
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
        replyTo: REPLY_TO,
      });
      return { ok: true, id: info.messageId };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? String(e) };
    }
  }
}

let _mailer: Mailer | null = null;
export function mailer(): Mailer {
  if (_mailer) return _mailer;
  const driver = (process.env.MAIL_DRIVER ?? "log").toLowerCase();
  switch (driver) {
    case "gmail": {
      const user = process.env.GMAIL_USER;
      const pass = process.env.GMAIL_APP_PASSWORD;
      if (!user || !pass) {
        console.warn("[mailer] MAIL_DRIVER=gmail but GMAIL_USER/GMAIL_APP_PASSWORD missing — falling back to log");
        _mailer = new LogMailer();
      } else {
        _mailer = new NodemailerMailer("gmail", { user, pass });
      }
      break;
    }
    case "smtp": {
      const host = process.env.SMTP_HOST;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;
      if (!host || !user || !pass) {
        console.warn("[mailer] MAIL_DRIVER=smtp but SMTP_HOST/USER/PASS missing — falling back to log");
        _mailer = new LogMailer();
      } else {
        _mailer = new NodemailerMailer("smtp", {
          host,
          user,
          pass,
          port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
          secure: process.env.SMTP_SECURE === "true",
        });
      }
      break;
    }
    case "resend": {
      const key = process.env.RESEND_API_KEY;
      if (!key) {
        console.warn("[mailer] MAIL_DRIVER=resend but RESEND_API_KEY missing — falling back to log");
        _mailer = new LogMailer();
      } else {
        _mailer = new ResendMailer(key);
      }
      break;
    }
    case "postmark": {
      const token = process.env.POSTMARK_SERVER_TOKEN;
      if (!token) {
        console.warn("[mailer] MAIL_DRIVER=postmark but POSTMARK_SERVER_TOKEN missing — falling back to log");
        _mailer = new LogMailer();
      } else {
        _mailer = new PostmarkMailer(token);
      }
      break;
    }
    case "noop":
      _mailer = new NoopMailer();
      break;
    case "log":
    default:
      _mailer = new LogMailer();
  }
  return _mailer;
}

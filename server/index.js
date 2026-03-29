import express from "express";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json({ limit: "200kb" }));

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

app.post("/api/send-email", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body ?? {};
    if (!subject || !message) return res.status(400).send("subject and message are required");

    const SMTP_HOST = requiredEnv("SMTP_HOST");
    const SMTP_PORT = Number(requiredEnv("SMTP_PORT"));
    const SMTP_USER = requiredEnv("SMTP_USER");
    const SMTP_PASS = requiredEnv("SMTP_PASS");
    const MAIL_TO = requiredEnv("MAIL_TO");

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const safeName = String(name || "").trim();
    const safeEmail = String(email || "").trim();
    const safeSubject = String(subject || "").trim();
    const safeMessage = String(message || "").trim();

    const text = [
      safeName ? `Nome: ${safeName}` : null,
      safeEmail ? `E-mail: ${safeEmail}` : null,
      "",
      safeMessage,
    ]
      .filter(Boolean)
      .join("\n");

    await transporter.sendMail({
      from: SMTP_USER,
      to: MAIL_TO,
      replyTo: safeEmail || undefined,
      subject: safeSubject,
      text,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).send("failed to send");
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


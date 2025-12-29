const nodemailer = require("nodemailer");

// 1. Configurações de Conexão com Defaults Inteligentes
const secure =
  process.env.EMAIL_SECURE === "false"
    ? false
    : process.env.EMAIL_SECURE === "true"
    ? true
    : false; // Para porta 587 (Gmail padrão), o ideal é false.

const port = process.env.EMAIL_PORT
  ? Number(process.env.EMAIL_PORT)
  : secure
  ? 465
  : 587;

// 2. Verificação de segurança: Impede o app de rodar se as chaves não existirem
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error(
    "[MAILER ERROR] Verifique EMAIL_USER e EMAIL_PASS no arquivo .env"
  );
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port,
  secure,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Evita erros de certificado em alguns provedores
  },
});

async function enviarEmailReset(destinatario, nome, novaSenha) {
  const fromName = process.env.EMAIL_FROM_NAME || "Sonhário 🌌";
  const fromEmail = process.env.EMAIL_USER;

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: 'Arial', sans-serif; background-color: #0f1020; color: #ffffff; padding: 20px; }
        .container { max-width: 500px; margin: auto; background: linear-gradient(135deg, #1b1d3a, #2a2d5a); border-radius: 12px; padding: 30px; border: 1px solid #444; }
        h1 { color: #b38cff; text-align: center; }
        .senha { font-size: 24px; font-weight: bold; background: #ffffff; color: #000; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; letter-spacing: 2px; }
        p { line-height: 1.6; }
        .footer { margin-top: 30px; font-size: 12px; color: #aaa; text-align: center; border-top: 1px solid #444; padding-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🌙 Sonhário</h1>
        <p>Olá, <strong>${nome}</strong>,</p>
        <p>Recebemos uma solicitação para redefinir sua senha. Uma nova senha temporária foi gerada para você:</p>
        <div class="senha">${novaSenha}</div>
        <p>Recomendamos que você faça login e altere essa senha nas configurações do seu perfil o quanto antes.</p>
        <div class="footer">
          <p>Sonhário — registrando sonhos, explorando o inconsciente.</p>
          <p>&copy; 2025</p>
        </div>
      </div>
    </body>
  </html>
  `;

  return transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: destinatario,
    subject: "🔐 Redefinição de senha — Sonhário",
    html,
  });
}

module.exports = { enviarEmailReset };

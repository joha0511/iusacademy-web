// src/email.ts
import nodemailer from "nodemailer";

const APP_NAME = "iusAcademy";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendAccessEmail(
  to: string,
  nombreCompleto: string,
  passwordTemporal: string,
  appUrl: string,
  appMobileUrl: string | undefined,
  ttlDays: number
) {
  const loginUrl = `${appUrl}/login`;

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 16px; color: #0f172a;">
      <h1 style="font-size: 20px; margin-bottom: 8px;">Hola, ${nombreCompleto} 👋</h1>
      <p style="margin: 0 0 12px;">Has sido registrado en <strong>${APP_NAME}</strong>.</p>

      <p style="margin: 0 0 8px;">Estos son tus datos de acceso inicial:</p>
      <ul style="margin: 0 0 12px; padding-left: 20px;">
        <li><strong>Usuario / Correo:</strong> ${to}</li>
        <li><strong>Contraseña temporal:</strong> ${passwordTemporal}</li>
      </ul>

      <p style="margin: 0 0 12px;">
        Por seguridad, esta contraseña temporal es válida por <strong>${ttlDays} días</strong>.
        Luego deberás cambiarla dentro de la plataforma.
      </p>

      <div style="margin: 16px 0; text-align: center;">
        <a href="${loginUrl}"
           style="
             background: #f97316;
             color: white;
             padding: 10px 18px;
             border-radius: 999px;
             text-decoration: none;
             font-weight: 600;
             display: inline-block;
           ">
          Ir a la plataforma web
        </a>
      </div>

      ${
        appMobileUrl
          ? `<p style="margin: 0 0 12px; font-size: 14px;">
               También puedes usar la app móvil: <a href="${appMobileUrl}">${appMobileUrl}</a>
             </p>`
          : ""
      }

      <p style="margin-top: 16px; font-size: 12px; color: #6b7280;">
        Si tú no solicitaste este acceso, ignora este correo.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${APP_NAME} 👩‍⚖️" <${process.env.SMTP_USER}>`,
    to,
    subject: `Tus accesos a ${APP_NAME}`,
    html,
  });
}

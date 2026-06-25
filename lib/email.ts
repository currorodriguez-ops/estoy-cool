import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function enviarCodigoPsicologo(email: string, nombre: string, codigo: string) {
  await transporter.sendMail({
    from: `"Estoy Cool" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Tu código de psicólogo — Estoy Cool',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <img src="https://estoy-cool.vercel.app/Mesa-de-trabajo-2-copia-10@4x.png" alt="Estoy Cool" style="height: 48px; margin-bottom: 24px;" />
        <h2 style="color: #18181f; margin-bottom: 8px;">Hola ${nombre},</h2>
        <p style="color: #555; line-height: 1.6;">Tu cuenta de profesional en Estoy Cool ha sido creada. Este es tu código único para que tus pacientes puedan vincularse contigo al registrarse:</p>
        <div style="background: #F0F0F6; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
          <p style="color: #888; font-size: 12px; margin-bottom: 8px;">Tu código único</p>
          <p style="color: #18181f; font-size: 36px; font-weight: 900; letter-spacing: 8px; margin: 0;">${codigo}</p>
        </div>
        <p style="color: #555; line-height: 1.6;">Guárdalo bien y compártelo con tus pacientes cuando se registren en la app.</p>
        <a href="https://estoy-cool.vercel.app/login" style="display: inline-block; margin-top: 16px; background: #FFD400; color: #18181f; font-weight: 700; padding: 12px 24px; border-radius: 999px; text-decoration: none;">Ir a mi panel</a>
        <p style="color: #aaa; font-size: 12px; margin-top: 32px;">Estoy Cool — Acompañamiento emocional</p>
      </div>
    `,
  })
}

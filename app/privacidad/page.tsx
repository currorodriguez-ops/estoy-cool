import Link from 'next/link'

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen px-4 py-12" style={{ backgroundColor: '#E7ECFB' }}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex justify-center mb-6">
            <img src="/Mesa-de-trabajo-2-copia-10@4x.png" alt="Estoy Cool" className="h-12 w-auto" />
          </div>

          <h1 className="text-xl font-bold mb-1" style={{ color: '#18181f' }}>Política de Privacidad</h1>
          <p className="text-sm mb-8" style={{ color: '#aaa' }}>Última actualización: junio de 2026</p>

          <div className="space-y-6 text-sm leading-relaxed" style={{ color: '#444' }}>

            <section>
              <h2 className="font-bold text-base mb-2" style={{ color: '#18181f' }}>1. Responsable del tratamiento</h2>
              <p>El responsable del tratamiento de los datos personales recogidos a través de esta aplicación es <strong>Estoy Cool</strong>, con email de contacto <strong>hola@estoycool.com</strong>.</p>
            </section>

            <section>
              <h2 className="font-bold text-base mb-2" style={{ color: '#18181f' }}>2. Datos que recogemos</h2>
              <p>Recogemos los siguientes datos personales:</p>
              <ul className="mt-2 space-y-1 pl-4">
                <li>• <strong>Datos de registro:</strong> nombre y dirección de email.</li>
                <li>• <strong>Datos de conversación:</strong> los mensajes que escribes en el chat de acompañamiento emocional.</li>
                <li>• <strong>Datos de uso:</strong> fecha y hora de las sesiones de chat.</li>
              </ul>
              <p className="mt-2">Los datos de conversación son de carácter especialmente sensible, ya que pueden contener información sobre tu salud mental y estado emocional. Los tratamos con la máxima confidencialidad.</p>
            </section>

            <section>
              <h2 className="font-bold text-base mb-2" style={{ color: '#18181f' }}>3. Finalidad del tratamiento</h2>
              <p>Usamos tus datos para:</p>
              <ul className="mt-2 space-y-1 pl-4">
                <li>• Prestarte el servicio de acompañamiento emocional a través del chat.</li>
                <li>• Permitir que tu psicólogo asignado acceda a tus conversaciones con fines terapéuticos, con tu consentimiento expreso al registrarte.</li>
                <li>• Generar análisis clínicos asistidos por inteligencia artificial para apoyar el trabajo de tu psicólogo.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-base mb-2" style={{ color: '#18181f' }}>4. Base legal</h2>
              <p>El tratamiento de tus datos se basa en el <strong>consentimiento expreso</strong> que otorgas al registrarte en la aplicación, de acuerdo con el artículo 6.1.a y el artículo 9.2.a del Reglamento General de Protección de Datos (RGPD).</p>
            </section>

            <section>
              <h2 className="font-bold text-base mb-2" style={{ color: '#18181f' }}>5. Acceso a tus datos</h2>
              <p>Solo tienen acceso a tus datos:</p>
              <ul className="mt-2 space-y-1 pl-4">
                <li>• <strong>Tú mismo.</strong></li>
                <li>• <strong>Tu psicólogo asignado,</strong> únicamente para el seguimiento terapéutico.</li>
                <li>• <strong>Los servicios técnicos</strong> que usamos para operar la app (Supabase para la base de datos, Vercel para el alojamiento, DeepSeek para el procesamiento de lenguaje natural). Todos ellos operan bajo condiciones de confidencialidad y cumplen con el RGPD.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-base mb-2" style={{ color: '#18181f' }}>6. Conservación de los datos</h2>
              <p>Conservamos tus datos mientras mantengas una cuenta activa en la aplicación. Si eliminas tu cuenta, tus datos serán borrados de forma permanente en un plazo máximo de 30 días.</p>
            </section>

            <section>
              <h2 className="font-bold text-base mb-2" style={{ color: '#18181f' }}>7. Tus derechos</h2>
              <p>De acuerdo con el RGPD, tienes derecho a:</p>
              <ul className="mt-2 space-y-1 pl-4">
                <li>• <strong>Acceso:</strong> saber qué datos tenemos sobre ti.</li>
                <li>• <strong>Rectificación:</strong> corregir datos incorrectos.</li>
                <li>• <strong>Supresión:</strong> solicitar que eliminemos tus datos.</li>
                <li>• <strong>Portabilidad:</strong> recibir tus datos en un formato estructurado.</li>
                <li>• <strong>Retirada del consentimiento:</strong> en cualquier momento, sin que afecte al tratamiento anterior.</li>
              </ul>
              <p className="mt-2">Para ejercer cualquiera de estos derechos, escríbenos a <strong>hola@estoycool.com</strong>.</p>
            </section>

            <section>
              <h2 className="font-bold text-base mb-2" style={{ color: '#18181f' }}>8. Seguridad</h2>
              <p>Aplicamos medidas técnicas y organizativas para proteger tus datos, incluyendo cifrado en tránsito (HTTPS) y en reposo, y control de acceso estricto mediante autenticación.</p>
            </section>

            <section>
              <h2 className="font-bold text-base mb-2" style={{ color: '#18181f' }}>9. Contacto y reclamaciones</h2>
              <p>Si tienes cualquier duda sobre esta política, puedes contactarnos en <strong>hola@estoycool.com</strong>. También tienes derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong> en <a href="https://www.aepd.es" style={{ color: '#18181f', fontWeight: '600' }}>www.aepd.es</a>.</p>
            </section>

          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link href="/login" className="text-sm font-semibold underline" style={{ color: '#888' }}>
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function RecuperarPage() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function handleRecuperar(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nueva-contrasena`,
    })

    if (error) {
      setError('No se pudo enviar el email. Comprueba la dirección.')
      setCargando(false)
      return
    }

    setEnviado(true)
    setCargando(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#E7ECFB' }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col items-center mb-6">
            <img src="/Mesa-de-trabajo-2-copia-10@4x.png" alt="Estoy Cool" className="h-16 w-auto mb-2" />
          </div>

          {enviado ? (
            <div className="text-center">
              <p className="font-bold text-base mb-2" style={{ color: '#18181f' }}>Email enviado</p>
              <p className="text-sm mb-6" style={{ color: '#888' }}>
                Revisa tu bandeja de entrada y sigue el enlace para crear una nueva contraseña.
              </p>
              <Link href="/login" className="w-full block py-3 rounded-full text-sm font-bold text-center"
                style={{ backgroundColor: '#FFD400', color: '#18181f' }}>
                Volver al inicio
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-center mb-6" style={{ color: '#888' }}>
                Introduce tu email y te enviamos un enlace para recuperar tu contraseña.
              </p>
              <form onSubmit={handleRecuperar} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold" style={{ color: '#18181f' }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="tu@email.com"
                    className="mt-1 w-full rounded-2xl px-4 py-3 text-sm outline-none"
                    style={{ border: '1.5px solid #D0D0E0', color: '#18181f', backgroundColor: 'white' }}
                  />
                </div>

                {error && (
                  <p className="text-sm px-3 py-2 rounded-xl" style={{ backgroundColor: '#FFF0F0', color: '#CC0000' }}>{error}</p>
                )}

                <button type="submit" disabled={cargando}
                  className="w-full py-3 rounded-full text-sm font-bold disabled:opacity-50"
                  style={{ backgroundColor: '#FFD400', color: '#18181f' }}>
                  {cargando ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </form>

              <p className="text-center text-sm mt-4">
                <Link href="/login" className="underline" style={{ color: '#aaa' }}>Volver al login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

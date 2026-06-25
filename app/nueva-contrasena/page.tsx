'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NuevaContrasenaPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function handleCambiar(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden')
      return
    }

    setCargando(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('No se pudo cambiar la contraseña. Inténtalo de nuevo.')
      setCargando(false)
      return
    }

    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#E7ECFB' }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col items-center mb-6">
            <img src="/Mesa-de-trabajo-2-copia-10@4x.png" alt="Estoy Cool" className="h-16 w-auto mb-2" />
          </div>

          <p className="text-sm text-center mb-6" style={{ color: '#888' }}>Elige tu nueva contraseña</p>

          <form onSubmit={handleCambiar} className="space-y-4">
            <div>
              <label className="text-sm font-semibold" style={{ color: '#18181f' }}>Nueva contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
                className="mt-1 w-full rounded-2xl px-4 py-3 text-sm outline-none"
                style={{ border: '1.5px solid #D0D0E0', color: '#18181f', backgroundColor: 'white' }}
              />
            </div>
            <div>
              <label className="text-sm font-semibold" style={{ color: '#18181f' }}>Confirmar contraseña</label>
              <input
                type="password"
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                required
                placeholder="Repite la contraseña"
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
              {cargando ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

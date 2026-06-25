'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Rol = 'paciente' | 'profesional'

function Logo() {
  return (
    <svg viewBox="0 0 80 40" className="h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="32" fontFamily="Georgia, serif" fontSize="28" fontWeight="700" fill="#18181f" letterSpacing="-1">estoy</text>
      <text x="0" y="58" fontFamily="Georgia, serif" fontSize="28" fontWeight="700" fill="#18181f" letterSpacing="-1">cool</text>
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [rol, setRol] = useState<Rol>('paciente')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
      setCargando(false)
      return
    }

    // Verificar si el email es psicólogo
    const { data: psicologos } = await supabase
      .from('psicologos')
      .select('id')
      .eq('email', data.user.email)
      .limit(1)

    const esPsicologo = psicologos && psicologos.length > 0

    if (rol === 'profesional' && !esPsicologo) {
      setError('Este email no está registrado como profesional')
      await supabase.auth.signOut()
      setCargando(false)
      return
    }

    if (rol === 'paciente' && esPsicologo) {
      setError('Este email pertenece a un profesional. Selecciona "Soy profesional".')
      await supabase.auth.signOut()
      setCargando(false)
      return
    }

    router.push(esPsicologo ? '/psicologo' : '/chat')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#E7ECFB' }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <img src="/Mesa-de-trabajo-2-copia-10@4x.png" alt="Estoy Cool" className="h-20 w-auto mb-2" />
            <p className="text-sm mt-1" style={{ color: '#888' }}>Acompañamiento emocional</p>
          </div>

          {/* Selector de rol */}
          <div className="flex rounded-full p-1 mb-6" style={{ backgroundColor: '#F0F0F6' }}>
            <button
              type="button"
              onClick={() => setRol('paciente')}
              className="flex-1 py-2 text-sm font-bold rounded-full transition-all"
              style={rol === 'paciente' ? { backgroundColor: '#FFD400', color: '#18181f' } : { color: '#888' }}
            >
              Soy paciente
            </button>
            <button
              type="button"
              onClick={() => setRol('profesional')}
              className="flex-1 py-2 text-sm font-bold rounded-full transition-all"
              style={rol === 'profesional' ? { backgroundColor: '#FFD400', color: '#18181f' } : { color: '#888' }}
            >
              Soy profesional
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-semibold" style={{ color: '#18181f' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="mt-1 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                style={{ border: '1.5px solid #D0D0E0', color: '#18181f', backgroundColor: 'white' }}
              />
            </div>
            <div>
              <label className="text-sm font-semibold" style={{ color: '#18181f' }}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="mt-1 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                style={{ border: '1.5px solid #D0D0E0', color: '#18181f', backgroundColor: 'white' }}
              />
            </div>

            {error && (
              <p className="text-sm px-3 py-2 rounded-xl" style={{ backgroundColor: '#FFF0F0', color: '#CC0000' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 rounded-full text-sm font-bold transition-all disabled:opacity-50"
              style={{ backgroundColor: '#FFD400', color: '#18181f' }}
            >
              {cargando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm mt-4" style={{ color: '#888' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="font-bold underline" style={{ color: '#18181f' }}>
              Regístrate
            </Link>
          </p>
          <p className="text-center text-sm mt-2">
            <Link href="/recuperar" className="text-sm underline" style={{ color: '#aaa' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

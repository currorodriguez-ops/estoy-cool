'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Rol = 'paciente' | 'profesional'

export default function RegistroPage() {
  const router = useRouter()
  const [rol, setRol] = useState<Rol>('paciente')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [codigoPsicologo, setCodigoPsicologo] = useState('')
  const [codigoGenerado, setCodigoGenerado] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false)

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError('')

    if (!aceptaPrivacidad) {
      setError('Debes aceptar la política de privacidad para continuar')
      setCargando(false)
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setCargando(false)
      return
    }

    if (rol === 'paciente' && !codigoPsicologo.trim()) {
      setError('Introduce el código de tu psicólogo')
      setCargando(false)
      return
    }

    const { data, error: authError } = await supabase.auth.signUp({ email, password })

    if (authError || !data.user) {
      setError('Error al crear la cuenta. Puede que el email ya esté registrado.')
      setCargando(false)
      return
    }

    const res = await fetch('/api/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: data.user.id, nombre, email, rol, codigoPsicologo }),
    })

    const resultado = await res.json()

    if (!res.ok) {
      setError(resultado.error || 'Error al guardar los datos')
      await supabase.auth.signOut()
      setCargando(false)
      return
    }

    if (rol === 'profesional' && resultado.codigo) {
      setCodigoGenerado(resultado.codigo)
      setCargando(false)
      return
    }

    router.push('/chat')
  }

  const inputStyle = {
    border: '1.5px solid #D0D0E0',
    color: '#18181f',
    backgroundColor: 'white',
  }

  if (codigoGenerado) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#E7ECFB' }}>
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
            <div className="flex justify-center mb-6">
              <img src="/Mesa-de-trabajo-2-copia-10@4x.png" alt="Estoy Cool" className="h-16 w-auto" />
            </div>
            <p className="font-bold text-lg mb-2" style={{ color: '#18181f' }}>¡Cuenta creada!</p>
            <p className="text-sm mb-6" style={{ color: '#888' }}>Este es tu código único. Compártelo con tus pacientes para que puedan vincularse contigo.</p>
            <div className="rounded-2xl py-5 px-6 mb-6" style={{ backgroundColor: '#F0F0F6' }}>
              <p className="text-xs mb-1" style={{ color: '#888' }}>Tu código único</p>
              <p className="text-4xl font-black tracking-widest" style={{ color: '#18181f' }}>{codigoGenerado}</p>
            </div>
            <p className="text-xs mb-6" style={{ color: '#aaa' }}>Guárdalo bien, lo necesitarás para que tus pacientes se registren.</p>
            <button
              onClick={() => router.push('/psicologo')}
              className="w-full py-3 rounded-full text-sm font-bold"
              style={{ backgroundColor: '#FFD400', color: '#18181f' }}
            >
              Ir a mi panel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#E7ECFB' }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col items-center mb-2">
            <img src="/Mesa-de-trabajo-2-copia-10@4x.png" alt="Estoy Cool" className="h-16 w-auto mb-1" />
          </div>
          <p className="text-sm text-center mb-6" style={{ color: '#888' }}>Crea tu cuenta</p>

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

          <form onSubmit={handleRegistro} className="space-y-4">
            <div>
              <label className="text-sm font-semibold" style={{ color: '#18181f' }}>Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Tu nombre"
                className="mt-1 w-full rounded-2xl px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-sm font-semibold" style={{ color: '#18181f' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="mt-1 w-full rounded-2xl px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-sm font-semibold" style={{ color: '#18181f' }}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
                className="mt-1 w-full rounded-2xl px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </div>

            {rol === 'paciente' && (
              <div>
                <label className="text-sm font-semibold" style={{ color: '#18181f' }}>Código de tu psicólogo</label>
                <input
                  type="text"
                  value={codigoPsicologo}
                  onChange={(e) => setCodigoPsicologo(e.target.value.toUpperCase())}
                  placeholder="Ej: ABC123"
                  className="mt-1 w-full rounded-2xl px-4 py-3 text-sm outline-none tracking-widest"
                  style={inputStyle}
                />
                <p className="text-xs mt-1" style={{ color: '#aaa' }}>Tu psicólogo te lo habrá proporcionado</p>
              </div>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aceptaPrivacidad}
                onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                className="mt-0.5 flex-shrink-0"
                style={{ width: '16px', height: '16px', accentColor: '#FFD400' }}
              />
              <span className="text-xs" style={{ color: '#888' }}>
                He leído y acepto la{' '}
                <Link href="/privacidad" target="_blank" className="underline font-semibold" style={{ color: '#18181f' }}>
                  política de privacidad
                </Link>
                {' '}y consiento que mis conversaciones sean accesibles por mi psicólogo asignado con fines terapéuticos.
              </span>
            </label>

            {error && (
              <p className="text-sm px-3 py-2 rounded-xl" style={{ backgroundColor: '#FFF0F0', color: '#CC0000' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 rounded-full text-sm font-bold disabled:opacity-50"
              style={{ backgroundColor: '#FFD400', color: '#18181f' }}
            >
              {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm mt-4" style={{ color: '#888' }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-bold underline" style={{ color: '#18181f' }}>
              Inicia sesión
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

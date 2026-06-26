'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Mensaje = {
  rol: 'user' | 'assistant'
  texto: string
}

export default function ChatPage() {
  const router = useRouter()
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mensajesHoy, setMensajesHoy] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function cargarUsuario() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUsuarioId(user.id)
      const { data } = await supabase.from('usuarios').select('nombre').eq('id', user.id).single()
      if (data) {
        setNombreUsuario(data.nombre)
        const nombre = data.nombre.split(' ')[0]
        setMensajes([{
          rol: 'assistant',
          texto: `Hola ${nombre}, me alegra que estés aquí. Estoy para escucharte, sin prisas y sin juicios. ¿Cómo te sientes hoy?`,
        }])
      }

      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const { count } = await supabase
        .from('conversaciones')
        .select('id', { count: 'exact', head: true })
        .eq('usuario_id', user.id)
        .eq('rol', 'user')
        .gte('created_at', hoy.toISOString())
      setMensajesHoy(count ?? 0)
    }
    cargarUsuario()
  }, [router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function enviarMensaje() {
    if (!input.trim() || cargando || !usuarioId) return

    const nuevoMensaje: Mensaje = { rol: 'user', texto: input }
    const historialParaAPI = mensajes.map((m) => ({ role: m.rol, content: m.texto }))

    setMensajes((prev) => [...prev, nuevoMensaje])
    setInput('')
    setCargando(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: input, usuarioId, historial: historialParaAPI }),
      })
      const data = await res.json()
      if (res.status === 429) {
        setMensajes((prev) => [...prev, { rol: 'assistant', texto: data.error }])
      } else if (!res.ok) {
        setMensajes((prev) => [...prev, { rol: 'assistant', texto: `Error: ${data.error || 'desconocido'}` }])
      } else {
        setMensajes((prev) => [...prev, { rol: 'assistant', texto: data.respuesta || 'Lo siento, hubo un error.' }])
        setMensajesHoy((prev) => prev + 1)
      }
    } catch {
      setMensajes((prev) => [...prev, { rol: 'assistant', texto: 'Hubo un problema de conexión. Inténtalo de nuevo.' }])
    } finally {
      setCargando(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensaje() }
  }

  return (
    <div style={{ display: 'flex', height: '100dvh', backgroundColor: '#E7ECFB', padding: '16px', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxWidth: '672px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <img src="/Mesa-de-trabajo-2-copia-10@4x.png" alt="Estoy Cool" className="h-8 w-auto" />
          <span className="text-xs font-medium" style={{ color: mensajesHoy >= 45 ? '#FF3B30' : '#aaa' }}>
            {mensajesHoy}/50
          </span>
          <button
            onClick={cerrarSesion}
            className="text-sm font-medium"
            style={{ color: '#888' }}
          >
            Cerrar sesión
          </button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-4">
          {mensajes.length === 1 && (
            <div className="flex justify-center mb-6">
              <img src="/Mesa-de-trabajo-2-copia-10@4x.png" alt="Estoy Cool" className="h-16 w-auto" />
            </div>
          )}

          {mensajes.map((m, i) => (
            <div key={i} className={`flex ${m.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed"
                style={
                  m.rol === 'user'
                    ? { backgroundColor: '#18181f', color: 'white' }
                    : { backgroundColor: '#F5F5F5', color: '#18181f' }
                }
              >
                {m.texto}
              </div>
            </div>
          ))}

          {cargando && (
            <div className="flex justify-start">
              <div className="px-5 py-3 rounded-2xl" style={{ backgroundColor: '#F5F5F5' }}>
                <div className="flex gap-1 items-center h-4">
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#ccc', animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#ccc', animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#ccc', animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe cómo te sientes..."
            className="flex-1 rounded-full px-5 py-3 text-sm outline-none"
            style={{ border: '1.5px solid #D0D0E0', color: '#18181f', backgroundColor: 'white' }}
          />
          <button
            onClick={enviarMensaje}
            disabled={cargando || !input.trim()}
            className="w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-40 transition-all"
            style={{ backgroundColor: '#FFD400' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="#18181f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#18181f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

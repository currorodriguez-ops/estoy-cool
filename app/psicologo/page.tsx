'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Mensaje = {
  id: string
  mensaje: string
  rol: 'user' | 'assistant'
  created_at: string
}

type Usuario = {
  id: string
  nombre: string
  email: string
}

type Vista = 'conversacion' | 'analisis'

export default function PsicologoPage() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null)
  const [conversacion, setConversacion] = useState<Mensaje[]>([])
  const [cargando, setCargando] = useState(false)
  const [nombrePsicologo, setNombrePsicologo] = useState('')
  const [vista, setVista] = useState<Vista>('conversacion')
  const [analisis, setAnalisis] = useState('')
  const [cargandoAnalisis, setCargandoAnalisis] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    async function verificarAcceso() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: psicologo } = await supabase
        .from('psicologos')
        .select('id, nombre')
        .eq('email', user.email)
        .single()

      if (!psicologo) { router.push('/chat'); return }

      setNombrePsicologo(psicologo.nombre)
      cargarUsuarios(psicologo.id)
    }
    verificarAcceso()
  }, [router])

  async function cargarUsuarios(psicologoId: string) {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('psicologo_id', psicologoId)
      .order('created_at', { ascending: false })
    if (data) setUsuarios(data)
  }

  async function cargarConversacion(usuario: Usuario) {
    setCargando(true)
    setUsuarioSeleccionado(usuario)
    setAnalisis('')
    setVista('conversacion')
    const { data } = await supabase
      .from('conversaciones')
      .select('*')
      .eq('usuario_id', usuario.id)
      .order('created_at', { ascending: true })
    if (data) setConversacion(data)
    setCargando(false)
  }

  async function generarAnalisis() {
    if (!usuarioSeleccionado) return
    setVista('analisis')
    if (analisis) return
    setCargandoAnalisis(true)

    const res = await fetch('/api/analisis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId: usuarioSeleccionado.id }),
    })
    const data = await res.json()
    setAnalisis(data.analisis || 'No se pudo generar el análisis.')
    setCargandoAnalisis(false)
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function formatearFecha(fecha: string) {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    })
  }

  function renderAnalisis(texto: string) {
    return texto.split('\n').map((linea, i) => {
      const esTitulo = linea.trim().startsWith('**') && linea.trim().endsWith('**')
      if (esTitulo) return <p key={i} className="font-bold text-base mt-5 mb-1" style={{ color: '#18181f' }}>{linea.trim().replace(/\*\*/g, '')}</p>
      if (linea.startsWith('- ')) return <p key={i} className="text-sm pl-3 mb-1" style={{ color: '#444' }}>• {linea.slice(2)}</p>
      if (linea.trim() === '') return null
      return <p key={i} className="text-sm mb-1" style={{ color: '#444' }}>{linea}</p>
    })
  }

  const mostrarSidebar = !isMobile || !usuarioSeleccionado
  const mostrarChat = !isMobile || !!usuarioSeleccionado

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#E7ECFB' }}>
      {/* Sidebar */}
      <div style={{
        display: mostrarSidebar ? 'flex' : 'none',
        width: isMobile ? 'calc(100% - 32px)' : '288px',
        flexShrink: 0,
        margin: '16px',
        marginRight: isMobile ? '16px' : '0',
      }} className="flex-col bg-white rounded-3xl overflow-hidden">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <img src="/Mesa-de-trabajo-2-copia-10@4x.png" alt="Estoy Cool" className="h-8 w-auto" />
            <button onClick={cerrarSesion} className="text-xs font-medium" style={{ color: '#888' }}>
              Salir
            </button>
          </div>
          {nombrePsicologo && (
            <p className="text-xs font-semibold mt-2" style={{ color: '#18181f' }}>{nombrePsicologo}</p>
          )}
          <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>{usuarios.length} paciente{usuarios.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {usuarios.length === 0 ? (
            <p className="text-sm text-center mt-8 px-4" style={{ color: '#aaa' }}>No hay pacientes vinculados aún</p>
          ) : (
            usuarios.map((u) => (
              <button
                key={u.id}
                onClick={() => cargarConversacion(u)}
                className="w-full text-left px-5 py-3 transition-all"
                style={usuarioSeleccionado?.id === u.id ? { backgroundColor: '#FFD400' } : {}}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: usuarioSeleccionado?.id === u.id ? '#18181f' : '#F0F0F6', color: usuarioSeleccionado?.id === u.id ? 'white' : '#18181f' }}>
                    {u.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-sm truncate" style={{ color: '#18181f' }}>{u.nombre}</p>
                    <p className="text-xs truncate" style={{ color: '#888' }}>{u.email}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Área principal */}
      <div style={{ display: mostrarChat ? 'flex' : 'none' }} className="flex-1 flex-col m-4 bg-white rounded-3xl overflow-hidden">
        {!usuarioSeleccionado ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <img src="/Mesa-de-trabajo-2-copia-10@4x.png" alt="Estoy Cool" className="h-16 w-auto mx-auto mb-4 opacity-20" />
              <p className="font-semibold" style={{ color: '#aaa' }}>Selecciona un paciente</p>
              <p className="text-sm mt-1" style={{ color: '#ccc' }}>para ver su historial y análisis</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUsuarioSeleccionado(null)}
                  className="md:hidden mr-1 text-sm font-medium"
                  style={{ color: '#888' }}
                >
                  ← Volver
                </button>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                  style={{ backgroundColor: '#18181f' }}>
                  {usuarioSeleccionado.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-sm" style={{ color: '#18181f' }}>{usuarioSeleccionado.nombre}</h2>
                  <p className="text-xs" style={{ color: '#aaa' }}>{conversacion.length} mensajes registrados</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex rounded-full p-1" style={{ backgroundColor: '#F0F0F6' }}>
                <button
                  onClick={() => setVista('conversacion')}
                  className="px-4 py-2 text-xs font-bold rounded-full transition-all"
                  style={vista === 'conversacion' ? { backgroundColor: '#FFD400', color: '#18181f' } : { color: '#888' }}
                >
                  Conversación
                </button>
                <button
                  onClick={generarAnalisis}
                  className="px-4 py-2 text-xs font-bold rounded-full transition-all"
                  style={vista === 'analisis' ? { backgroundColor: '#FFD400', color: '#18181f' } : { color: '#888' }}
                >
                  Análisis IA
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {vista === 'conversacion' ? (
                <div className="space-y-3">
                  {cargando ? (
                    <p className="text-center text-sm" style={{ color: '#aaa' }}>Cargando...</p>
                  ) : conversacion.length === 0 ? (
                    <p className="text-center text-sm mt-8" style={{ color: '#aaa' }}>Este paciente aún no tiene conversaciones</p>
                  ) : (
                    conversacion.map((m) => (
                      <div key={m.id} className={`flex ${m.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[70%]">
                          <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                            style={m.rol === 'user'
                              ? { backgroundColor: '#18181f', color: 'white' }
                              : { backgroundColor: '#F5F5F5', color: '#18181f' }}>
                            {m.mensaje}
                          </div>
                          <p className={`text-xs mt-1 ${m.rol === 'user' ? 'text-right' : 'text-left'}`} style={{ color: '#ccc' }}>
                            {m.rol === 'user' ? 'Paciente' : 'IA'} · {formatearFecha(m.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="max-w-2xl mx-auto">
                  {cargandoAnalisis ? (
                    <div className="text-center mt-16">
                      <img src="/Mesa-de-trabajo-2-copia-10@4x.png" alt="Estoy Cool" className="h-12 w-auto mx-auto mb-4 opacity-20" />
                      <p className="text-sm" style={{ color: '#aaa' }}>Analizando conversaciones...</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl p-6" style={{ backgroundColor: '#F5F5F5' }}>
                      <p className="font-bold text-sm mb-4" style={{ color: '#18181f' }}>
                        Análisis clínico — {usuarioSeleccionado.nombre}
                      </p>
                      <div>{renderAnalisis(analisis)}</div>
                      <button
                        onClick={() => { setAnalisis(''); generarAnalisis() }}
                        className="mt-6 text-xs font-semibold underline"
                        style={{ color: '#888' }}
                      >
                        Regenerar análisis
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

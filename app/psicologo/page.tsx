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
type Pantalla = 'lista' | 'chat'

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
  const [pantalla, setPantalla] = useState<Pantalla>('lista')

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

  async function seleccionarUsuario(usuario: Usuario) {
    setCargando(true)
    setUsuarioSeleccionado(usuario)
    setAnalisis('')
    setVista('conversacion')
    setPantalla('chat')
    const { data } = await supabase
      .from('conversaciones')
      .select('*')
      .eq('usuario_id', usuario.id)
      .order('created_at', { ascending: true })
    if (data) setConversacion(data)
    setCargando(false)
  }

  function volverALista() {
    setPantalla('lista')
    setUsuarioSeleccionado(null)
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

  // ── MÓVIL: pantalla lista ──
  if (pantalla === 'lista') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#E7ECFB' }}>
        <div className="m-4 bg-white rounded-3xl overflow-hidden">
          <div className="px-5 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <img src="/Mesa-de-trabajo-2-copia-10@4x.png" alt="Estoy Cool" className="h-8 w-auto" />
              <button onClick={cerrarSesion} className="text-xs font-medium" style={{ color: '#888' }}>Salir</button>
            </div>
            {nombrePsicologo && <p className="text-xs font-semibold mt-2" style={{ color: '#18181f' }}>{nombrePsicologo}</p>}
            <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>{usuarios.length} paciente{usuarios.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="py-2">
            {usuarios.length === 0 ? (
              <p className="text-sm text-center mt-8 px-4 pb-8" style={{ color: '#aaa' }}>No hay pacientes vinculados aún</p>
            ) : (
              usuarios.map((u) => (
                <button
                  key={u.id}
                  onClick={() => seleccionarUsuario(u)}
                  className="w-full text-left px-5 py-4 border-b border-gray-50 active:bg-yellow-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: '#F0F0F6', color: '#18181f' }}>
                      {u.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-sm" style={{ color: '#18181f' }}>{u.nombre}</p>
                      <p className="text-xs truncate" style={{ color: '#888' }}>{u.email}</p>
                    </div>
                    <span style={{ color: '#ccc' }}>›</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── MÓVIL: pantalla chat ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', backgroundColor: '#E7ECFB' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: '16px', backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={volverALista} style={{ color: '#888', fontSize: '14px', fontWeight: '600' }}>← Volver</button>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#18181f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
              {usuarioSeleccionado?.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: '700', fontSize: '14px', color: '#18181f' }}>{usuarioSeleccionado?.nombre}</p>
              <p style={{ fontSize: '11px', color: '#aaa' }}>{conversacion.length} mensajes</p>
            </div>
          </div>
          <button onClick={cerrarSesion} style={{ fontSize: '12px', color: '#888' }}>Salir</button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', backgroundColor: '#F0F0F6', borderRadius: '999px', padding: '4px' }}>
            <button
              onClick={() => setVista('conversacion')}
              style={{
                flex: 1, padding: '8px', borderRadius: '999px', fontSize: '12px', fontWeight: '700',
                backgroundColor: vista === 'conversacion' ? '#FFD400' : 'transparent',
                color: vista === 'conversacion' ? '#18181f' : '#888',
              }}
            >Conversación</button>
            <button
              onClick={generarAnalisis}
              style={{
                flex: 1, padding: '8px', borderRadius: '999px', fontSize: '12px', fontWeight: '700',
                backgroundColor: vista === 'analisis' ? '#FFD400' : 'transparent',
                color: vista === 'analisis' ? '#18181f' : '#888',
              }}
            >Análisis IA</button>
          </div>
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {vista === 'conversacion' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cargando ? (
                <p style={{ textAlign: 'center', color: '#aaa', fontSize: '14px' }}>Cargando...</p>
              ) : conversacion.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#aaa', fontSize: '14px', marginTop: '32px' }}>Este paciente aún no tiene conversaciones</p>
              ) : (
                conversacion.map((m) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: m.rol === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '80%' }}>
                      <div style={{
                        padding: '12px 16px', borderRadius: '18px', fontSize: '14px', lineHeight: '1.5',
                        backgroundColor: m.rol === 'user' ? '#18181f' : '#F5F5F5',
                        color: m.rol === 'user' ? 'white' : '#18181f',
                      }}>{m.mensaje}</div>
                      <p style={{ fontSize: '11px', color: '#ccc', marginTop: '4px', textAlign: m.rol === 'user' ? 'right' : 'left' }}>
                        {m.rol === 'user' ? 'Paciente' : 'IA'} · {formatearFecha(m.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div>
              {cargandoAnalisis ? (
                <div style={{ textAlign: 'center', marginTop: '48px' }}>
                  <img src="/Mesa-de-trabajo-2-copia-10@4x.png" alt="Estoy Cool" style={{ height: '48px', margin: '0 auto 16px', opacity: 0.2 }} />
                  <p style={{ color: '#aaa', fontSize: '14px' }}>Analizando conversaciones...</p>
                </div>
              ) : (
                <div style={{ backgroundColor: '#F5F5F5', borderRadius: '16px', padding: '20px' }}>
                  <p style={{ fontWeight: '700', fontSize: '14px', color: '#18181f', marginBottom: '12px' }}>
                    Análisis clínico — {usuarioSeleccionado?.nombre}
                  </p>
                  <div>{renderAnalisis(analisis)}</div>
                  <button
                    onClick={() => { setAnalisis(''); generarAnalisis() }}
                    style={{ marginTop: '20px', fontSize: '12px', fontWeight: '600', color: '#888', textDecoration: 'underline' }}
                  >Regenerar análisis</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

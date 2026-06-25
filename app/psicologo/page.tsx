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
  ultima_visita_psicologo: string | null
  ultimo_mensaje?: string | null
}

type Sesion = {
  id: string
  created_at: string
}

type Vista = 'conversacion' | 'analisis'
type Pantalla = 'lista' | 'sesiones' | 'chat'

export default function PsicologoPage() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null)
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [sesionSeleccionada, setSesionSeleccionada] = useState<Sesion | null>(null)
  const [conversacion, setConversacion] = useState<Mensaje[]>([])
  const [cargando, setCargando] = useState(false)
  const [nombrePsicologo, setNombrePsicologo] = useState('')
  const [vista, setVista] = useState<Vista>('conversacion')
  const [analisis, setAnalisis] = useState('')
  const [cargandoAnalisis, setCargandoAnalisis] = useState(false)
  const [pantalla, setPantalla] = useState<Pantalla>('lista')
  const [notas, setNotas] = useState('')
  const [guardandoNotas, setGuardandoNotas] = useState(false)
  const [notasGuardadas, setNotasGuardadas] = useState(false)
  const [codigoPsicologo, setCodigoPsicologo] = useState('')
  const [mostrarCodigo, setMostrarCodigo] = useState(false)

  useEffect(() => {
    async function verificarAcceso() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: psicologo } = await supabase
        .from('psicologos')
        .select('id, nombre, codigo')
        .eq('email', user.email)
        .single()

      if (!psicologo) { router.push('/chat'); return }

      setNombrePsicologo(psicologo.nombre)
      setCodigoPsicologo(psicologo.codigo)
      cargarUsuarios(psicologo.id)
    }
    verificarAcceso()
  }, [router])

  async function cargarUsuarios(psicologoId: string) {
    const { data } = await supabase
      .from('usuarios')
      .select('id, nombre, email, ultima_visita_psicologo')
      .eq('psicologo_id', psicologoId)
      .order('created_at', { ascending: false })

    if (!data) return

    const usuariosConActividad = await Promise.all(data.map(async (u) => {
      const { data: ultimo } = await supabase
        .from('conversaciones')
        .select('created_at')
        .eq('usuario_id', u.id)
        .eq('rol', 'user')
        .order('created_at', { ascending: false })
        .limit(1)
      return { ...u, ultimo_mensaje: ultimo?.[0]?.created_at || null }
    }))

    setUsuarios(usuariosConActividad)
  }

  async function seleccionarUsuario(usuario: Usuario) {
    setUsuarioSeleccionado(usuario)
    setAnalisis('')
    setNotasGuardadas(false)
    setCargando(true)

    const ahora = new Date().toISOString()

    const [{ data: sesionesData }, { data: usuarioData }] = await Promise.all([
      supabase.from('sesiones').select('id, created_at').eq('usuario_id', usuario.id).order('created_at', { ascending: false }),
      supabase.from('usuarios').select('notas_psicologo').eq('id', usuario.id).single(),
    ])

    await supabase.from('usuarios').update({ ultima_visita_psicologo: ahora }).eq('id', usuario.id)

    setUsuarios(prev => prev.map(u => u.id === usuario.id ? { ...u, ultima_visita_psicologo: ahora } : u))

    if (sesionesData) setSesiones(sesionesData)
    if (usuarioData) setNotas(usuarioData.notas_psicologo || '')
    setCargando(false)
    setPantalla('sesiones')
  }

  async function guardarNotas() {
    if (!usuarioSeleccionado) return
    setGuardandoNotas(true)
    await supabase.from('usuarios').update({ notas_psicologo: notas }).eq('id', usuarioSeleccionado.id)
    setGuardandoNotas(false)
    setNotasGuardadas(true)
    setTimeout(() => setNotasGuardadas(false), 2000)
  }

  async function seleccionarSesion(sesion: Sesion) {
    setSesionSeleccionada(sesion)
    setVista('conversacion')
    setAnalisis('')
    setCargando(true)
    const { data } = await supabase
      .from('conversaciones')
      .select('*')
      .eq('sesion_id', sesion.id)
      .order('created_at', { ascending: true })
    if (data) setConversacion(data)
    setCargando(false)
    setPantalla('chat')
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

  function formatearDia(fecha: string) {
    const d = new Date(fecha)
    const hoy = new Date()
    const ayer = new Date()
    ayer.setDate(hoy.getDate() - 1)

    if (d.toDateString() === hoy.toDateString()) return 'Hoy'
    if (d.toDateString() === ayer.toDateString()) return 'Ayer'
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  function renderAnalisis(texto: string) {
    return texto.split('\n').map((linea, i) => {
      const esTitulo = linea.trim().startsWith('**') && linea.trim().endsWith('**')
      if (esTitulo) return <p key={i} style={{ fontWeight: '700', fontSize: '14px', marginTop: '20px', marginBottom: '4px', color: '#18181f' }}>{linea.trim().replace(/\*\*/g, '')}</p>
      if (linea.startsWith('- ')) return <p key={i} style={{ fontSize: '13px', paddingLeft: '12px', marginBottom: '4px', color: '#444' }}>• {linea.slice(2)}</p>
      if (linea.trim() === '') return null
      return <p key={i} style={{ fontSize: '13px', marginBottom: '4px', color: '#444' }}>{linea}</p>
    })
  }

  // ── PANTALLA: lista de pacientes ──
  if (pantalla === 'lista') {
    return (
      <div style={{ minHeight: '100dvh', backgroundColor: '#E7ECFB' }}>
        <div style={{ margin: '16px', backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <img src="/Mesa-de-trabajo-2-copia-10@4x.png" alt="Estoy Cool" style={{ height: '32px' }} />
              <button onClick={cerrarSesion} style={{ fontSize: '12px', color: '#888', fontWeight: '500' }}>Salir</button>
            </div>
            {nombrePsicologo && <p style={{ fontSize: '12px', fontWeight: '700', color: '#18181f', marginTop: '8px' }}>{nombrePsicologo}</p>}
            <p style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>{usuarios.length} paciente{usuarios.length !== 1 ? 's' : ''}</p>
            {codigoPsicologo && (
              <div style={{ marginTop: '10px' }}>
                <button onClick={() => setMostrarCodigo(!mostrarCodigo)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#aaa' }}>
                  <span>Código de acceso</span>
                  <span style={{ fontSize: '10px' }}>{mostrarCodigo ? '▲' : '▼'}</span>
                </button>
                {mostrarCodigo && (
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#FFFBE6', border: '1.5px solid #FFD400', borderRadius: '12px', padding: '8px 14px' }}>
                    <p style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '5px', color: '#18181f', margin: 0 }}>{codigoPsicologo}</p>
                    <button onClick={() => navigator.clipboard.writeText(codigoPsicologo)}
                      style={{ fontSize: '11px', color: '#888', marginLeft: 'auto', flexShrink: 0 }}>
                      Copiar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            {usuarios.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#aaa', fontSize: '14px', padding: '48px 16px' }}>No hay pacientes vinculados aún</p>
            ) : (
              usuarios.map((u) => {
                const tieneNoLeidos = u.ultimo_mensaje && (
                  !u.ultima_visita_psicologo || new Date(u.ultimo_mensaje) > new Date(u.ultima_visita_psicologo)
                )
                return (
                  <button key={u.id} onClick={() => seleccionarUsuario(u)}
                    style={{ width: '100%', textAlign: 'left', padding: '16px 20px', borderBottom: '1px solid #f8f8f8', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F0F0F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', color: '#18181f' }}>
                        {u.nombre.charAt(0).toUpperCase()}
                      </div>
                      {tieneNoLeidos && (
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF3B30', border: '2px solid white' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ fontWeight: tieneNoLeidos ? '700' : '600', fontSize: '14px', color: '#18181f' }}>{u.nombre}</p>
                      <p style={{ fontSize: '12px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.ultimo_mensaje ? `Último mensaje: ${formatearFecha(u.ultimo_mensaje)}` : u.email}
                      </p>
                    </div>
                    <span style={{ color: '#ccc', fontSize: '18px' }}>›</span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── PANTALLA: lista de sesiones del paciente ──
  if (pantalla === 'sesiones') {
    return (
      <div style={{ minHeight: '100dvh', backgroundColor: '#E7ECFB' }}>
        <div style={{ margin: '16px', backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setPantalla('lista')} style={{ fontSize: '14px', color: '#888', fontWeight: '600' }}>← Volver</button>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#18181f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
              {usuarioSeleccionado?.nombre.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '700', fontSize: '14px', color: '#18181f' }}>{usuarioSeleccionado?.nombre}</p>
              <p style={{ fontSize: '11px', color: '#aaa' }}>{sesiones.length} sesión{sesiones.length !== 1 ? 'es' : ''}</p>
            </div>
            <button onClick={() => { setPantalla('chat'); setSesionSeleccionada(null); generarAnalisis() }}
              style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#FFD400', color: '#18181f', padding: '6px 12px', borderRadius: '999px' }}>
              Análisis IA
            </button>
          </div>

          {/* Notas del psicólogo */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#18181f', marginBottom: '8px' }}>Mis notas</p>
            <textarea
              value={notas}
              onChange={(e) => { setNotas(e.target.value); setNotasGuardadas(false) }}
              placeholder="Escribe aquí tus apuntes sobre este paciente..."
              rows={4}
              style={{ width: '100%', fontSize: '13px', color: '#18181f', border: '1.5px solid #E0E0E0', borderRadius: '12px', padding: '10px 12px', resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button onClick={guardarNotas} disabled={guardandoNotas}
                style={{ fontSize: '12px', fontWeight: '700', backgroundColor: notasGuardadas ? '#E0F0E0' : '#FFD400', color: notasGuardadas ? '#2a7a2a' : '#18181f', padding: '6px 16px', borderRadius: '999px', opacity: guardandoNotas ? 0.6 : 1 }}>
                {notasGuardadas ? '✓ Guardado' : guardandoNotas ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>

          <div>
            {cargando ? (
              <p style={{ textAlign: 'center', color: '#aaa', fontSize: '14px', padding: '48px 16px' }}>Cargando...</p>
            ) : sesiones.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#aaa', fontSize: '14px', padding: '48px 16px' }}>Este paciente aún no tiene conversaciones</p>
            ) : (
              sesiones.map((s, i) => (
                <button key={s.id} onClick={() => seleccionarSesion(s)}
                  style={{ width: '100%', textAlign: 'left', padding: '16px 20px', borderBottom: '1px solid #f8f8f8', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F0F0F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 14a2 2 0 0 1-2 2H7l-4 4V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', fontSize: '14px', color: '#18181f' }}>{formatearDia(s.created_at)}</p>
                    <p style={{ fontSize: '12px', color: '#aaa' }}>Sesión {sesiones.length - i}</p>
                  </div>
                  <span style={{ color: '#ccc', fontSize: '18px' }}>›</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── PANTALLA: chat de una sesión o análisis ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', backgroundColor: '#E7ECFB' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: '16px', backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setPantalla('sesiones')} style={{ color: '#888', fontSize: '14px', fontWeight: '600', flexShrink: 0 }}>← Volver</button>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: '700', fontSize: '14px', color: '#18181f' }}>{usuarioSeleccionado?.nombre}</p>
            {sesionSeleccionada && <p style={{ fontSize: '11px', color: '#aaa' }}>{formatearDia(sesionSeleccionada.created_at)}</p>}
          </div>
          <button onClick={cerrarSesion} style={{ fontSize: '12px', color: '#888' }}>Salir</button>
        </div>

        {/* Tabs */}
        {sesionSeleccionada && (
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', backgroundColor: '#F0F0F6', borderRadius: '999px', padding: '4px' }}>
              <button onClick={() => setVista('conversacion')}
                style={{ flex: 1, padding: '8px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', backgroundColor: vista === 'conversacion' ? '#FFD400' : 'transparent', color: vista === 'conversacion' ? '#18181f' : '#888' }}>
                Conversación
              </button>
              <button onClick={generarAnalisis}
                style={{ flex: 1, padding: '8px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', backgroundColor: vista === 'analisis' ? '#FFD400' : 'transparent', color: vista === 'analisis' ? '#18181f' : '#888' }}>
                Análisis IA
              </button>
            </div>
          </div>
        )}

        {/* Contenido */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {vista === 'conversacion' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cargando ? (
                <p style={{ textAlign: 'center', color: '#aaa', fontSize: '14px' }}>Cargando...</p>
              ) : conversacion.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#aaa', fontSize: '14px', marginTop: '32px' }}>Sin mensajes en esta sesión</p>
              ) : (
                conversacion.map((m) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: m.rol === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '80%' }}>
                      <div style={{ padding: '12px 16px', borderRadius: '18px', fontSize: '14px', lineHeight: '1.5', backgroundColor: m.rol === 'user' ? '#18181f' : '#F5F5F5', color: m.rol === 'user' ? 'white' : '#18181f' }}>
                        {m.mensaje}
                      </div>
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
                  <button onClick={() => { setAnalisis(''); generarAnalisis() }}
                    style={{ marginTop: '20px', fontSize: '12px', fontWeight: '600', color: '#888', textDecoration: 'underline' }}>
                    Regenerar análisis
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

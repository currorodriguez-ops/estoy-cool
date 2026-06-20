import { NextRequest, NextResponse } from 'next/server'
import { deepseek, SYSTEM_PROMPT } from '@/lib/deepseek'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function obtenerOCrearSesionHoy(usuarioId: string): Promise<string> {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const { data: sesiones } = await supabaseAdmin
    .from('sesiones')
    .select('id')
    .eq('usuario_id', usuarioId)
    .gte('created_at', hoy.toISOString())
    .limit(1)

  if (sesiones && sesiones.length > 0) return sesiones[0].id

  const { data: nueva } = await supabaseAdmin
    .from('sesiones')
    .insert({ usuario_id: usuarioId })
    .select('id')
    .single()

  return nueva!.id
}

export async function POST(req: NextRequest) {
  try {
    const { mensaje, usuarioId, historial } = await req.json()

    if (!mensaje || !usuarioId) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const sesionId = await obtenerOCrearSesionHoy(usuarioId)

    await supabaseAdmin.from('conversaciones').insert({
      usuario_id: usuarioId,
      sesion_id: sesionId,
      mensaje,
      rol: 'user',
    })

    const mensajes = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(historial || []),
      { role: 'user', content: mensaje },
    ]

    const respuesta = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: mensajes,
      max_tokens: 300,
    })

    const textoRespuesta = respuesta.choices[0].message.content || ''

    await supabaseAdmin.from('conversaciones').insert({
      usuario_id: usuarioId,
      sesion_id: sesionId,
      mensaje: textoRespuesta,
      rol: 'assistant',
    })

    return NextResponse.json({ respuesta: textoRespuesta })
  } catch (error) {
    console.error('Error en chat:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { deepseek, SYSTEM_PROMPT } from '@/lib/deepseek'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const { mensaje, usuarioId, historial } = await req.json()

    if (!mensaje || !usuarioId) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    // Guardar mensaje del usuario en la base de datos
    const { error: errorUsuario } = await supabaseAdmin.from('conversaciones').insert({
      usuario_id: usuarioId,
      mensaje,
      rol: 'user',
    })
    if (errorUsuario) console.error('Error guardando mensaje usuario:', errorUsuario)

    // Construir historial para DeepSeek
    const mensajes = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(historial || []),
      { role: 'user', content: mensaje },
    ]

    // Llamar a DeepSeek
    const respuesta = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: mensajes,
      max_tokens: 300,
    })

    const textoRespuesta = respuesta.choices[0].message.content || ''

    // Guardar respuesta de la IA en la base de datos
    await supabaseAdmin.from('conversaciones').insert({
      usuario_id: usuarioId,
      mensaje: textoRespuesta,
      rol: 'assistant',
    })

    return NextResponse.json({ respuesta: textoRespuesta })
  } catch (error) {
    console.error('Error en chat:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

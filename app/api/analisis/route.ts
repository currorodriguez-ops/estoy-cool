import { NextRequest, NextResponse } from 'next/server'
import { deepseek } from '@/lib/deepseek'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const { usuarioId } = await req.json()

    const { data: conversaciones } = await supabaseAdmin
      .from('conversaciones')
      .select('mensaje, rol, created_at')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: true })

    if (!conversaciones || conversaciones.length === 0) {
      return NextResponse.json({ error: 'Sin conversaciones' }, { status: 400 })
    }

    const transcripcion = conversaciones
      .map((m) => `${m.rol === 'user' ? 'Paciente' : 'IA'}: ${m.mensaje}`)
      .join('\n')

    const respuesta = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `Eres un asistente clínico que ayuda a psicólogos a preparar sus sesiones.
Analiza la siguiente conversación entre un paciente y una IA de acompañamiento emocional.
Responde en español con este formato exacto:

**Resumen general**
(2-3 frases sobre el estado emocional general del paciente)

**Temas principales**
- (tema 1)
- (tema 2)
- (tema 3)

**Patrones emocionales detectados**
(describe patrones relevantes observados)

**Puntos a trabajar en sesión**
- (punto 1)
- (punto 2)

**Nivel de riesgo**
(Bajo / Medio / Alto) — (breve justificación)`,
        },
        {
          role: 'user',
          content: `Analiza esta conversación:\n\n${transcripcion}`,
        },
      ],
      max_tokens: 600,
    })

    const analisis = respuesta.choices[0].message.content || ''

    return NextResponse.json({ analisis })
  } catch (error) {
    console.error('Error en análisis:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

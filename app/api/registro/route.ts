import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

function generarCodigo(): string {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const numeros = '23456789'
  const parte1 = Array.from({ length: 3 }, () => letras[Math.floor(Math.random() * letras.length)]).join('')
  const parte2 = Array.from({ length: 3 }, () => numeros[Math.floor(Math.random() * numeros.length)]).join('')
  return `${parte1}${parte2}`
}

export async function POST(req: NextRequest) {
  try {
    const { userId, nombre, email, rol, codigoPsicologo } = await req.json()

    if (rol === 'profesional') {
      // Generar código único
      let codigo = generarCodigo()
      let intentos = 0

      // Asegurar que el código sea único
      while (intentos < 10) {
        const { data } = await supabaseAdmin
          .from('psicologos')
          .select('id')
          .eq('codigo', codigo)
          .limit(1)

        if (!data || data.length === 0) break
        codigo = generarCodigo()
        intentos++
      }

      const { error } = await supabaseAdmin.from('psicologos').insert({
        id: userId,
        nombre,
        email,
        codigo,
      })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json({ codigo })
    }

    if (rol === 'paciente') {
      // Buscar psicólogo por código
      const { data: psicologos } = await supabaseAdmin
        .from('psicologos')
        .select('id')
        .eq('codigo', codigoPsicologo.trim().toUpperCase())
        .limit(1)

      if (!psicologos || psicologos.length === 0) {
        return NextResponse.json({ error: 'Código de psicólogo no válido' }, { status: 400 })
      }

      const { error } = await supabaseAdmin.from('usuarios').insert({
        id: userId,
        nombre,
        email,
        psicologo_id: psicologos[0].id,
      })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Rol no válido' }, { status: 400 })
  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

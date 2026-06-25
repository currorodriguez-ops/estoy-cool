'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#E7ECFB' }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
          <img src="/Mesa-de-trabajo-2-copia-10@4x.png" alt="Estoy Cool" className="h-16 w-auto mx-auto mb-6" />
          <p className="font-bold text-base mb-2" style={{ color: '#18181f' }}>Algo ha salido mal</p>
          <p className="text-sm mb-8" style={{ color: '#888' }}>
            Ha ocurrido un error inesperado. Puedes intentarlo de nuevo o volver al inicio.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="w-full py-3 rounded-full text-sm font-bold"
              style={{ backgroundColor: '#FFD400', color: '#18181f' }}
            >
              Intentar de nuevo
            </button>
            <Link href="/login" className="w-full py-3 rounded-full text-sm font-bold text-center"
              style={{ backgroundColor: '#F0F0F6', color: '#18181f' }}>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

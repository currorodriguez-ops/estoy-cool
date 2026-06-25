import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#E7ECFB' }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
          <img src="/Mesa-de-trabajo-2-copia-10@4x.png" alt="Estoy Cool" className="h-16 w-auto mx-auto mb-6" />
          <p className="font-bold text-base mb-2" style={{ color: '#18181f' }}>Página no encontrada</p>
          <p className="text-sm mb-8" style={{ color: '#888' }}>
            La página que buscas no existe o ha sido movida.
          </p>
          <Link href="/login" className="w-full block py-3 rounded-full text-sm font-bold text-center"
            style={{ backgroundColor: '#FFD400', color: '#18181f' }}>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

interface Props {
  storeName: string
}

export default function SuspendedPage({ storeName }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-6">
        <span className="font-serif text-xl text-[#FAF8F5] leading-none">✦</span>
      </div>
      <h1 className="font-serif text-2xl text-[#1a1a1a] mb-2">{storeName}</h1>
      <p className="text-sm text-[#1a1a1a]/50 max-w-xs leading-relaxed">
        Este catálogo está temporariamente indisponível.
        Entre em contato com a lojista para mais informações.
      </p>
      <div className="mt-12 pt-8 border-t border-black/8 w-full max-w-xs">
        <p className="text-xs text-[#1a1a1a]/20">Vitrine · Catálogos digitais</p>
      </div>
    </div>
  )
}

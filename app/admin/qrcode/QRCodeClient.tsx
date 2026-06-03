'use client'

import QRCode from 'react-qr-code'
import { useRef, useState } from 'react'
import { Download, Copy, Check } from 'lucide-react'

export default function QRCodeClient({ storeUrl, storeSlug }: { storeUrl: string; storeSlug: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  function downloadSVG() {
    const svg = wrapperRef.current?.querySelector('svg')
    if (!svg) return
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qrcode-${storeSlug}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(storeUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-8 py-12 px-4">
      <div className="text-center">
        <h1 className="font-serif text-2xl text-[#1a1a1a] mb-2">QR Code da loja</h1>
        <p className="text-xs text-[#1a1a1a]/40 font-mono">{storeUrl}</p>
      </div>

      <div ref={wrapperRef} className="p-8 bg-white border border-black/8 shadow-sm">
        <QRCode value={storeUrl} size={220} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={downloadSVG}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] text-white text-sm uppercase tracking-widest hover:bg-black transition-colors cursor-pointer"
        >
          <Download size={15} />
          Baixar SVG
        </button>
        <button
          onClick={copyLink}
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-black/15 text-sm text-[#1a1a1a] hover:bg-black/5 transition-colors cursor-pointer"
        >
          {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
          {copied ? 'Copiado!' : 'Copiar link'}
        </button>
      </div>

      <p className="text-xs text-[#1a1a1a]/30 text-center max-w-sm">
        Imprima e exiba na sua loja física para clientes acessarem o catálogo pelo celular.
      </p>
    </div>
  )
}

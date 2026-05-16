'use client'

import { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'
import { Copy, Check, Share2, Link2 } from 'lucide-react'

export default function ShareCard() {
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    const origin = window.location.origin
    setUrl(origin)
    setCanShare(!!navigator.share)
  }, [])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }

  async function shareLink() {
    if (!navigator.share) return
    await navigator.share({ title: 'Catálogo', url })
  }

  if (!url) return null

  return (
    <div className="px-4 mb-6">
      <div className="border border-black/8 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* QR Code */}
        <div className="shrink-0 bg-white p-2 rounded">
          <QRCode value={url} size={72} level="M" />
        </div>

        {/* Info + ações */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#1a1a1a]/40 uppercase tracking-wider mb-1">Link do catálogo</p>
          <div className="flex items-center gap-2 mb-3">
            <Link2 size={12} className="text-[#1a1a1a]/30 shrink-0" />
            <p className="text-sm text-[#1a1a1a] truncate font-mono">{url}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-black/15 text-xs text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:border-black/30 transition-colors cursor-pointer"
            >
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>
            {canShare && (
              <button
                onClick={shareLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] text-white text-xs hover:bg-black transition-colors cursor-pointer"
              >
                <Share2 size={12} />
                Compartilhar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

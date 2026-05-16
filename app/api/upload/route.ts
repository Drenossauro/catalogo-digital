import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const cloudinaryForm = new FormData()
  cloudinaryForm.append('file', file)
  cloudinaryForm.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET!)
  cloudinaryForm.append('folder', 'catalogo-digital')

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: cloudinaryForm }
  )

  if (!res.ok) return NextResponse.json({ error: 'Upload failed' }, { status: 500 })

  const data = await res.json()
  return NextResponse.json({ url: data.secure_url })
}

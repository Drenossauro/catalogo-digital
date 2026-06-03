import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getStorePlanFeatures } from '@/lib/plans'
import QRCodeClient from './QRCodeClient'

export default async function QRCodePage() {
  const session = await auth()
  if (!session?.user?.storeId) redirect('/admin/login')

  const features = await getStorePlanFeatures(session.user.storeId)
  if (!features.has_qr_code) redirect('/admin/assinatura')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const storeUrl = `${appUrl}/loja/${session.user.storeSlug}`

  return <QRCodeClient storeUrl={storeUrl} storeSlug={session.user.storeSlug!} />
}

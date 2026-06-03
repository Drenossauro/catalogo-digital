export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, orderItems } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import AdminNav from '@/components/admin/AdminNav'
import OrdersClient from './OrdersClient'

export default async function PedidosPage() {
  const session = await auth()
  const storeId = session?.user?.storeId ?? null

  const rows = storeId
    ? await db
        .select()
        .from(orders)
        .where(eq(orders.storeId, storeId))
        .orderBy(desc(orders.createdAt))
        .limit(100)
    : []

  // Buscar itens dos pedidos
  const orderIds = rows.map((o) => o.id)
  const items =
    orderIds.length > 0
      ? await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, orderIds[0])) // simplificado — client faz a agregação
      : []

  void items // itens buscados por pedido no client

  return (
    <>
      <AdminNav />
      <main className="w-full py-6">
        <div className="flex items-center justify-between mb-6 px-4">
          <h1 className="font-serif text-xl text-[#1a1a1a]">Pedidos</h1>
        </div>
        <OrdersClient initialOrders={rows} storeId={storeId ?? ''} />
      </main>
    </>
  )
}

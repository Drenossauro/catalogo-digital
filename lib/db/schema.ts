import {
  pgTable,
  uuid,
  text,
  numeric,
  boolean,
  timestamp,
  integer,
  jsonb,
  unique,
} from 'drizzle-orm/pg-core'

// ---------------------------------------------------------------------------
// plans — planos de assinatura
// ---------------------------------------------------------------------------
export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  priceMonthly: numeric('price_monthly', { precision: 10, scale: 2 }).notNull(),
  priceAnnual: numeric('price_annual', { precision: 10, scale: 2 }),
  trialDays: integer('trial_days').notNull().default(0),
  // features: { max_products, max_categories, max_members, max_stores,
  //             has_variants, has_qr_code, has_custom_domain }
  // null = ilimitado; campo ausente = feature desabilitada
  features: jsonb('features').notNull().default({}),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

// ---------------------------------------------------------------------------
// users — contas de usuário
// ---------------------------------------------------------------------------
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().default(''),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  // 'admin' = operador da plataforma | NULL = lojista/gerente (papel via store_members)
  systemRole: text('system_role'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ---------------------------------------------------------------------------
// stores — lojas
// ---------------------------------------------------------------------------
export const stores = pgTable('stores', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
  whatsappNumber: text('whatsapp_number').notNull().default(''),
  maxInstallments: text('max_installments').notNull().default('1'),
  theme: text('theme').notNull().default('prata'),
  logoUrl: text('logo_url'),
  // 'pending' = aguardando pagamento | 'active' | 'inactive' = inadimplente
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ---------------------------------------------------------------------------
// store_members — quem tem acesso a qual loja e com qual papel
// ---------------------------------------------------------------------------
export const storeMembers = pgTable('store_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  storeId: uuid('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  // 'lojista' = dono/pagador | 'gerente' = operacional
  role: text('role').notNull(),
  invitedBy: uuid('invited_by').references(() => users.id, { onDelete: 'set null' }),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  unique('store_members_store_user_unique').on(table.storeId, table.userId),
])

// ---------------------------------------------------------------------------
// subscriptions — vínculo loja ↔ plano ↔ Mercado Pago
// ---------------------------------------------------------------------------
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  storeId: uuid('store_id').notNull().unique().references(() => stores.id, { onDelete: 'cascade' }),
  planId: uuid('plan_id').notNull().references(() => plans.id),
  // 'trial' | 'active' | 'past_due' | 'cancelled' | 'inactive'
  status: text('status').notNull().default('trial'),
  // 'monthly' | 'annual'
  billingPeriod: text('billing_period').notNull().default('monthly'),
  // Sobrescreve plans.trial_days quando definido manualmente por admin
  trialEndsAt: timestamp('trial_ends_at'),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  // Preenchido quando entra em past_due (D+3 = data de bloqueio)
  gracePeriodEndsAt: timestamp('grace_period_ends_at'),
  mpPreapprovalId: text('mp_preapproval_id'),
  mpPayerEmail: text('mp_payer_email'),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ---------------------------------------------------------------------------
// categories — categorias de produto por loja
// ---------------------------------------------------------------------------
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  storeId: uuid('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  // slug único dentro da mesma loja (não globalmente)
  unique('categories_store_slug_unique').on(table.storeId, table.slug),
])

// ---------------------------------------------------------------------------
// products — produtos por loja
// ---------------------------------------------------------------------------
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  storeId: uuid('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  active: boolean('active').notNull().default(true),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ---------------------------------------------------------------------------
// product_variants — variações de produto (tamanho, cor, etc.)
// Disponível apenas para planos Pro e Business (features.has_variants = true)
// ---------------------------------------------------------------------------
export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  label: text('label').notNull(), // ex: "Tamanho", "Cor"
  // ex: [{ "value": "P", "price_modifier": 0 }, { "value": "G", "price_modifier": 5.00 }]
  options: jsonb('options').notNull().default([]),
  required: boolean('required').notNull().default(false),
  position: integer('position').notNull().default(0),
})

// ---------------------------------------------------------------------------
// orders — intenções de pedido
// ---------------------------------------------------------------------------
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  storeId: uuid('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  // { street, number, complement, neighborhood, city, state, zip }
  customerAddress: jsonb('customer_address'),
  // 'pending' | 'confirmed' | 'in_progress' | 'ready' | 'delivered' | 'cancelled'
  status: text('status').notNull().default('pending'),
  notes: text('notes'),          // observações do cliente
  internalNotes: text('internal_notes'), // anotações do lojista/gerente
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  whatsappNotified: boolean('whatsapp_notified').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ---------------------------------------------------------------------------
// order_items — itens do pedido (snapshot para imutabilidade histórica)
// ---------------------------------------------------------------------------
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  // nullable: produto pode ser deletado após o pedido
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  productName: text('product_name').notNull(), // snapshot
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(), // snapshot
  quantity: integer('quantity').notNull(),
  variantLabel: text('variant_label'), // ex: "Tamanho: M / Cor: Azul"
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
})

// ---------------------------------------------------------------------------
// notifications — log de notificações enviadas
// ---------------------------------------------------------------------------
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  storeId: uuid('store_id').references(() => stores.id, { onDelete: 'set null' }),
  // 'subscription_trial_ending' | 'subscription_past_due' | 'subscription_inactive'
  // | 'subscription_reactivated' | 'new_order' | 'invite_received'
  type: text('type').notNull(),
  // 'email' | 'in_app'
  channel: text('channel').notNull(),
  // 'pending' | 'sent' | 'failed'
  status: text('status').notNull().default('pending'),
  payload: jsonb('payload').notNull().default({}), // dados enviados (auditoria/reenvio)
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
})

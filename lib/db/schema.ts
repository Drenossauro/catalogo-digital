import { pgTable, uuid, text, numeric, boolean, timestamp } from 'drizzle-orm/pg-core'

export const stores = pgTable('stores', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  whatsappNumber: text('whatsapp_number').notNull().default(''),
  maxInstallments: text('max_installments').notNull().default('1'),
  theme: text('theme').notNull().default('prata'),
  logoUrl: text('logo_url'),
  subscriptionStatus: text('subscription_status').notNull().default('active'),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  storeId: uuid('store_id').references(() => stores.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
})

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  storeId: uuid('store_id').references(() => stores.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  storeId: uuid('store_id').references(() => stores.id, { onDelete: 'set null' }),
  role: text('role').notNull().default('admin'),
  createdAt: timestamp('created_at').defaultNow(),
})

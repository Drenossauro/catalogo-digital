import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { db } from '@/lib/db'
import { users, storeMembers, stores, subscriptions } from '@/lib/db/schema'
import { eq, and, isNotNull } from 'drizzle-orm'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)

        if (!user) return null

        const valid = await compare(credentials.password as string, user.passwordHash)
        if (!valid) return null

        return { id: user.id, email: user.email }
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, trigger, session: updateData }) {
      // Persist preferred store when user switches via store selector
      if (trigger === 'update' && updateData?.preferredStoreId !== undefined) {
        token.preferredStoreId = updateData.preferredStoreId
      }

      // Refresh from DB on login OR explicit session update
      if (user || trigger === 'update' || !token.systemRole) {
        const userId = (user?.id ?? token.sub) as string

        // system_role
        const [dbUser] = await db
          .select({ systemRole: users.systemRole })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)

        token.systemRole = dbUser?.systemRole ?? null

        // Active store: prefer user-selected store, otherwise first accepted membership
        const whereConditions = [
          eq(storeMembers.userId, userId),
          isNotNull(storeMembers.acceptedAt),
          token.preferredStoreId
            ? eq(storeMembers.storeId, token.preferredStoreId as string)
            : undefined,
        ] as const

        const [membership] = await db
          .select({
            storeId: storeMembers.storeId,
            storeRole: storeMembers.role,
            storeSlug: stores.slug,
          })
          .from(storeMembers)
          .innerJoin(stores, eq(stores.id, storeMembers.storeId))
          .where(and(...whereConditions))
          .orderBy(storeMembers.createdAt)
          .limit(1)

        // If preferred store not found (e.g. removed), fall back to first
        const activeMembership = membership ?? await db
          .select({
            storeId: storeMembers.storeId,
            storeRole: storeMembers.role,
            storeSlug: stores.slug,
          })
          .from(storeMembers)
          .innerJoin(stores, eq(stores.id, storeMembers.storeId))
          .where(and(eq(storeMembers.userId, userId), isNotNull(storeMembers.acceptedAt)))
          .orderBy(storeMembers.createdAt)
          .limit(1)
          .then(r => r[0] ?? null)

        token.storeId = activeMembership?.storeId ?? null
        token.storeSlug = activeMembership?.storeSlug ?? null
        token.storeRole = activeMembership?.storeRole ?? null

        // Subscription status for the active store
        if (activeMembership?.storeId) {
          const [sub] = await db
            .select({ status: subscriptions.status })
            .from(subscriptions)
            .where(eq(subscriptions.storeId, activeMembership.storeId))
            .limit(1)
          token.subscriptionStatus = sub?.status ?? null
        } else {
          token.subscriptionStatus = null
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub ?? ''
      session.user.storeId = (token.storeId as string | null) ?? null
      session.user.storeSlug = (token.storeSlug as string | null) ?? null
      session.user.systemRole = (token.systemRole as string | null) ?? null
      session.user.storeRole = (token.storeRole as string | null) ?? null
      session.user.subscriptionStatus = (token.subscriptionStatus as string | null) ?? null
      return session
    },
  },
})

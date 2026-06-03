import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      storeId: string | null          // ID da loja ativa (vem de store_members)
      storeSlug: string | null        // slug da loja ativa
      systemRole: string | null       // 'admin' | null
      storeRole: string | null        // 'lojista' | 'gerente' | null
      subscriptionStatus: string | null // 'trial' | 'active' | 'past_due' | 'cancelled' | 'inactive'
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    storeId?: string | null
    storeSlug?: string | null
    systemRole?: string | null
    storeRole?: string | null
    subscriptionStatus?: string | null
  }
}

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

type DB = ReturnType<typeof drizzle<typeof schema>>

let _db: DB | undefined

export const db = new Proxy({} as DB, {
  get(_, prop) {
    if (!_db) {
      _db = drizzle(neon(process.env.DATABASE_URL!), { schema })
    }
    return (_db as any)[prop]
  },
})

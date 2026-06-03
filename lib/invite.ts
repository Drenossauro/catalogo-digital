import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET ?? 'fallback-secret')

export interface InvitePayload {
  storeId: string
  role: 'gerente'
  email: string
  invitedById: string
}

/** Gera token de convite válido por 7 dias */
export async function createInviteToken(payload: InvitePayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

/** Verifica e decodifica o token de convite */
export async function verifyInviteToken(token: string): Promise<InvitePayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as InvitePayload
  } catch {
    return null
  }
}

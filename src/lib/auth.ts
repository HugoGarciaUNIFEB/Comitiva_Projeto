import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "comitiva_fogo_de_chao_super_secret_jwt_key_2026_segura"
);

export const AUTH_COOKIE_NAME = "comitiva_auth_token";

export interface TokenPayload {
  sub: string;
  whatsapp: string;
  role: string;
  name: string;
}

// Criação do token JWT assinado com a biblioteca jose
export async function createAuthToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// Validação do token JWT
export async function verifyAuthToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// Recupera o usuário logado atualmente a partir dos cookies da requisição
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = await verifyAuthToken(token);
    if (!decoded || !decoded.sub) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        name: true,
        whatsapp: true,
        email: true,
        role: true,
        points: true,
        welcomeSpins: true,
        avatar: true,
        createdAt: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

// Helper para obter os dados do usuário autenticado a partir do token
export async function getAuthUserFromCookie(request?: Request) {
  const user = await getCurrentUser();
  if (!user) return null;
  return { userId: user.id, role: user.role, name: user.name, whatsapp: user.whatsapp };
}

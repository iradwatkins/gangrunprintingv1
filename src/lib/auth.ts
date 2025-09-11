import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { cache } from "react";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production"
    }
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      name: attributes.name,
      role: attributes.role,
      emailVerified: attributes.emailVerified
    };
  }
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
}

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null
      };
    }

    const result = await lucia.validateSession(sessionId);
    
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch {}
    
    return result;
  }
);

// Helper functions for authentication
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

export async function verifyPassword(
  hashedPassword: string,
  plainPassword: string
): Promise<boolean> {
  return await argon2.verify(hashedPassword, plainPassword);
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  role: string = "CUSTOMER"
) {
  const hashedPassword = await hashPassword(password);
  
  // Special handling for admin email
  if (email === 'iradwatkins@gmail.com') {
    role = 'ADMIN';
  }
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      emailVerified: false
    }
  });
  
  return user;
}

export async function signIn(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user || !user.password) {
    throw new Error("Invalid credentials");
  }
  
  const validPassword = await verifyPassword(user.password, password);
  
  if (!validPassword) {
    throw new Error("Invalid credentials");
  }
  
  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  
  return { user, session };
}

export async function signOut() {
  const { session } = await validateRequest();
  
  if (!session) {
    return {
      error: "Unauthorized"
    };
  }
  
  await lucia.invalidateSession(session.id);
  
  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
};

export type Session = {
  id: string;
  userId: string;
  expiresAt: Date;
};
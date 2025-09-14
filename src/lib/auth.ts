import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { cache } from "react";
import { generateRandomString } from "oslo/crypto";
import resend from "@/lib/resend";

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

// Magic Link Authentication Functions
export async function generateMagicLink(email: string): Promise<string> {
  const token = generateRandomString(32, "abcdefghijklmnopqrstuvwxyz0123456789");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email }
  });

  // Create new verification token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: expiresAt
    }
  });

  return token;
}

export async function sendMagicLink(email: string, name?: string): Promise<void> {
  const token = await generateMagicLink(email);
  const magicLink = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

  await resend.emails.send({
    from: 'GangRun Printing <noreply@gangrunprinting.com>',
    to: email,
    subject: 'Sign in to GangRun Printing',
    html: `
      <h1>Sign in to GangRun Printing</h1>
      <p>Hello${name ? ` ${name}` : ''},</p>
      <p>Click the link below to sign in to your account:</p>
      <p><a href="${magicLink}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Sign In</a></p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `
  });
}

export async function verifyMagicLink(token: string, email: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: email,
        token
      }
    }
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    throw new Error("Invalid or expired token");
  }

  // Delete the used token
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: email,
        token
      }
    }
  });

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    // Special handling for admin email
    const role = email === 'iradwatkins@gmail.com' ? 'ADMIN' : 'CUSTOMER';

    user = await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0], // Default name from email
        role,
        emailVerified: true
      }
    });
  } else {
    // Mark email as verified
    user = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true }
    });
  }

  // Create session
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
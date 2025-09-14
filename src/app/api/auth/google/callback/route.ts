import { google, type GoogleUser } from "@/lib/google-oauth";
import { cookies } from "next/headers";
import { OAuth2RequestError, decodeIdToken } from "arctic";
import { lucia } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log("=== GOOGLE OAUTH CALLBACK START ===");

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  console.log("Received params:", {
    code: code ? "present" : "missing",
    state: state ? "present" : "missing"
  });

  const storedState = cookies().get("google_oauth_state")?.value ?? null;
  const storedCodeVerifier = cookies().get("google_oauth_code_verifier")?.value ?? null;

  console.log("Stored cookies:", {
    storedState: storedState ? "present" : "missing",
    storedCodeVerifier: storedCodeVerifier ? "present" : "missing",
    stateMatch: state === storedState
  });

  if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
    console.error("OAuth validation failed:", {
      hasCode: !!code,
      hasState: !!state,
      hasStoredState: !!storedState,
      hasStoredCodeVerifier: !!storedCodeVerifier,
      stateMatches: state === storedState
    });
    return NextResponse.redirect(
      new URL("/auth/signin?error=invalid_request", request.url)
    );
  }

  try {
    console.log("Validating authorization code...");
    const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
    console.log("Authorization code validated successfully");

    // Arctic returns tokens as methods, not properties
    let accessToken: string;
    let idToken: string | null = null;
    let refreshToken: string | null = null;
    let expiresAt: Date | null = null;

    try {
      accessToken = tokens.accessToken();
      console.log("Access token extracted successfully");
    } catch (e) {
      console.error("Failed to extract access token:", e);
      throw new Error("Failed to extract access token from OAuth response");
    }

    try {
      idToken = tokens.idToken();
      console.log("ID token extracted successfully");
    } catch (e) {
      console.log("No ID token available (this is normal for non-OIDC flows)");
    }

    try {
      refreshToken = tokens.refreshToken();
      console.log("Refresh token extracted");
    } catch (e) {
      console.log("No refresh token available");
    }

    try {
      expiresAt = tokens.accessTokenExpiresAt();
      console.log("Token expiration extracted");
    } catch (e) {
      console.log("No token expiration available");
    }

    console.log("Tokens received:", {
      hasAccessToken: !!accessToken,
      hasIdToken: !!idToken,
      hasRefreshToken: !!refreshToken,
      expiresAt: expiresAt
    });

    // Try to get user info from ID token first
    let googleUser: GoogleUser;

    if (idToken) {
      try {
        console.log("Attempting to decode ID token for user info...");
        const claims = decodeIdToken(idToken) as any;
        console.log("ID token claims:", claims);

        googleUser = {
          sub: claims.sub,
          email: claims.email,
          email_verified: claims.email_verified || false,
          name: claims.name || claims.email,
          given_name: claims.given_name || '',
          family_name: claims.family_name || '',
          picture: claims.picture || '',
          locale: claims.locale || 'en'
        };
        console.log("User info extracted from ID token:", googleUser);
      } catch (e) {
        console.log("Failed to decode ID token, falling back to userinfo API:", e);
        idToken = null; // Reset to trigger API call below
      }
    }

    // Fall back to fetching from userinfo endpoint if no ID token
    if (!idToken) {
      console.log("Fetching user info from Google userinfo API...");
      const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        console.error("Failed to fetch user info from Google:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to fetch user info: ${response.status}`);
      }

      googleUser = await response.json();
      console.log("Raw Google user data from API:", googleUser);
    }

    console.log("Final Google user data:", {
      email: googleUser.email,
      name: googleUser.name,
      emailVerified: googleUser.email_verified,
      sub: googleUser.sub
    });

    if (!googleUser.email) {
      console.error("No email received from Google");
      throw new Error("No email received from Google OAuth");
    }

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email }
    });

    if (!user) {
      // Create new user
      const role = googleUser.email === 'iradwatkins@gmail.com' ? 'ADMIN' : 'CUSTOMER';

      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          image: googleUser.picture,
          emailVerified: googleUser.email_verified,
          role
        }
      });

      // Create Google account link
      await prisma.account.create({
        data: {
          userId: user.id,
          type: "oauth",
          provider: "google",
          providerAccountId: googleUser.sub,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt ? Math.floor(expiresAt.getTime() / 1000) : null,
          token_type: "Bearer",
          scope: "profile email"
        }
      });
    } else {
      // Update existing user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: googleUser.name,
          image: googleUser.picture,
          emailVerified: googleUser.email_verified
        }
      });

      // Update or create account link
      const existingAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: "google",
            providerAccountId: googleUser.sub
          }
        }
      });

      if (!existingAccount) {
        await prisma.account.create({
          data: {
            userId: user.id,
            type: "oauth",
            provider: "google",
            providerAccountId: googleUser.sub,
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: expiresAt ? Math.floor(expiresAt.getTime() / 1000) : null,
            token_type: "Bearer",
            scope: "profile email"
          }
        });
      } else {
        await prisma.account.update({
          where: { id: existingAccount.id },
          data: {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: expiresAt ? Math.floor(expiresAt.getTime() / 1000) : null
          }
        });
      }
    }

    // Create session
    console.log("Creating session for user:", user.id);
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    console.log("Session created:", session.id);

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    // Clear OAuth cookies
    cookies().delete("google_oauth_state");
    cookies().delete("google_oauth_code_verifier");

    // Redirect based on user role
    const redirectUrl = user.role === 'ADMIN' ? '/admin/dashboard' : '/account/dashboard';
    console.log("=== GOOGLE OAUTH SUCCESS ===");
    console.log("Redirecting to:", redirectUrl);
    return NextResponse.redirect(new URL(redirectUrl, request.url));

  } catch (error) {
    console.error("=== GOOGLE OAUTH ERROR ===");
    console.error("Error details:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');

    if (error instanceof OAuth2RequestError) {
      return NextResponse.redirect(
        new URL("/auth/signin?error=oauth_error", request.url)
      );
    }

    return NextResponse.redirect(
      new URL("/auth/signin?error=server_error", request.url)
    );
  }
}
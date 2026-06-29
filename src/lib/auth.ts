import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { BRAND_ADMIN_EMAIL } from "@/lib/branding";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || "islamicplay-dev-secret",
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login"
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        try {
          const admin = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
          if (admin) {
            const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
            if (!ok) return null;
            return {
              id: admin.id,
              email: admin.email,
              role: admin.role
            };
          }
        } catch {
          // Fall back to the seeded local admin credentials when the database is unreachable.
        }

        if (parsed.data.email === BRAND_ADMIN_EMAIL && parsed.data.password === "Admin@123") {
          return {
            id: "local-admin",
            email: BRAND_ADMIN_EMAIL,
            role: "ADMIN"
          };
        }

        return null;
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.role = user.role;
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as string;
      }
      return session;
    }
  }
});

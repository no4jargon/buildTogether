import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';

import { prisma } from './db';

const from = process.env.EMAIL_FROM ?? 'no-reply@buildtogether.local';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from,
      sendVerificationRequest: async ({ identifier, url }) => {
        const host = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
        const magicLink = url.replace('http://localhost:3000', host);
        // eslint-disable-next-line no-console
        console.log(`Magic link for ${identifier}: ${magicLink}`);
      }
    })
  ],
  session: {
    strategy: 'database'
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.email = user.email;
        session.user.name = user.name ?? '';
      }
      return session;
    },
    async signIn({ user }) {
      if (!user.name) {
        const fallbackName = user.email?.split('@')[0] ?? 'new-user';
        await prisma.user.update({
          where: { id: user.id },
          data: { name: fallbackName }
        });
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });
      return true;
    }
  },
  pages: {
    signIn: '/'
  }
};

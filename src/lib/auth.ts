import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import nodemailer from 'nodemailer';

import { prisma } from './db';

const from = process.env.EMAIL_FROM ?? 'no-reply@buildtogether.local';
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpSecure = process.env.SMTP_SECURE === 'true';
const hasSmtpCredentials = Boolean(smtpHost && smtpUser && smtpPass);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from,
      sendVerificationRequest: async ({ identifier, url }) => {
        const host = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
        const magicLink = url.replace('http://localhost:3000', host);
        if (!hasSmtpCredentials) {
          // eslint-disable-next-line no-console
          console.log(`Magic link for ${identifier}: ${magicLink}`);
          return;
        }

        const transport = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });

        await transport.sendMail({
          to: identifier,
          from,
          subject: 'Sign in to Build Together',
          text: `Sign in to Build Together:\n${magicLink}\n`,
          html: `<p>Sign in to Build Together:</p><p><a href="${magicLink}">${magicLink}</a></p>`
        });
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
    signIn: '/signin'
  }
};

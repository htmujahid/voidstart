import { defineAuth } from 'void/auth';
import { sendEmail } from 'void/email';

export default defineAuth(({ defaults }) => ({
  ...defaults,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const result = await sendEmail({
        to: user.email,
        subject: 'Reset your password',
        text: `Hi ${user.name},\n\nReset your password using this link:\n${url}\n\nIf you didn't request this, you can ignore this email.`,
      });
      if (!result.ok) console.error('Failed to send reset email', result);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const result = await sendEmail({
        to: user.email,
        subject: 'Verify your email address',
        text: `Hi ${user.name},\n\nConfirm your email address using this link:\n${url}\n\nIf you didn't create an account, you can ignore this email.`,
      });
      if (!result.ok) console.error('Failed to send verification email', result);
    },
  },
}));

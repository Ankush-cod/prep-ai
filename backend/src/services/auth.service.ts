// src/services/auth.service.ts
import { BranchCode, UserRole } from '@prisma/client';
import { prisma } from '../config/database';
import { serviceStatus } from '../config/env';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ServiceUnavailableError,
  UnauthorizedError,
} from '../utils/errors';
import {
  generateOpaqueToken,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { comparePassword, hashPassword } from '../utils/password';
import { sendPasswordResetEmail, sendVerificationEmail } from '../utils/email';

const BRANCH_NAMES: Record<BranchCode, string> = {
  CSE: 'Computer Science & Engineering',
  ECE: 'Electronics & Communication Engineering',
  EE: 'Electrical Engineering',
  ME: 'Mechanical Engineering',
};

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  branch: BranchCode;
  academicYear: number;
  semester: number;
  institution: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

function formatAuthUser(user: {
  id: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  profile: { fullName: string } | null;
  academicDetails: {
    institution: string;
    academicYear: number;
    branch: { code: BranchCode };
    semester: { number: number };
  } | null;
}) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    fullName: user.profile?.fullName || user.email.split('@')[0],
    branch: user.academicDetails?.branch.code,
    academicYear: user.academicDetails?.academicYear,
    semester: user.academicDetails?.semester.number,
    institution: user.academicDetails?.institution,
  };
}

export const authService = {
  async register(input: RegisterInput) {
    const email = input.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError('An account with this email already exists.', {
        email: 'This email address is already registered.',
      });
    }

    const passwordHash = await hashPassword(input.password);
    const rawVerifyToken = generateOpaqueToken(32);
    const verifyTokenHash = hashToken(rawVerifyToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const created = await prisma.$transaction(async (tx) => {
      const branch = await tx.branch.upsert({
        where: { code: input.branch },
        update: {},
        create: {
          code: input.branch,
          name: BRANCH_NAMES[input.branch],
        },
      });

      const semester = await tx.semester.upsert({
        where: { number: input.semester },
        update: {},
        create: {
          number: input.semester,
          label: `Semester ${input.semester}`,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: UserRole.USER,
          isEmailVerified: false,
          profile: {
            create: {
              fullName: input.fullName.trim(),
            },
          },
          academicDetails: {
            create: {
              institution: input.institution.trim(),
              branchId: branch.id,
              semesterId: semester.id,
              academicYear: input.academicYear,
            },
          },
          settings: {
            create: {},
          },
          emailVerificationTokens: {
            create: {
              tokenHash: verifyTokenHash,
              expiresAt,
            },
          },
        },
        include: {
          profile: true,
          academicDetails: {
            include: {
              branch: true,
              semester: true,
            },
          },
        },
      });

      return user;
    });

    const emailResult = await sendVerificationEmail(
      created.email,
      created.profile?.fullName || input.fullName,
      rawVerifyToken
    );

    return {
      message: emailResult.sent
        ? 'Account created successfully. Please check your email to verify your address.'
        : 'Account created successfully. Email delivery is not configured on this server; contact an administrator or configure SMTP to receive verification emails.',
      emailSent: emailResult.sent,
      user: formatAuthUser(created),
    };
  },

  async login(input: LoginInput) {
    const email = input.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        academicDetails: {
          include: {
            branch: true,
            semester: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('This account has been deactivated.');
    }

    const passwordMatches = await comparePassword(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const rawTokenId = generateOpaqueToken(24);
    const refreshToken = signRefreshToken({
      userId: user.id,
      tokenId: rawTokenId,
    });

    const refreshExpiresDays = input.rememberMe === false ? 1 : 7;
    await prisma.$transaction([
      prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(refreshToken),
          expiresAt: new Date(Date.now() + refreshExpiresDays * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }),
    ]);

    return {
      message: 'Signed in successfully.',
      accessToken,
      refreshToken,
      user: formatAuthUser(user),
    };
  },

  async refreshAccessToken(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw new UnauthorizedError('Refresh token is missing.');
    }

    const decoded = verifyRefreshToken(rawRefreshToken);
    const tokenHash = hashToken(rawRefreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            profile: true,
            academicDetails: {
              include: { branch: true, semester: true },
            },
          },
        },
      },
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date() ||
      storedToken.userId !== decoded.userId ||
      !storedToken.user.isActive
    ) {
      throw new UnauthorizedError('Refresh token is invalid or has expired.');
    }

    const newAccessToken = signAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });

    const newRefreshToken = signRefreshToken({
      userId: storedToken.user.id,
      tokenId: generateOpaqueToken(24),
    });

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      }),
      prisma.refreshToken.create({
        data: {
          userId: storedToken.user.id,
          tokenHash: hashToken(newRefreshToken),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: formatAuthUser(storedToken.user),
    };
  },

  async logout(rawRefreshToken?: string) {
    if (rawRefreshToken) {
      await prisma.refreshToken.updateMany({
        where: {
          tokenHash: hashToken(rawRefreshToken),
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    }

    return { message: 'Logged out successfully.' };
  },

  async verifyEmail(rawToken: string) {
    const tokenHash = hashToken(rawToken.trim());
    const record = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt <= new Date()) {
      throw new BadRequestError('Verification token is invalid or has expired.');
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { isEmailVerified: true },
      }),
      prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Email verified successfully. You can now sign in.' };
  },

  async resendVerification(emailInput: string) {
    const email = emailInput.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      return {
        message: 'If an unverified account exists for this email, a verification link has been sent.',
      };
    }

    if (user.isEmailVerified) {
      return {
        message: 'This email address is already verified. You can sign in directly.',
      };
    }

    const rawToken = generateOpaqueToken(32);
    await prisma.$transaction([
      prisma.emailVerificationToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      }),
      prisma.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(rawToken),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    const emailResult = await sendVerificationEmail(
      user.email,
      user.profile?.fullName || user.email,
      rawToken
    );

    if (!emailResult.sent && serviceStatus.hasSmtp) {
      throw new ServiceUnavailableError(
        emailResult.reason || 'Unable to send verification email right now.'
      );
    }

    return {
      message: emailResult.sent
        ? 'Verification email sent. Please check your inbox.'
        : 'Verification token generated, but SMTP is not configured on this server.',
      emailSent: emailResult.sent,
    };
  },

  async forgotPassword(emailInput: string) {
    const email = emailInput.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !user.isActive) {
      return {
        message:
          'If an account matches this email address, password reset instructions have been sent.',
      };
    }

    const rawToken = generateOpaqueToken(32);
    await prisma.$transaction([
      prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(rawToken),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      }),
    ]);

    const emailResult = await sendPasswordResetEmail(
      user.email,
      user.profile?.fullName || user.email,
      rawToken
    );

    if (!emailResult.sent && serviceStatus.hasSmtp) {
      throw new ServiceUnavailableError(
        emailResult.reason || 'Unable to send password reset email right now.'
      );
    }

    return {
      message: emailResult.sent
        ? 'If an account matches this email address, password reset instructions have been sent.'
        : 'Password reset token generated, but SMTP is not configured on this server.',
      emailSent: emailResult.sent,
    };
  },

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = hashToken(rawToken.trim());
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.usedAt || record.expiresAt <= new Date()) {
      throw new BadRequestError('Password reset token is invalid or has expired.');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return {
      message: 'Your password has been reset successfully. Please sign in with your new password.',
    };
  },

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        academicDetails: {
          include: { branch: true, semester: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Authenticated user record no longer exists.');
    }

    return formatAuthUser(user);
  },
};

// src/services/profile.service.ts
import { BranchCode, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export const profileService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        profile: true,
        academicDetails: {
          include: { branch: true, semester: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User profile not found.');
    }

    return user;
  },

  async updateProfile(
    userId: string,
    input: {
      fullName?: string;
      phone?: string | null;
      bio?: string | null;
      targetRoles?: string[];
      targetCompanies?: string[];
      targetCompensation?: string | null;
      skillsLanguages?: Prisma.InputJsonValue;
      skillsSystems?: string[];
      skillsTheory?: string[];
      institution?: string;
      rollNumber?: string | null;
      branch?: BranchCode;
      academicYear?: number;
      semester?: number;
      graduationYear?: number | null;
      cgpa?: number | null;
    }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { academicDetails: true },
    });
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    await prisma.$transaction(async (tx) => {
      const profileUpdate: Prisma.UserProfileUpdateInput = {};
      if (input.fullName !== undefined) profileUpdate.fullName = input.fullName;
      if (input.phone !== undefined) profileUpdate.phone = input.phone;
      if (input.bio !== undefined) profileUpdate.bio = input.bio;
      if (input.targetRoles !== undefined) profileUpdate.targetRoles = input.targetRoles;
      if (input.targetCompanies !== undefined) {
        profileUpdate.targetCompanies = input.targetCompanies;
      }
      if (input.targetCompensation !== undefined) {
        profileUpdate.targetCompensation = input.targetCompensation;
      }
      if (input.skillsLanguages !== undefined) {
        profileUpdate.skillsLanguages = input.skillsLanguages;
      }
      if (input.skillsSystems !== undefined) profileUpdate.skillsSystems = input.skillsSystems;
      if (input.skillsTheory !== undefined) profileUpdate.skillsTheory = input.skillsTheory;

      if (Object.keys(profileUpdate).length > 0) {
        await tx.userProfile.upsert({
          where: { userId },
          create: {
            userId,
            fullName: input.fullName || user.email.split('@')[0],
            phone: input.phone ?? null,
            bio: input.bio ?? null,
            targetRoles: input.targetRoles || [],
            targetCompanies: input.targetCompanies || [],
            targetCompensation: input.targetCompensation ?? null,
            skillsLanguages: input.skillsLanguages ?? Prisma.JsonNull,
            skillsSystems: input.skillsSystems || [],
            skillsTheory: input.skillsTheory || [],
          },
          update: profileUpdate,
        });
      }

      const hasAcademicChanges =
        input.institution !== undefined ||
        input.rollNumber !== undefined ||
        input.branch !== undefined ||
        input.academicYear !== undefined ||
        input.semester !== undefined ||
        input.graduationYear !== undefined ||
        input.cgpa !== undefined;

      if (hasAcademicChanges) {
        let branchId = user.academicDetails?.branchId;
        if (input.branch) {
          const branch = await tx.branch.findUnique({ where: { code: input.branch } });
          if (!branch) throw new NotFoundError('Branch not found.');
          branchId = branch.id;
        }

        let semesterId = user.academicDetails?.semesterId;
        if (input.semester) {
          const sem = await tx.semester.findUnique({ where: { number: input.semester } });
          if (!sem) throw new NotFoundError('Semester not found.');
          semesterId = sem.id;
        }

        if (branchId && semesterId) {
          await tx.academicDetails.upsert({
            where: { userId },
            create: {
              userId,
              institution: input.institution || 'Not specified',
              rollNumber: input.rollNumber ?? null,
              branchId,
              semesterId,
              academicYear: input.academicYear || 1,
              graduationYear: input.graduationYear ?? null,
              cgpa: input.cgpa ?? null,
            },
            update: {
              ...(input.institution !== undefined ? { institution: input.institution } : {}),
              ...(input.rollNumber !== undefined ? { rollNumber: input.rollNumber } : {}),
              ...(input.branch ? { branchId } : {}),
              ...(input.semester ? { semesterId } : {}),
              ...(input.academicYear !== undefined ? { academicYear: input.academicYear } : {}),
              ...(input.graduationYear !== undefined
                ? { graduationYear: input.graduationYear }
                : {}),
              ...(input.cgpa !== undefined ? { cgpa: input.cgpa } : {}),
            },
          });
        }
      }
    });

    return this.getProfile(userId);
  },
};

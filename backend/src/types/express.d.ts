// src/types/express.d.ts
import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};

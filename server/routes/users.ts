// User Management Routes (Admin only)
import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest, requireAdmin } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

// Get all users in organization
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    where: {
      organizationId: req.user!.organizationId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(users);
}));

// Get current user profile
router.get('/me', asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      organization: {
        include: {
          subscription: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organization: {
      id: user.organization.id,
      name: user.organization.name,
      brandVoice: user.organization.brandVoice,
    },
    subscription: user.organization.subscription,
  });
}));

// Update current user profile
router.patch('/me', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  res.json(user);
}));

// Update user role (admin only)
router.patch('/:id/role', requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { role } = req.body;

  if (!['USER', 'ADMIN'].includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  // Can't change own role
  if (req.params.id === req.user!.id) {
    throw new AppError('Cannot change your own role', 400);
  }

  const user = await prisma.user.findFirst({
    where: {
      id: req.params.id,
      organizationId: req.user!.organizationId,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: req.user!.organizationId,
      userId: req.user!.id,
      action: 'role_change',
      entityType: 'user',
      entityId: user.id,
      details: { userEmail: user.email, newRole: role },
    },
  });

  res.json(updatedUser);
}));

// Delete user (admin only)
router.delete('/:id', requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  // Can't delete yourself
  if (req.params.id === req.user!.id) {
    throw new AppError('Cannot delete yourself', 400);
  }

  const user = await prisma.user.findFirst({
    where: {
      id: req.params.id,
      organizationId: req.user!.organizationId,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  await prisma.user.delete({
    where: { id: req.params.id },
  });

  res.json({ message: 'User deleted' });
}));

// Invite user (admin only)
router.post('/invite', requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, name, role = 'USER' } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('User already exists', 400);
  }

  // Create user without password (they'll set it on first login)
  const user = await prisma.user.create({
    data: {
      email,
      name,
      role,
      organizationId: req.user!.organizationId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  // In production: send invitation email with link to set password

  res.status(201).json(user);
}));

export default router;

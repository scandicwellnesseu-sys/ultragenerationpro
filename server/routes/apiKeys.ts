// API Key Routes
import { Router, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

// Get all API keys for user
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const apiKeys = await prisma.apiKey.findMany({
    where: { userId: req.user!.id },
    select: {
      id: true,
      name: true,
      key: true, // Shows only prefix in response
      permissions: true,
      lastUsedAt: true,
      expiresAt: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Mask the keys, show only first 8 chars
  const maskedKeys = apiKeys.map((k: typeof apiKeys[0]) => ({
    ...k,
    key: k.key.substring(0, 8) + '...' + k.key.substring(k.key.length - 4),
  }));

  res.json(maskedKeys);
}));

// Create new API key
router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, permissions = ['read'], expiresIn } = req.body;

  if (!name) {
    throw new AppError('Name is required', 400);
  }

  // Generate a secure random key
  const key = `ugp_${crypto.randomBytes(32).toString('hex')}`;
  const hashedKey = crypto.createHash('sha256').update(key).digest('hex');

  // Calculate expiration if provided
  let expiresAt: Date | null = null;
  if (expiresIn) {
    const days = parseInt(expiresIn);
    if (!isNaN(days)) {
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
  }

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: req.user!.id,
      name,
      key: key.substring(0, 12) + '...', // Store truncated version for display
      hashedKey,
      permissions,
      expiresAt,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: req.user!.organizationId,
      userId: req.user!.id,
      action: 'api_key_created',
      entityType: 'api_key',
      entityId: apiKey.id,
      details: { name },
    },
  });

  // Return the full key only once (on creation)
  res.status(201).json({
    id: apiKey.id,
    name: apiKey.name,
    key, // Full key - only shown once!
    permissions: apiKey.permissions,
    expiresAt: apiKey.expiresAt,
    createdAt: apiKey.createdAt,
    warning: 'Save this key now. You will not be able to see it again!',
  });
}));

// Revoke API key
router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const apiKey = await prisma.apiKey.findFirst({
    where: {
      id: req.params.id,
      userId: req.user!.id,
    },
  });

  if (!apiKey) {
    throw new AppError('API key not found', 404);
  }

  await prisma.apiKey.delete({
    where: { id: apiKey.id },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: req.user!.organizationId,
      userId: req.user!.id,
      action: 'api_key_revoked',
      entityType: 'api_key',
      entityId: apiKey.id,
      details: { name: apiKey.name },
    },
  });

  res.json({ message: 'API key revoked' });
}));

// Toggle API key active status
router.patch('/:id/toggle', asyncHandler(async (req: AuthRequest, res: Response) => {
  const apiKey = await prisma.apiKey.findFirst({
    where: {
      id: req.params.id,
      userId: req.user!.id,
    },
  });

  if (!apiKey) {
    throw new AppError('API key not found', 404);
  }

  const updated = await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { isActive: !apiKey.isActive },
  });

  res.json({
    id: updated.id,
    isActive: updated.isActive,
  });
}));

export default router;

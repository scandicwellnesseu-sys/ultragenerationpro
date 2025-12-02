// Integration Routes - E-commerce platforms
import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

// Get all integrations
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const integrations = await prisma.integration.findMany({
    where: {
      organizationId: req.user!.organizationId,
    },
    select: {
      id: true,
      platform: true,
      status: true,
      shopUrl: true,
      lastSyncAt: true,
      syncError: true,
      createdAt: true,
    },
  });

  res.json(integrations);
}));

// Connect integration
router.post('/connect', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { platform, credentials, shopUrl } = req.body;

  const validPlatforms = ['shopify', 'woocommerce', 'magento', 'wix', 'squarespace'];
  if (!validPlatforms.includes(platform)) {
    throw new AppError('Invalid platform', 400);
  }

  // Check if already connected
  const existing = await prisma.integration.findUnique({
    where: {
      organizationId_platform: {
        organizationId: req.user!.organizationId,
        platform,
      },
    },
  });

  if (existing) {
    throw new AppError('Integration already exists', 400);
  }

  // In production: validate credentials with the platform API
  // For now, just store them

  const integration = await prisma.integration.create({
    data: {
      organizationId: req.user!.organizationId,
      platform,
      credentials, // Should be encrypted in production
      shopUrl,
      status: 'CONNECTED',
    },
    select: {
      id: true,
      platform: true,
      status: true,
      shopUrl: true,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: req.user!.organizationId,
      userId: req.user!.id,
      action: 'integration_connected',
      entityType: 'integration',
      entityId: integration.id,
      details: { platform },
    },
  });

  res.status(201).json(integration);
}));

// Sync integration (import products)
router.post('/:id/sync', asyncHandler(async (req: AuthRequest, res: Response) => {
  const integration = await prisma.integration.findFirst({
    where: {
      id: req.params.id,
      organizationId: req.user!.organizationId,
    },
  });

  if (!integration) {
    throw new AppError('Integration not found', 404);
  }

  if (integration.status !== 'CONNECTED') {
    throw new AppError('Integration is not connected', 400);
  }

  // Update status to syncing
  await prisma.integration.update({
    where: { id: integration.id },
    data: { status: 'SYNCING' },
  });

  try {
    // In production: call the actual platform API
    // Mock import for demo
    const mockProducts = generateMockProducts(integration.platform);

    const created = await prisma.product.createMany({
      data: mockProducts.map(p => ({
        organizationId: req.user!.organizationId,
        externalId: p.externalId,
        name: p.name,
        description: p.description,
        currentPrice: p.currentPrice,
        category: p.category,
        sku: p.sku,
        imageUrl: p.imageUrl,
        source: integration.platform,
      })),
      skipDuplicates: true,
    });

    // Update integration
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        status: 'CONNECTED',
        lastSyncAt: new Date(),
        syncError: null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId: req.user!.organizationId,
        userId: req.user!.id,
        action: 'integration_sync',
        entityType: 'integration',
        entityId: integration.id,
        details: { platform: integration.platform, productsImported: created.count },
      },
    });

    res.json({
      message: 'Sync completed',
      productsImported: created.count,
    });
  } catch (error) {
    // Update with error
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        status: 'ERROR',
        syncError: error instanceof Error ? error.message : 'Sync failed',
      },
    });

    throw new AppError('Sync failed', 500);
  }
}));

// Disconnect integration
router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const integration = await prisma.integration.findFirst({
    where: {
      id: req.params.id,
      organizationId: req.user!.organizationId,
    },
  });

  if (!integration) {
    throw new AppError('Integration not found', 404);
  }

  await prisma.integration.delete({
    where: { id: integration.id },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: req.user!.organizationId,
      userId: req.user!.id,
      action: 'integration_disconnected',
      entityType: 'integration',
      entityId: integration.id,
      details: { platform: integration.platform },
    },
  });

  res.json({ message: 'Integration disconnected' });
}));

// Mock product generator for demo
function generateMockProducts(platform: string) {
  const products = [
    { name: 'Classic T-Shirt', currentPrice: 299, category: 'Kläder' },
    { name: 'Premium Hoodie', currentPrice: 599, category: 'Kläder' },
    { name: 'Running Shoes', currentPrice: 899, category: 'Skor' },
    { name: 'Leather Wallet', currentPrice: 449, category: 'Accessoarer' },
    { name: 'Wireless Earbuds', currentPrice: 1299, category: 'Elektronik' },
  ];

  return products.map((p, i) => ({
    externalId: `${platform}-${i + 1}`,
    name: p.name,
    description: `${p.name} imported from ${platform}`,
    currentPrice: p.currentPrice,
    category: p.category,
    sku: `${platform.toUpperCase()}-${1000 + i}`,
    imageUrl: `https://via.placeholder.com/300?text=${encodeURIComponent(p.name)}`,
  }));
}

export default router;

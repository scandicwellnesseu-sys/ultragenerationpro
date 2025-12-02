// Product Routes
import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

// Get all products
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status, source, search, page = '1', limit = '20' } = req.query;
  
  const where: any = {
    organizationId: req.user!.organizationId,
  };

  if (status) where.status = status;
  if (source) where.source = source;
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { sku: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        priceSuggestions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    products,
    pagination: {
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      pages: Math.ceil(total / parseInt(limit as string)),
    },
  });
}));

// Get single product
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await prisma.product.findFirst({
    where: {
      id: req.params.id,
      organizationId: req.user!.organizationId,
    },
    include: {
      priceSuggestions: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.json(product);
}));

// Create product
router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description, currentPrice, costPrice, category, sku, imageUrl, source } = req.body;

  if (!name || currentPrice === undefined) {
    throw new AppError('Name and currentPrice are required', 400);
  }

  const product = await prisma.product.create({
    data: {
      organizationId: req.user!.organizationId,
      name,
      description,
      currentPrice: parseFloat(currentPrice),
      costPrice: costPrice ? parseFloat(costPrice) : null,
      category,
      sku,
      imageUrl,
      source: source || 'manual',
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: req.user!.organizationId,
      userId: req.user!.id,
      action: 'product_created',
      entityType: 'product',
      entityId: product.id,
      details: { name, currentPrice },
    },
  });

  res.status(201).json(product);
}));

// Update product price
router.patch('/:id/price', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { price } = req.body;

  if (price === undefined) {
    throw new AppError('Price is required', 400);
  }

  const product = await prisma.product.findFirst({
    where: {
      id: req.params.id,
      organizationId: req.user!.organizationId,
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const oldPrice = product.currentPrice;

  const updatedProduct = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      currentPrice: parseFloat(price),
      lastPriceUpdate: new Date(),
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: req.user!.organizationId,
      userId: req.user!.id,
      action: 'price_change',
      entityType: 'product',
      entityId: product.id,
      details: {
        productName: product.name,
        oldPrice,
        newPrice: parseFloat(price),
      },
    },
  });

  res.json(updatedProduct);
}));

// Approve price suggestion
router.post('/:id/approve', asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await prisma.product.findFirst({
    where: {
      id: req.params.id,
      organizationId: req.user!.organizationId,
    },
    include: {
      priceSuggestions: {
        where: { applied: false },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const suggestion = product.priceSuggestions[0];
  if (!suggestion) {
    throw new AppError('No pending price suggestion', 400);
  }

  // Apply the suggestion
  await prisma.$transaction([
    prisma.product.update({
      where: { id: product.id },
      data: {
        currentPrice: suggestion.suggestedPrice,
        status: 'APPROVED',
        lastPriceUpdate: new Date(),
      },
    }),
    prisma.priceSuggestion.update({
      where: { id: suggestion.id },
      data: {
        applied: true,
        appliedAt: new Date(),
      },
    }),
    prisma.activityLog.create({
      data: {
        organizationId: req.user!.organizationId,
        userId: req.user!.id,
        action: 'price_approved',
        entityType: 'product',
        entityId: product.id,
        details: {
          productName: product.name,
          oldPrice: product.currentPrice,
          newPrice: suggestion.suggestedPrice,
        },
      },
    }),
  ]);

  res.json({ message: 'Price approved', newPrice: suggestion.suggestedPrice });
}));

// Delete product
router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await prisma.product.findFirst({
    where: {
      id: req.params.id,
      organizationId: req.user!.organizationId,
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  await prisma.product.delete({
    where: { id: req.params.id },
  });

  res.json({ message: 'Product deleted' });
}));

// Bulk import products
router.post('/import', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { products } = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    throw new AppError('Products array is required', 400);
  }

  const created = await prisma.product.createMany({
    data: products.map((p: any) => ({
      organizationId: req.user!.organizationId,
      name: p.name,
      description: p.description,
      currentPrice: parseFloat(p.currentPrice),
      costPrice: p.costPrice ? parseFloat(p.costPrice) : null,
      category: p.category,
      sku: p.sku,
      imageUrl: p.imageUrl,
      externalId: p.externalId,
      source: p.source || 'import',
    })),
    skipDuplicates: true,
  });

  res.status(201).json({
    message: `${created.count} products imported`,
    count: created.count,
  });
}));

export default router;

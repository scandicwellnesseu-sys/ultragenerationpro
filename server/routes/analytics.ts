// Analytics Routes
import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Get analytics overview
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { period = 'week' } = req.query;

  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'week':
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const orgId = req.user!.organizationId;

  // Get product stats
  const [
    totalProducts,
    approvedProducts,
    pendingProducts,
    recentPriceChanges,
    topProducts,
  ] = await Promise.all([
    prisma.product.count({ where: { organizationId: orgId } }),
    prisma.product.count({ where: { organizationId: orgId, status: 'APPROVED' } }),
    prisma.product.count({ where: { organizationId: orgId, status: 'PENDING' } }),
    prisma.activityLog.count({
      where: {
        organizationId: orgId,
        action: 'price_change',
        createdAt: { gte: startDate },
      },
    }),
    prisma.product.findMany({
      where: {
        organizationId: orgId,
        suggestedPrice: { not: null },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        currentPrice: true,
        suggestedPrice: true,
      },
    }),
  ]);

  // Calculate revenue impact (mock calculation)
  const revenueImpact = topProducts.reduce((acc: number, p: typeof topProducts[0]) => {
    if (p.suggestedPrice && p.suggestedPrice > p.currentPrice) {
      return acc + (p.suggestedPrice - p.currentPrice) * 10; // Assume 10 sales
    }
    return acc;
  }, 0);

  // Mock traffic data (in production: integrate with Google Analytics)
  const trafficData = {
    visitors: Math.floor(Math.random() * 1000) + 500,
    pageViews: Math.floor(Math.random() * 5000) + 2000,
    bounceRate: (Math.random() * 30 + 30).toFixed(1),
    avgSessionDuration: Math.floor(Math.random() * 180) + 60,
  };

  // Mock conversion data
  const conversionData = {
    rate: (Math.random() * 3 + 1).toFixed(2),
    orders: Math.floor(Math.random() * 50) + 10,
    revenue: Math.floor(Math.random() * 50000) + 10000,
    aov: Math.floor(Math.random() * 500) + 200,
  };

  res.json({
    period,
    products: {
      total: totalProducts,
      approved: approvedProducts,
      pending: pendingProducts,
      priceChanges: recentPriceChanges,
    },
    traffic: trafficData,
    conversion: conversionData,
    revenueImpact,
    topProducts: topProducts.map((p: typeof topProducts[0]) => ({
      name: p.name,
      currentPrice: p.currentPrice,
      suggestedPrice: p.suggestedPrice,
      priceChange: p.suggestedPrice 
        ? ((p.suggestedPrice - p.currentPrice) / p.currentPrice * 100).toFixed(1)
        : 0,
    })),
  });
}));

// Get price optimization stats
router.get('/price-optimization', asyncHandler(async (req: AuthRequest, res: Response) => {
  const orgId = req.user!.organizationId;

  const suggestions = await prisma.priceSuggestion.findMany({
    where: {
      product: {
        organizationId: orgId,
      },
    },
    include: {
      product: {
        select: {
          name: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  type SuggestionType = typeof suggestions[0];
  const stats = {
    totalSuggestions: suggestions.length,
    applied: suggestions.filter((s: SuggestionType) => s.applied).length,
    pending: suggestions.filter((s: SuggestionType) => !s.applied).length,
    avgConfidence: suggestions.length > 0
      ? (suggestions.reduce((acc: number, s: SuggestionType) => acc + s.confidence, 0) / suggestions.length * 100).toFixed(1)
      : 0,
    avgPriceIncrease: suggestions.length > 0
      ? (suggestions.reduce((acc: number, s: SuggestionType) => {
          const diff = (s.suggestedPrice - s.currentPrice) / s.currentPrice * 100;
          return acc + diff;
        }, 0) / suggestions.length).toFixed(1)
      : 0,
  };

  res.json({
    stats,
    recentSuggestions: suggestions.slice(0, 10).map((s: SuggestionType) => ({
      id: s.id,
      productName: s.product.name,
      category: s.product.category,
      currentPrice: s.currentPrice,
      suggestedPrice: s.suggestedPrice,
      confidence: s.confidence,
      applied: s.applied,
      createdAt: s.createdAt,
    })),
  });
}));

export default router;

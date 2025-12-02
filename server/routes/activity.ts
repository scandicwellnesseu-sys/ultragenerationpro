// Activity Log Routes
import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Get activity log
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { 
    action, 
    userId, 
    entityType,
    page = '1', 
    limit = '50',
    startDate,
    endDate,
  } = req.query;

  const where: any = {
    organizationId: req.user!.organizationId,
  };

  if (action) where.action = action;
  if (userId) where.userId = userId;
  if (entityType) where.entityType = entityType;
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate as string);
    if (endDate) where.createdAt.lte = new Date(endDate as string);
  }

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
    }),
    prisma.activityLog.count({ where }),
  ]);

  res.json({
    logs: logs.map((log: typeof logs[0]) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      details: log.details,
      user: log.user,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt,
    })),
    pagination: {
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      pages: Math.ceil(total / parseInt(limit as string)),
    },
  });
}));

// Get activity summary
router.get('/summary', asyncHandler(async (req: AuthRequest, res: Response) => {
  const orgId = req.user!.organizationId;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [actionCounts, dailyCounts] = await Promise.all([
    prisma.activityLog.groupBy({
      by: ['action'],
      where: {
        organizationId: orgId,
        createdAt: { gte: sevenDaysAgo },
      },
      _count: true,
    }),
    prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM "ActivityLog"
      WHERE organization_id = ${orgId}
        AND created_at >= ${sevenDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    ` as Promise<{ date: Date; count: bigint }[]>,
  ]);

  res.json({
    byAction: actionCounts.map((a: typeof actionCounts[0]) => ({
      action: a.action,
      count: a._count,
    })),
    byDay: dailyCounts.map(d => ({
      date: d.date,
      count: Number(d.count),
    })),
  });
}));

export default router;

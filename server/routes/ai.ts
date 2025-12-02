// AI Routes - Price suggestions using Gemini
import { Router, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Generate price suggestion for a product
router.post('/price-suggestion', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId } = req.body;

  // Check credits
  const subscription = await prisma.subscription.findUnique({
    where: { organizationId: req.user!.organizationId },
  });

  if (!subscription || subscription.creditsBalance < 1) {
    throw new AppError('Insufficient credits', 402);
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      organizationId: req.user!.organizationId,
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Generate suggestion using AI
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
    You are a pricing expert. Analyze this product and suggest an optimal price.
    
    Product: ${product.name}
    Category: ${product.category || 'Unknown'}
    Current Price: ${product.currentPrice} SEK
    Cost Price: ${product.costPrice || 'Unknown'} SEK
    Description: ${product.description || 'No description'}
    
    Consider:
    1. Market positioning
    2. Profit margins
    3. Competitive pricing
    4. Perceived value
    
    Respond in JSON format only:
    {
      "suggestedPrice": number,
      "confidence": number (0-1),
      "reasoning": "string explaining the suggestion"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response');
    }

    const suggestion = JSON.parse(jsonMatch[0]);

    // Save suggestion
    const priceSuggestion = await prisma.priceSuggestion.create({
      data: {
        productId: product.id,
        currentPrice: product.currentPrice,
        suggestedPrice: suggestion.suggestedPrice,
        confidence: suggestion.confidence,
        reasoning: suggestion.reasoning,
      },
    });

    // Update product
    await prisma.product.update({
      where: { id: product.id },
      data: {
        suggestedPrice: suggestion.suggestedPrice,
        status: 'PENDING',
      },
    });

    // Deduct credit
    await prisma.subscription.update({
      where: { organizationId: req.user!.organizationId },
      data: {
        creditsBalance: { decrement: 1 },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId: req.user!.organizationId,
        userId: req.user!.id,
        action: 'ai_price_suggestion',
        entityType: 'product',
        entityId: product.id,
        details: {
          productName: product.name,
          currentPrice: product.currentPrice,
          suggestedPrice: suggestion.suggestedPrice,
        },
      },
    });

    res.json({
      id: priceSuggestion.id,
      productId: product.id,
      currentPrice: product.currentPrice,
      suggestedPrice: suggestion.suggestedPrice,
      confidence: suggestion.confidence,
      reasoning: suggestion.reasoning,
    });
  } catch (error) {
    console.error('AI Error:', error);
    throw new AppError('Failed to generate price suggestion', 500);
  }
}));

// Bulk price suggestions
router.post('/bulk-price-suggestions', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productIds } = req.body;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new AppError('Product IDs array required', 400);
  }

  // Check credits
  const subscription = await prisma.subscription.findUnique({
    where: { organizationId: req.user!.organizationId },
  });

  if (!subscription || subscription.creditsBalance < productIds.length) {
    throw new AppError(`Insufficient credits. Need ${productIds.length}, have ${subscription?.creditsBalance || 0}`, 402);
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      organizationId: req.user!.organizationId,
    },
  });

  if (products.length === 0) {
    throw new AppError('No valid products found', 404);
  }

  // Process in batches
  const suggestions = [];
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  for (const product of products) {
    try {
      const prompt = `
        Analyze this product and suggest optimal price. Respond ONLY with JSON.
        Product: ${product.name}
        Category: ${product.category || 'Unknown'}
        Current Price: ${product.currentPrice} SEK
        
        Response format: {"suggestedPrice": number, "confidence": number, "reasoning": "brief explanation"}
      `;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const suggestion = JSON.parse(jsonMatch[0]);
        
        const saved = await prisma.priceSuggestion.create({
          data: {
            productId: product.id,
            currentPrice: product.currentPrice,
            suggestedPrice: suggestion.suggestedPrice,
            confidence: suggestion.confidence || 0.8,
            reasoning: suggestion.reasoning,
          },
        });

        await prisma.product.update({
          where: { id: product.id },
          data: {
            suggestedPrice: suggestion.suggestedPrice,
            status: 'PENDING',
          },
        });

        suggestions.push({
          productId: product.id,
          productName: product.name,
          ...suggestion,
        });
      }
    } catch (error) {
      console.error(`Error for product ${product.id}:`, error);
      suggestions.push({
        productId: product.id,
        productName: product.name,
        error: 'Failed to generate suggestion',
      });
    }
  }

  // Deduct credits
  const successCount = suggestions.filter(s => !s.error).length;
  await prisma.subscription.update({
    where: { organizationId: req.user!.organizationId },
    data: {
      creditsBalance: { decrement: successCount },
    },
  });

  res.json({
    processed: products.length,
    successful: successCount,
    suggestions,
  });
}));

// Auto-approve scheduled job (called by cron)
router.post('/auto-approve', asyncHandler(async (req: AuthRequest, res: Response) => {
  // Only allow from internal calls or admin
  const apiSecret = req.headers['x-api-secret'];
  if (apiSecret !== process.env.INTERNAL_API_SECRET && req.user?.role !== 'SUPER_ADMIN') {
    throw new AppError('Unauthorized', 403);
  }

  // Find products with auto-approve enabled and pending suggestions
  const products = await prisma.product.findMany({
    where: {
      autoApprove: true,
      status: 'PENDING',
      suggestedPrice: { not: null },
    },
    include: {
      priceSuggestions: {
        where: { applied: false },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  let approved = 0;

  for (const product of products) {
    const suggestion = product.priceSuggestions[0];
    if (suggestion && suggestion.confidence >= 0.7) {
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
            organizationId: product.organizationId,
            action: 'auto_price_approved',
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
      approved++;
    }
  }

  res.json({
    message: `Auto-approved ${approved} price changes`,
    approved,
  });
}));

export default router;

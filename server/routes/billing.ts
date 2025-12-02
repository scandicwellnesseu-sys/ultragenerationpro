// Billing Routes - Stripe integration
import { Router, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Plans configuration
const PLANS = {
  starter: {
    name: 'Starter',
    credits: 100,
    price: 99,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
  },
  pro: {
    name: 'Pro',
    credits: 500,
    price: 299,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
  },
  enterprise: {
    name: 'Enterprise',
    credits: 2000,
    price: 999,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  },
};

// Credit packs
const CREDIT_PACKS = {
  small: { credits: 50, price: 49 },
  medium: { credits: 150, price: 129 },
  large: { credits: 500, price: 399 },
};

// Get current subscription
router.get('/subscription', asyncHandler(async (req: AuthRequest, res: Response) => {
  const subscription = await prisma.subscription.findUnique({
    where: { organizationId: req.user!.organizationId },
  });

  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  res.json({
    plan: subscription.plan,
    status: subscription.status,
    credits: subscription.creditsBalance,
    expiresAt: subscription.expiresAt,
  });
}));

// Create checkout session for subscription
router.post('/checkout', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { plan } = req.body;

  if (!plan || !PLANS[plan as keyof typeof PLANS]) {
    throw new AppError('Invalid plan', 400);
  }

  const selectedPlan = PLANS[plan as keyof typeof PLANS];

  // Get or create Stripe customer
  let subscription = await prisma.subscription.findUnique({
    where: { organizationId: req.user!.organizationId },
  });

  let customerId = subscription?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: req.user!.email,
      metadata: {
        organizationId: req.user!.organizationId,
      },
    });
    customerId = customer.id;

    await prisma.subscription.update({
      where: { organizationId: req.user!.organizationId },
      data: { stripeCustomerId: customerId },
    });
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: selectedPlan.priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/billing?success=true`,
    cancel_url: `${process.env.FRONTEND_URL}/billing?canceled=true`,
    metadata: {
      organizationId: req.user!.organizationId,
      plan,
    },
  });

  res.json({ url: session.url, sessionId: session.id });
}));

// Buy credits (one-time purchase)
router.post('/buy-credits', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { pack } = req.body;

  if (!pack || !CREDIT_PACKS[pack as keyof typeof CREDIT_PACKS]) {
    throw new AppError('Invalid credit pack', 400);
  }

  const selectedPack = CREDIT_PACKS[pack as keyof typeof CREDIT_PACKS];

  let subscription = await prisma.subscription.findUnique({
    where: { organizationId: req.user!.organizationId },
  });

  let customerId = subscription?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: req.user!.email,
    });
    customerId = customer.id;

    await prisma.subscription.update({
      where: { organizationId: req.user!.organizationId },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'sek',
          product_data: {
            name: `${selectedPack.credits} Credits`,
          },
          unit_amount: selectedPack.price * 100,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/billing?credits=success`,
    cancel_url: `${process.env.FRONTEND_URL}/billing?canceled=true`,
    metadata: {
      organizationId: req.user!.organizationId,
      type: 'credits',
      credits: selectedPack.credits.toString(),
    },
  });

  res.json({ url: session.url, sessionId: session.id });
}));

// Get billing history
router.get('/history', asyncHandler(async (req: AuthRequest, res: Response) => {
  const subscription = await prisma.subscription.findUnique({
    where: { organizationId: req.user!.organizationId },
  });

  if (!subscription?.stripeCustomerId) {
    return res.json({ invoices: [] });
  }

  const invoices = await stripe.invoices.list({
    customer: subscription.stripeCustomerId,
    limit: 10,
  });

  res.json({
    invoices: invoices.data.map(inv => ({
      id: inv.id,
      amount: inv.amount_paid / 100,
      currency: inv.currency,
      status: inv.status,
      date: new Date(inv.created * 1000),
      pdfUrl: inv.invoice_pdf,
    })),
  });
}));

// Cancel subscription
router.post('/cancel', asyncHandler(async (req: AuthRequest, res: Response) => {
  const subscription = await prisma.subscription.findUnique({
    where: { organizationId: req.user!.organizationId },
  });

  if (!subscription?.stripeSubscriptionId) {
    throw new AppError('No active subscription', 400);
  }

  await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

  await prisma.subscription.update({
    where: { organizationId: req.user!.organizationId },
    data: {
      status: 'canceled',
      stripeSubscriptionId: null,
    },
  });

  res.json({ message: 'Subscription canceled' });
}));

// Stripe webhook handler (should be at a public route, but included here for reference)
router.post('/webhook', asyncHandler(async (req: AuthRequest, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    throw new AppError('Invalid webhook signature', 400);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.organizationId;

      if (session.metadata?.type === 'credits') {
        // Add credits
        const credits = parseInt(session.metadata.credits);
        await prisma.subscription.update({
          where: { organizationId: orgId },
          data: {
            creditsBalance: { increment: credits },
          },
        });
      } else if (session.metadata?.plan) {
        // Update subscription plan
        const plan = PLANS[session.metadata.plan as keyof typeof PLANS];
        await prisma.subscription.update({
          where: { organizationId: orgId },
          data: {
            plan: session.metadata.plan,
            status: 'active',
            creditsBalance: { increment: plan.credits },
            stripeSubscriptionId: session.subscription as string,
          },
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: 'canceled',
          stripeSubscriptionId: null,
        },
      });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data: { status: 'past_due' },
        });
      }
      break;
    }
  }

  res.json({ received: true });
}));

export default router;

// Auth Routes - Login, Register, Password Reset
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { sendEmail, emailTemplates } from '../../functions/sendEmail';

const router = Router();

// Register
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, organizationName } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('User already exists', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create organization and user
  const organization = await prisma.organization.create({
    data: {
      name: organizationName || `${name}'s Organization`,
      users: {
        create: {
          email,
          hashedPassword,
          name,
          role: 'ADMIN', // First user is admin
        },
      },
      subscription: {
        create: {
          plan: 'free',
          creditsBalance: 10,
        },
      },
    },
    include: {
      users: true,
      subscription: true,
    },
  });

  const user = organization.users[0];

  // Generate token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  // Send welcome email
  const welcomeEmail = emailTemplates.welcome(email, name || 'there');
  await sendEmail(welcomeEmail);

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: organization.id,
      userId: user.id,
      action: 'user_registered',
      entityType: 'user',
      entityId: user.id,
      details: { email },
    },
  });

  res.status(201).json({
    message: 'User created successfully',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    organization: {
      id: organization.id,
      name: organization.name,
    },
    credits: organization.subscription?.creditsBalance || 10,
  });
}));

// Login
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      organization: {
        include: {
          subscription: true,
        },
      },
    },
  });

  if (!user || !user.hashedPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check password
  const isValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  // Log activity
  await prisma.activityLog.create({
    data: {
      organizationId: user.organizationId,
      userId: user.id,
      action: 'login',
      entityType: 'user',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    organization: {
      id: user.organization.id,
      name: user.organization.name,
    },
    credits: user.organization.subscription?.creditsBalance || 0,
  });
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError('Token required', 400);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    const newToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({ token: newToken });
  } catch (error) {
    throw new AppError('Invalid token', 401);
  }
}));

// Request password reset
router.post('/forgot-password', asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Always return success to prevent email enumeration
  res.json({ message: 'If the email exists, a reset link has been sent' });

  if (user) {
    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Send email (in production, include actual reset link)
    await sendEmail({
      to: email,
      subject: 'Password Reset',
      text: `Click here to reset your password: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
    });
  }
}));

export default router;

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function grantCreditsToUser(email: string, credits: number) {
  // Find user and their organization
  const user = await prisma.user.findUnique({ where: { email }, include: { organization: true } });
  if (!user || !user.organizationId) throw new Error('User or organization not found');
  // Update credits balance in Subscription
  const sub = await prisma.subscription.findUnique({ where: { organizationId: user.organizationId } });
  if (!sub) throw new Error('Subscription not found');
  await prisma.subscription.update({
    where: { id: sub.id },
    data: { creditsBalance: { increment: credits } },
  });
  return true;
}

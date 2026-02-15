import { NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
        where: {
            authId: user.id
        },
        select: {id: true}
    })

    const { orderId, subject } = await request.json();

    // Check if conversation exists
    if (orderId) {
      const existing = await prisma.conversation.findFirst({
        where: { userId: dbUser.id, orderId },
      });
      if (existing) return NextResponse.json({ conversation: existing });
    }

    // Create new
    const conversation = await prisma.conversation.create({
      data: {
        userId: dbUser.id,
        orderId: orderId || null,
        subject: subject || (orderId ? `Order #${orderId.slice(-8).toUpperCase()}` : 'General Inquiry'),
        priority: orderId ? 'HIGH' : 'NORMAL',
      },
      include: {
        order: true,
        user: { select: { id: true, name: true, email: true, imageUrl: true } },
      },
    });

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
        where: {
            authId: user.id
        },
        select: {id: true, role: true}
    })

    const isAdmin = dbUser.role === 'ADMIN';

    const conversations = await prisma.conversation.findMany({
      where: isAdmin ? {} : { userId: dbUser.id },
      include: {
        user: { select: { id: true, name: true, email: true, imageUrl: true } },
        order: { select: { id: true, total: true, status: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderType: isAdmin ? 'USER' : 'ADMIN',
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
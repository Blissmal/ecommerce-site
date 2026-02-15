import { NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const stackUser = await stackServerApp.getUser();
    if (!stackUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get database user
    const dbUser = await prisma.user.findUnique({
      where: { authId: stackUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const isAdmin = dbUser.role === 'ADMIN';

    // Verify access
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { 
        user: {
          select: { id: true, name: true, email: true, imageUrl: true }
        }, 
        order: true 
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!isAdmin && conversation.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      include: {
        sender: {
          select: { id: true, name: true, imageUrl: true },
        },
        attachments: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        isRead: false,
        senderType: isAdmin ? 'USER' : 'ADMIN',
      },
      data: { 
        isRead: true, 
        readAt: new Date() 
      },
    });

    return NextResponse.json({ messages, conversation });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { prisma } from '../../../../../../lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const isAdmin = user.clientMetadata?.role === 'ADMIN';

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { user: true, order: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!isAdmin && conversation.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    // Mark as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        isRead: false,
        senderType: isAdmin ? 'USER' : 'ADMIN',
      },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({ messages, conversation });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
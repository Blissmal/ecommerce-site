import { NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: Request) {
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

    const { conversationId, content, messageType = 'TEXT' } = await request.json();

    if (!conversationId || !content?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify conversation access
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const isAdmin = dbUser.role === 'ADMIN';
    if (!isAdmin && conversation.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: dbUser.id,  // Use database user ID
        senderType: isAdmin ? 'ADMIN' : 'USER',
        content: content.trim(),
        messageType,
      },
      include: {
        sender: {
          select: { id: true, name: true, imageUrl: true },
        },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
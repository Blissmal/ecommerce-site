import { NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { prisma } from '../../../../../lib/prisma';

export async function GET(request: Request) {
  try {
    const stackUser = await stackServerApp.getUser();
    if (!stackUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
        where: {authId: stackUser.id},
        select: {id: true, role: true}
    })

    // Check if user is admin
    const isAdmin = dbUser.role === 'ADMIN';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const templates = await prisma.messageTemplate.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { title: 'asc' }
      ],
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const stackUser = await stackServerApp.getUser();
    if (!stackUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
        where: {authId: stackUser.id},
        select: {id: true, role: true}
    })

    // Check if user is admin
    const isAdmin = dbUser.role === 'ADMIN';

    // Check if user is admin
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { title, content, category } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const template = await prisma.messageTemplate.create({
      data: {
        title,
        content,
        category: category || null,
        isActive: true,
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
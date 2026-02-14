import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, imageUrl } = await request.json();

    if (!userId || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing userId or imageUrl' },
        { status: 400 }
      );
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: {
        authId: userId
      },
      data: {
        imageUrl: imageUrl
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user image' },
      { status: 500 }
    );
  }
}
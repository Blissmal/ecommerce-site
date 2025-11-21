// For Next.js App Router: app/api/update-billing/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { stackServerApp } from '@/stack';

export async function POST(request) {
  try {
    // Get the current user session
    const AuthUser = await stackServerApp.getUser();
    
    if (!AuthUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    const { username, country, address, town, phone } = data;
    
    if (!username || !country || !address || !town || !phone ) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Convert country value to country name
    const countryMap = {
      '0': 'Kenya',
      '1': 'Uganda',
      '2': 'Tanzania'
    };
    const user = await prisma.user.findUnique({
      where: { authId: AuthUser.id },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const billingData = {
      username,
      country: countryMap[country] || 'Kenya',
      address,
      town,
      phone,
    };

    let result;
    await prisma.user.update({
      where: { id: user.id },
        data: {
            name: billingData.username,
            address: billingData.address,
            phone: billingData.phone,
            country: billingData.country,
            town: billingData.town,
        },
    })

    return NextResponse.json({
      success: true,
      message: 'Billing details updated successfully',
      data: result
    });

  } catch (error) {
    console.error('Error updating billing details:', error);
    
    // Handle Prisma specific errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
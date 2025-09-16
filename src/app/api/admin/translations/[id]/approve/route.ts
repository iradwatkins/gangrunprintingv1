import { type NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Update translation approval status
    const translation = await prisma.translation.update({
      where: { id },
      data: {
        isApproved: true,
        translatedBy: 'admin', // TODO: Get from auth context
      },
    });

    return NextResponse.json(translation);
  } catch (error) {
    console.error('Error approving translation:', error);
    return NextResponse.json(
      { error: 'Failed to approve translation' },
      { status: 500 }
    );
  }
}
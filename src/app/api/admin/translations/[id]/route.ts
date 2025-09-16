import { type NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { key, namespace, locale, value, context } = body;

    if (!key || !locale || !value) {
      return NextResponse.json(
        { error: 'Key, locale, and value are required' },
        { status: 400 }
      );
    }

    // Update translation
    const translation = await prisma.translation.update({
      where: { id },
      data: {
        key,
        namespace,
        locale,
        value,
        context,
        isApproved: true, // Manual updates are auto-approved
        translatedBy: 'admin', // TODO: Get from auth context
      },
    });

    return NextResponse.json(translation);
  } catch (error) {
    console.error('Error updating translation:', error);
    return NextResponse.json(
      { error: 'Failed to update translation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.translation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting translation:', error);
    return NextResponse.json(
      { error: 'Failed to delete translation' },
      { status: 500 }
    );
  }
}
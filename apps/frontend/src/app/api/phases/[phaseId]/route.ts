import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { phaseId: string } }
) {
  try {
    const { phaseId } = params;
    if (!phaseId) {
      return NextResponse.json({ error: 'Phase ID is required' }, { status: 400 });
    }
    const phase = await prisma.projectPhase.findUnique({
      where: { id: phaseId },
      include: {
        project: {
          include: {
            client: {
              select: { id: true, firstName: true, lastName: true, email: true, phone: true }
            }
          }
        },
        variants: {
          include: {
            rooms: {
              include: {
                products: {
                  include: { product: true }
                }
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    if (!phase) {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
    }
    return NextResponse.json(phase);
  } catch (error) {
    console.error('Error fetching phase:', error);
    return NextResponse.json({ error: 'Failed to fetch phase' }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/phases/{phaseId}/offers
export async function GET(
  request: NextRequest,
  { params }: { params: { phaseId: string } }
) {
  try {
    const { phaseId } = params;
    if (!phaseId) {
      return NextResponse.json({ error: 'Phase ID is required' }, { status: 400 });
    }
    const offers = await prisma.offer.findMany({
      where: { phaseId },
      include: {
        project: { select: { id: true, name: true } },
        client: { select: { id: true, firstName: true, lastName: true } },
        variants: {
          include: {
            rooms: {
              include: { products: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    const offerSummaries = offers.map(offer => {
      const totalValue = offer.variants?.reduce((sum, variant) => {
        const variantTotal = variant.rooms?.reduce((roomSum, room) => {
          return roomSum + (room.products?.reduce((prodSum, prod) => {
            return prodSum + (prod.quantity * prod.unitPrice * (1 - prod.discountPercent / 100));
          }, 0) || 0);
        }, 0) || 0;
        return sum + variantTotal;
      }, 0) || 0;
      return {
        id: offer.id,
        offerNumber: offer.offerNumber,
        subject: offer.subject || `Оферта за ${offer.project?.name}`,
        status: offer.status,
        createdAt: offer.createdAt.toISOString(),
        updatedAt: offer.updatedAt.toISOString(),
        validUntil: offer.validUntil?.toISOString(),
        projectId: offer.projectId,
        projectName: offer.project?.name,
        clientId: offer.clientId,
        clientName: `${offer.client?.firstName || ''} ${offer.client?.lastName || ''}`.trim(),
        totalValue: Math.round(totalValue * 100) / 100,
        variantCount: offer.variants?.length || 0
      };
    });
    return NextResponse.json(offerSummaries);
  } catch (error) {
    console.error('Error fetching phase offers:', error);
    return NextResponse.json({ error: 'Failed to fetch phase offers' }, { status: 500 });
  }
}

// POST /api/phases/{phaseId}/offers
export async function POST(
  request: NextRequest,
  { params }: { params: { phaseId: string } }
) {
  try {
    const { phaseId } = params;
    const body = await request.json();
    if (!phaseId) {
      return NextResponse.json({ error: 'Phase ID is required' }, { status: 400 });
    }
    const phase = await prisma.projectPhase.findUnique({
      where: { id: phaseId },
      include: {
        project: { include: { client: true } }
      }
    });
    if (!phase) {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
    }
    const offerCount = await prisma.offer.count({
      where: { projectId: phase.projectId }
    });
    const offerNumber = `OFF-${phase.project.name.substring(0, 3).toUpperCase()}-${Date.now()}-${offerCount + 1}`;
    const offer = await prisma.offer.create({
      data: {
        projectId: phase.projectId,
        phaseId: phaseId,
        clientId: phase.project.clientId,
        offerNumber,
        subject: body.subject || `Оферта за ${phase.project.name} - ${phase.name}`,
        validUntil: body.validUntil ? new Date(body.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: body.status || 'draft',
        conditions: body.conditions || null,
        emailSubject: body.emailSubject || null,
        emailBody: body.emailBody || null
      },
      include: {
        project: true,
        client: true,
        phase: true
      }
    });
    return NextResponse.json(offer);
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
  }
} 
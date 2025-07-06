import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/phases/{phaseId}/variants - get variants for specific phase
export async function GET(
  request: NextRequest,
  { params }: { params: { phaseId: string } }
) {
  try {
    const { phaseId } = params;
    
    console.log('Phase Variants API called with phaseId:', phaseId);
    
    if (!phaseId) {
      return NextResponse.json({ error: 'Phase ID is required' }, { status: 400 });
    }

    // Провери дали фазата съществува
    const phase = await prisma.projectPhase.findUnique({
      where: { id: phaseId },
      select: { id: true, name: true }
    });

    if (!phase) {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
    }

    const variants = await prisma.phaseVariant.findMany({
      where: { phaseId },
      include: {
        rooms: {
          include: {
            products: {
              include: { 
                product: true // select all fields for now
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { variantOrder: 'asc' }
    });

    console.log(`Found ${variants.length} variants for phase ${phaseId}`);
    
    // Transform данните за frontend
    const transformedVariants = variants.map(variant => ({
      id: variant.id,
      name: variant.name,
      description: variant.description,
      variantOrder: variant.variantOrder,
      phaseId: variant.phaseId,
      rooms: (variant.rooms || []).map((room: any) => ({
        id: room.id,
        name: room.name,
        area: Number(room.area),
        wasteFactorPercent: Number(room.wasteFactorPercent ?? 0),
        discountPercent: Number(room.discount ?? 0),
        discountEnabled: room.discountEnabled,
        products: (room.products || []).map((product: any) => ({
          id: product.id,
          name: product.name,
          quantity: Number(product.quantity),
          unitPrice: Number(product.unitPrice),
          discountPercent: Number(product.discount ?? 0),
          totalPrice: Number(product.quantity) * Number(product.unitPrice) * (1 - Number(product.discount ?? 0) / 100),
          product: product.product
        }))
      })),
      totalPrice: (variant.rooms || []).reduce((variantSum: number, room: any) => {
        return variantSum + (room.products || []).reduce((roomSum: number, product: any) => {
          return roomSum + (Number(product.quantity) * Number(product.unitPrice) * (1 - Number(product.discount ?? 0) / 100));
        }, 0);
      }, 0)
    }));

    return NextResponse.json(transformedVariants);

  } catch (error: any) {
    console.error('Error fetching phase variants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variants', details: error.message }, 
      { status: 500 }
    );
  }
} 
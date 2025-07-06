import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/variants?phaseId=xxx - get variants by phase
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phaseId = searchParams.get('phaseId');
    
    console.log('Variants API called with phaseId:', phaseId);
    
    if (!phaseId) {
      return NextResponse.json({ error: 'Phase ID is required' }, { status: 400 });
    }

    const variants = await prisma.phaseVariant.findMany({
      where: { phaseId },
      include: {
        rooms: {
          include: {
            products: {
              include: { 
                product: true
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
    console.error('Error fetching variants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variants', details: error.message }, 
      { status: 500 }
    );
  }
} 
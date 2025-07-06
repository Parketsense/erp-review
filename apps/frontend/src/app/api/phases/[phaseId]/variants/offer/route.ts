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
                product: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    unit: true
                  }
                }
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });
    const variantsForOffer = variants.map(variant => {
      const rooms = variant.rooms.map(room => {
        const products = room.products.map(product => {
          const basePrice = product.quantity * product.unitPrice;
          const discountAmount = basePrice * (product.discountPercent / 100);
          const finalPrice = basePrice - discountAmount;
          return {
            id: product.id,
            name: product.name,
            productName: product.product?.name || product.name,
            productCode: product.product?.code || '',
            quantity: product.quantity,
            unit: product.product?.unit || 'бр.',
            unitPrice: product.unitPrice,
            discountPercent: product.discountPercent,
            basePrice: Math.round(basePrice * 100) / 100,
            discountAmount: Math.round(discountAmount * 100) / 100,
            finalPrice: Math.round(finalPrice * 100) / 100
          };
        });
        const roomTotalPrice = products.reduce((sum, p) => sum + p.finalPrice, 0);
        return {
          id: room.id,
          name: room.name,
          area: room.area,
          wasteFactorPercent: room.wasteFactorPercent,
          discountPercent: room.discountPercent,
          productCount: products.length,
          products,
          totalPrice: Math.round(roomTotalPrice * 100) / 100
        };
      });
      const variantTotalPrice = rooms.reduce((sum, room) => sum + room.totalPrice, 0);
      return {
        id: variant.id,
        name: variant.name,
        description: variant.description,
        sortOrder: variant.sortOrder,
        rooms,
        totalPrice: Math.round(variantTotalPrice * 100) / 100,
        included: false,
        hasProducts: rooms.some(room => room.products.length > 0),
        roomCount: rooms.length,
        productCount: rooms.reduce((sum, room) => sum + room.productCount, 0)
      };
    });
    return NextResponse.json(variantsForOffer);
  } catch (error) {
    console.error('Error fetching variants for offer:', error);
    return NextResponse.json({ error: 'Failed to fetch variants for offer' }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/suppliers - get all suppliers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const search = searchParams.get('search');
    const includeInactive = searchParams.get('includeInactive');

    const whereClause: any = {};
    
    if (active !== null) {
      whereClause.isActive = active === 'true';
    }
    
    if (includeInactive !== 'true') {
      whereClause.isActive = true;
    }
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } }
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { contacts: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(suppliers);
  } catch (error: any) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers', details: error.message }, 
      { status: 500 }
    );
  }
}

// POST /api/suppliers - create new supplier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Creating supplier:', body);
    
    // Валидация
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        { error: 'Supplier name is required' }, 
        { status: 400 }
      );
    }

    // Проверка за duplicate
    const existingSupplier = await prisma.supplier.findFirst({
      where: { name: body.name.trim() }
    });

    if (existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier с това име вече съществува' }, 
        { status: 409 }
      );
    }

    const newSupplier = await prisma.supplier.create({
      data: {
        name: body.name.trim(),
        displayName: body.displayName?.trim() || body.name.trim(),
        code: body.code?.trim() || null,
        website: body.website?.trim() || null,
        description: body.description?.trim() || null,
        address: body.address?.trim() || null,
        contactName: body.contactName?.trim() || null,
        contactEmail: body.contactEmail?.trim() || null,
        contactPhone: body.contactPhone?.trim() || null,
        logoUrl: body.logoUrl?.trim() || null,
        colorCode: body.colorCode?.trim() || "#6c757d",
        discount: body.discount !== undefined ? Number(body.discount) : 0,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true
      },
      include: {
        _count: {
          select: { contacts: true }
        }
      }
    });

    console.log('Supplier created successfully:', newSupplier.id);
    return NextResponse.json(newSupplier, { status: 201 });

  } catch (error: any) {
    console.error('Error creating supplier:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Supplier с това име вече съществува' }, 
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to create supplier',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/suppliers/[id] - get specific supplier
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 });
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        // Include relations ако има
        contacts: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    return NextResponse.json(supplier);
  } catch (error: any) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier', details: error.message }, 
      { status: 500 }
    );
  }
}

// PUT /api/suppliers/[id] - update supplier  
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    console.log('Updating supplier:', id, body);
    
    if (!id) {
      return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 });
    }

    // Валидация на данните
    const requiredFields = ['name'];
    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json(
          { error: `Field '${field}' is required` }, 
          { status: 400 }
        );
      }
    }

    // Проверка дали supplier съществува
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id }
    });

    if (!existingSupplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    // Проверка за duplicate name (ако е различен supplier)
    if (body.name !== existingSupplier.name) {
      const duplicateSupplier = await prisma.supplier.findFirst({
        where: {
          name: body.name,
          id: { not: id }
        }
      });

      if (duplicateSupplier) {
        return NextResponse.json(
          { error: 'Supplier с това име вече съществува' }, 
          { status: 409 }
        );
      }
    }

    // Update supplier с правилните полета от schema-та
    const updatedSupplier = await prisma.supplier.update({
      where: { id },
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
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        updatedAt: new Date()
      },
      include: {
        contacts: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    console.log('Supplier updated successfully:', updatedSupplier.id);
    return NextResponse.json(updatedSupplier);

  } catch (error: any) {
    console.error('Error updating supplier:', error);
    
    // По-detailed error response
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Supplier с това име вече съществува' }, 
        { status: 409 }
      );
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Supplier не е намерен' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to update supplier',
        details: error.message,
        code: error.code 
      }, 
      { status: 500 }
    );
  }
}

// DELETE /api/suppliers/[id] - delete supplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 });
    }

    // Провери дали има свързани продукти (ако има такава връзка)
    // Засега ще пропуснем тази проверка, тъй като Product моделът няма supplierId поле

    // Soft delete or hard delete
    const deletedSupplier = await prisma.supplier.delete({
      where: { id }
    });

    console.log('Supplier deleted successfully:', id);
    return NextResponse.json({ message: 'Supplier deleted successfully' });

  } catch (error: any) {
    console.error('Error deleting supplier:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Supplier не е намерен' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to delete supplier',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/env';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; mediaType: string; filename: string } }
) {
  try {
    const { id: productId, mediaType, filename } = params;

    // Forward the request to the backend
    const response = await fetch(
      `${API_CONFIG.baseUrl}/products/${productId}/media/${mediaType}/${filename}`,
      {
        method: 'DELETE',
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: result.message || 'Delete failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 
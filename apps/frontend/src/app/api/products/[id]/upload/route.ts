import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/env';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const formData = await request.formData();

    // Forward the form data to the backend
    const response = await fetch(`${API_CONFIG.baseUrl}/products/${productId}/upload`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: result.message || 'Upload failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 
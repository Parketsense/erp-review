import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 [DEBUG] Frontend API route called for product type:', params.id);
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
    console.log('🔍 [DEBUG] Backend URL:', backendUrl);
    
    const url = `${backendUrl}/api/product-types/${params.id}/attributes`;
    console.log('🔍 [DEBUG] Full URL:', url);
    
    const res = await fetch(url);
    console.log('🔍 [DEBUG] Backend response status:', res.status);
    
    if (!res.ok) {
      console.log('🔍 [DEBUG] Backend error response:', res.status, res.statusText);
      return NextResponse.json(
        { success: false, message: 'Backend error' },
        { status: res.status }
      );
    }
    
    const data = await res.json();
    console.log('🔍 [DEBUG] Backend data received successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('🔍 [DEBUG] Frontend API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
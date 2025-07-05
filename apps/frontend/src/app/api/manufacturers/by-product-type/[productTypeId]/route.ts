import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { productTypeId: string } }
) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  const res = await fetch(`${backendUrl}/api/manufacturers/by-product-type/${params.productTypeId}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
} 
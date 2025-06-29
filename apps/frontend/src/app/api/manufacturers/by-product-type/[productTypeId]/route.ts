import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { productTypeId: string } }
) {
  const res = await fetch(`http://localhost:4003/api/manufacturers/by-product-type/${params.productTypeId}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
} 
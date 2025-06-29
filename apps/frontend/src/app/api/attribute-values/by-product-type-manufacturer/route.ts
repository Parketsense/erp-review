import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productTypeId = searchParams.get('productTypeId');
  const manufacturerId = searchParams.get('manufacturerId');

  if (!productTypeId || !manufacturerId) {
    return NextResponse.json({
      success: false,
      message: 'productTypeId and manufacturerId are required'
    }, { status: 400 });
  }

  try {
    console.log('🔍 Loading attribute values for:', { productTypeId, manufacturerId });

    // First get all attributes for the product type
    const attributesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4003/api'}/product-types/${productTypeId}/attributes`);
    const attributesData = await attributesResponse.json();

    if (!attributesData.success || !attributesData.data.attributes) {
      return NextResponse.json({
        success: false,
        message: 'No attributes found for product type'
      });
    }

    const attributes = attributesData.data.attributes;
    console.log(`📋 Found ${attributes.length} attributes for product type`);

    // For each attribute, get its values filtered by manufacturer
    const allAttributeValues = [];
    
    for (const attribute of attributes) {
      const valuesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4003/api'}/attribute-values?attributeTypeId=${attribute.id}&manufacturerId=${manufacturerId}`);
      const valuesData = await valuesResponse.json();
      
      if (valuesData.success && valuesData.data) {
        console.log(`📦 Found ${valuesData.data.length} values for attribute ${attribute.nameBg}`);
        allAttributeValues.push(...valuesData.data);
      }
    }

    console.log(`✅ Total attribute values loaded: ${allAttributeValues.length}`);

    return NextResponse.json({
      success: true,
      data: allAttributeValues,
      total: allAttributeValues.length,
      attributesCount: attributes.length
    });

  } catch (error) {
    console.error('❌ Error loading attribute values:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to load attribute values'
    }, { status: 500 });
  }
} 
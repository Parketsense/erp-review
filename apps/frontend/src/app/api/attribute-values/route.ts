export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const attributeTypeId = searchParams.get('attributeTypeId');
    const manufacturerId = searchParams.get('manufacturerId');

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    let url = `${backendUrl}/api/attribute-values`;
    const params = new URLSearchParams();
    
    if (attributeTypeId) {
      params.append('attributeTypeId', attributeTypeId);
    }
    if (manufacturerId) {
      params.append('manufacturerId', manufacturerId);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json(
        { success: false, message: `Backend error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Frontend API error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const response = await fetch(`${backendUrl}/api/attribute-values`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json(
        { success: false, message: `Backend error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Frontend API error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
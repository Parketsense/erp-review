import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const phases = await prisma.projectPhase.findMany({
      select: {
        id: true,
        name: true,
        projectId: true,
        variants: { select: { id: true, name: true } }
      },
      take: 10
    });
    return NextResponse.json({
      count: phases.length,
      phases,
      samplePhaseId: phases[0]?.id
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch test phases' }, { status: 500 });
  }
} 
'use client';

import React, { use } from 'react';
import PhasesList from '../../../../components/phases/PhasesList';

interface PhasesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PhasesPage({ params }: PhasesPageProps) {
  const { id } = use(params);

  return <PhasesList projectId={id} />;
} 
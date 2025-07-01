'use client';

import React, { use } from 'react';
import Link from 'next/link';
import PhasesList from '../../../components/phases/PhasesList';

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  
  return <PhasesList projectId={id} />;
} 
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function HomePage() {
  const mockUser = {
    name: 'Администратор',
    email: 'admin@parketsense.bg',
  };

  const mockStats = {
    totalProjects: 24,
    activeProjects: 8,
    totalRevenue: 125000,
    monthlyGrowth: 12.5,
  };

  return (
    <DashboardLayout 
      user={mockUser}
      stats={mockStats}
    />
  );
}

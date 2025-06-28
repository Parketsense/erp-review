import { useQuery } from '@tanstack/react-query';

// Временни примерни данни
const mockClients = {
  data: [
    {
      id: 1,
      firstName: 'Иван',
      lastName: 'Петров',
      email: 'ivan.petrov@email.com',
      phone: '+359 888 123 456',
      companyName: null,
      address: 'ул. "Граф Игнатиев" 15, София',
      notes: 'Интерес от паркет за хол',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      firstName: 'Мария',
      lastName: 'Георгиева',
      email: 'maria.georgieva@company.bg',
      phone: '+359 888 654 321',
      companyName: 'Интериор Дизайн ООД',
      address: 'ул. "Васил Левски" 45, София',
      notes: 'Голям проект за офис',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      firstName: 'Стефан',
      lastName: 'Димитров',
      email: 'stefan.dimitrov@email.com',
      phone: '+359 888 789 012',
      companyName: null,
      address: 'ул. "Шипка" 8, Пловдив',
      notes: 'Паркет за спалня',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  meta: {
    total: 3,
    page: 1,
    limit: 10,
    totalPages: 1
  }
};

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      // Засега връщаме само примерни данни
      return mockClients;
    },
    staleTime: 5 * 60 * 1000, // 5 минути
  });
}; 
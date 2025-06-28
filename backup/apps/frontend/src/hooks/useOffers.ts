import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offersApi, CreateOfferData, UpdateOfferData } from '../services/offersApi';
import { OfferType, OfferStatus } from '../types/offers';

export const useOffers = (params?: {
  type?: OfferType;
  projectId?: string;
  variantId?: string;
  status?: OfferStatus;
}) => {
  return useQuery({
    queryKey: ['offers', params],
    queryFn: () => offersApi.getOffers(params),
  });
};

export const useOffer = (id: string) => {
  return useQuery({
    queryKey: ['offers', id],
    queryFn: () => offersApi.getOffer(id),
    enabled: !!id,
  });
};

export const useOfferStats = () => {
  return useQuery({
    queryKey: ['offers', 'stats'],
    queryFn: () => offersApi.getOfferStats(),
  });
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateOfferData) => offersApi.createOffer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['offers', 'stats'] });
    },
  });
};

export const useUpdateOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOfferData }) =>
      offersApi.updateOffer(id, data),
    onSuccess: (updatedOffer) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['offers', updatedOffer.id] });
      queryClient.invalidateQueries({ queryKey: ['offers', 'stats'] });
    },
  });
};

export const useDeleteOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => offersApi.deleteOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['offers', 'stats'] });
    },
  });
};

export const useGenerateOfferNumber = () => {
  return useMutation({
    mutationFn: (type: OfferType) => offersApi.generateOfferNumber(type),
  });
};

export const useOffersByProject = (projectId: string) => {
  return useQuery({
    queryKey: ['offers', 'project', projectId],
    queryFn: () => offersApi.getOffersByProject(projectId),
    enabled: !!projectId,
  });
};

export const useOffersByVariant = (variantId: string) => {
  return useQuery({
    queryKey: ['offers', 'variant', variantId],
    queryFn: () => offersApi.getOffersByVariant(variantId),
    enabled: !!variantId,
  });
}; 
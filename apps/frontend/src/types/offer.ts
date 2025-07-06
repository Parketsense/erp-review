export interface Offer {
  id: string;
  projectId: string;
  phaseId?: string;
  clientId: string;
  offerNumber: string;
  projectName?: string;
  subject?: string;
  validUntil?: string;
  expiresAt?: string;
  conditions?: any;
  emailSubject?: string;
  emailBody?: string;
  status?: string;
  sentCount?: number;
  lastSentAt?: string;
  lastSentTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variants?: OfferVariant[];
  project?: {
    id: string;
    name: string;
    clientName?: string;
  };
  client?: {
    id: string;
    name: string;
    email?: string;
  };
  installationPhaseId?: string;
  versionNumber?: number;
  parentOfferId?: string;
  totalValue?: number;
}

export interface OfferVariant {
  id: string;
  name: string;
  description?: string;
  materialsCost: number;
  rooms?: OfferRoom[];
  installations?: OfferInstallation[];
}

export interface OfferRoom {
  id: string;
  name: string;
  description?: string;
  products?: OfferRoomProduct[];
}

export interface OfferRoomProduct {
  id: string;
  productId: string;
  quantity: number;
  unitPrice?: number;
  product?: {
    id: string;
    name: string;
    sku?: string;
  };
}

export interface OfferInstallation {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOfferDto {
  projectId: string;
  phaseId?: string;
  clientId: string;
  offerNumber: string;
  projectName?: string;
  subject?: string;
  validUntil?: string;
  expiresAt?: string;
  conditions?: any;
  emailSubject?: string;
  emailBody?: string;
  status?: string;
  variants?: CreateOfferVariantDto[];
}

export interface CreateOfferVariantDto {
  name: string;
  description?: string;
  materialsCost: number;
  rooms?: CreateOfferRoomDto[];
  installations?: CreateOfferInstallationDto[];
}

export interface CreateOfferRoomDto {
  name: string;
  description?: string;
  products?: CreateOfferRoomProductDto[];
}

export interface CreateOfferRoomProductDto {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface CreateOfferInstallationDto {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateOfferDto extends Partial<CreateOfferDto> {
  offerNumber?: string;
}

export interface OffersResponse {
  data: Offer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OfferStats {
  total: number;
  active: number;
  draft: number;
  sent: number;
  viewed: number;
  accepted: number;
  rejected: number;
  acceptanceRate: number;
  viewRate: number;
  thisMonth: number;
  monthlyGrowth: number;
}

export interface SendOfferDto {
  emailSubject: string;
  emailBody: string;
  recipientEmail?: string;
}

export type OfferStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';

export interface PhaseOfferData {
  phaseId: string;
  projectId: string;
  clientId: string;
  selectedVariantIds: string[];
  installationPhaseId?: string;
  emailTemplate: string;
  validUntil: Date;
  terms: string[];
  offerNumber: string;
  subject: string;
}

export interface VariantForOffer {
  variantId: string;
  name: string;
  description?: string;
  rooms: RoomSummary[];
  totalPrice: number;
  included: boolean;
}

export interface RoomSummary {
  id: string;
  name: string;
  productCount: number;
  totalPrice: number;
}

export interface OfferSummary {
  id: string;
  offerNumber: string;
  projectName: string;
  subject: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'expired';
  validUntil: string;
  createdAt: string;
  lastSentAt?: string;
  lastSentTo?: string;
  versionNumber: number;
  parentOfferId?: string;
  totalValue?: number;
}

export interface OfferVersion {
  id: string;
  versionNumber: number;
  offerNumber: string;
  createdAt: string;
  createdBy: string;
  status: string;
  changes: string[];
  totalValue: number;
}

export interface OfferPreviewData {
  id: string;
  offerNumber: string;
  subject: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  validUntil: string;
  createdAt: string;
  status: string;
  totalValue: number;
  variants: Array<{
    id: string;
    name: string;
    description?: string;
    rooms: Array<{
      id: string;
      name: string;
      products: Array<{
        id: string;
        name: string;
        quantity: number;
        unitPrice: number;
        discount: number;
        totalPrice: number;
      }>;
      totalPrice: number;
    }>;
    totalPrice: number;
  }>;
  installationPhase?: {
    id: string;
    name: string;
    description?: string;
  };
  terms: string[];
  emailTemplate: string;
} 
export enum OfferType {
  MATERIALS = 'MATERIALS',
  INSTALLATION = 'INSTALLATION',
  COMPLETE = 'COMPLETE',
  LUXURY = 'LUXURY',
  CUSTOM = 'CUSTOM'
}

export enum OfferStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export interface OfferItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
  unit?: string;
  category?: string;
}

export interface Offer {
  id: string;
  offerNumber: string;
  type: OfferType;
  status: OfferStatus;
  projectId: string;
  variantId: string;
  roomId: string;
  clientId: string;
  totalAmount: number;
  currency: string;
  validUntil?: string;
  notes?: string;
  terms?: string;
  conditions?: string;
  deliveryTime?: string;
  warranty?: string;
  issuedBy?: string;
  issuedAt?: string;
  createdAt: string;
  updatedAt: string;
  items: OfferItem[];
  project?: {
    id: string;
    name: string;
  };
  variant?: {
    id: string;
    name: string;
  };
  room?: {
    id: string;
    name: string;
  };
  client?: {
    id: string;
    firstName: string;
    lastName: string;
  };
} 
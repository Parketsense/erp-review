// Enhanced types for interactive offer components

import { Project } from './project';
import { PhaseVariant, VariantRoom, RoomProduct } from './variant';
import { Offer } from './offer';

// Client Offer Data - Complete offer data for interactive display
export interface ClientOfferData {
  offer: Offer;
  project: Project;
  variants: InteractiveVariant[];
  pricing: PricingData;
  galleries: GalleryData[];
  selections: OfferSelection;
  metadata: OfferMetadata;
}

// Interactive Variant with enhanced data for client selection
export interface InteractiveVariant extends PhaseVariant {
  rooms: InteractiveRoom[];
  pricing: VariantPricing;
  features: VariantFeature[];
  isRecommended?: boolean;
  popularity?: number;
  estimatedTime?: string;
}

// Interactive Room with products and images
export interface InteractiveRoom extends VariantRoom {
  products: InteractiveRoomProduct[];
  images: RoomImage[];
  pricing: RoomPricing;
  features: RoomFeature[];
  installation?: InstallationData;
}

// Interactive Room Product with enhanced pricing and options
export interface InteractiveRoomProduct extends RoomProduct {
  options: ProductOption[];
  alternatives: ProductAlternative[];
  pricing: ProductPricing;
  availability: ProductAvailability;
  specifications: ProductSpecification[];
}

// Product Option for customization
export interface ProductOption {
  id: string;
  name: string;
  type: 'color' | 'material' | 'size' | 'finish' | 'custom';
  value: string;
  priceAdjustment: number;
  available: boolean;
}

// Product Alternative for comparison
export interface ProductAlternative {
  id: string;
  productId: string;
  name: string;
  priceDifference: number;
  quality: 'lower' | 'similar' | 'higher';
  availability: boolean;
}

// Product Pricing breakdown
export interface ProductPricing {
  basePrice: number;
  discountedPrice: number;
  finalPrice: number;
  discount: number;
  discountPercent: number;
  wasteCost: number;
  installationCost: number;
  totalCost: number;
}

// Product Availability
export interface ProductAvailability {
  inStock: boolean;
  stockQuantity?: number;
  deliveryTime: string;
  backorderAvailable: boolean;
}

// Product Specifications
export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
}

// Room Pricing breakdown
export interface RoomPricing {
  materialsCost: number;
  laborCost: number;
  installationCost: number;
  wasteCost: number;
  discount: number;
  totalCost: number;
  costPerSquareMeter: number;
}

// Room Features
export interface RoomFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  optional: boolean;
  cost?: number;
}

// Installation Data
export interface InstallationData {
  included: boolean;
  cost: number;
  duration: string;
  requirements: string[];
  warranty: string;
}

// Variant Pricing breakdown
export interface VariantPricing {
  materialsCost: number;
  laborCost: number;
  installationCost: number;
  architectCommission: number;
  discount: number;
  totalCost: number;
  costPerSquareMeter: number;
  savings: number;
}

// Variant Features
export interface VariantFeature {
  id: string;
  name: string;
  description: string;
  category: 'design' | 'material' | 'installation' | 'warranty';
  included: boolean;
  value: string;
}

// Overall Pricing Data
export interface PricingData {
  subtotal: number;
  discounts: DiscountBreakdown;
  architectCommission: number;
  installation: InstallationBreakdown;
  total: number;
  currency: string;
  validUntil: string;
  paymentTerms: PaymentTerms;
}

// Discount Breakdown
export interface DiscountBreakdown {
  projectDiscount: number;
  phaseDiscount: number;
  variantDiscount: number;
  roomDiscount: number;
  productDiscount: number;
  totalDiscount: number;
  discountPercent: number;
}

// Installation Breakdown
export interface InstallationBreakdown {
  included: boolean;
  cost: number;
  duration: string;
  startDate?: string;
  completionDate?: string;
  requirements: string[];
}

// Payment Terms
export interface PaymentTerms {
  deposit: number;
  depositPercent: number;
  installments: number;
  installmentAmount: number;
  finalPayment: number;
  dueDate: string;
}

// Client Offer Selection
export interface OfferSelection {
  selectedVariants: string[];
  selectedRooms: Record<string, string[]>; // variantId -> roomIds[]
  selectedProducts: Record<string, string[]>; // roomId -> productIds[]
  selectedOptions: Record<string, string>; // productId -> optionValue
  customizations: Record<string, any>; // productId -> customization data
  preferences: ClientPreferences;
}

// Client Preferences
export interface ClientPreferences {
  budget: {
    min: number;
    max: number;
    preferred: number;
  };
  timeline: {
    startDate?: string;
    completionDate?: string;
    urgency: 'low' | 'medium' | 'high';
  };
  priorities: {
    quality: number; // 1-10
    price: number; // 1-10
    speed: number; // 1-10
    design: number; // 1-10
  };
  style: {
    preferred: string[];
    avoid: string[];
  };
}

// Gallery Data for room images
export interface GalleryData {
  roomId: string;
  roomName: string;
  images: RoomImage[];
  beforeAfter?: {
    before: RoomImage[];
    after: RoomImage[];
  };
  virtualTour?: string;
  videos?: VideoData[];
}

// Video Data
export interface VideoData {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  description?: string;
}

// Room Image with enhanced metadata
export interface RoomImage {
  id: string;
  roomId: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  caption?: string;
  tags: string[];
  uploadedAt: string;
  thumbnail?: string;
  fullSize?: string;
}

// Offer Metadata
export interface OfferMetadata {
  createdAt: string;
  updatedAt: string;
  viewedAt?: string;
  viewedCount: number;
  sharedCount: number;
  downloadCount: number;
  lastActivity: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  expiresAt?: string;
  validUntil: string;
}

// API Response types
export interface ClientOfferResponse {
  success: boolean;
  data: ClientOfferData;
  message: string;
}

export interface OfferSelectionResponse {
  success: boolean;
  data: OfferSelection;
  message: string;
}

export interface PricingCalculationResponse {
  success: boolean;
  data: PricingData;
  message: string;
}

export interface GalleryResponse {
  success: boolean;
  data: GalleryData[];
  message: string;
}

// Real-time update types
export interface OfferUpdate {
  type: 'selection' | 'pricing' | 'gallery' | 'status';
  data: any;
  timestamp: string;
}

// Error types
export interface OfferError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface OfferSummary {
  id: string;
  offerNumber: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  validUntil?: string;
  projectId: string;
  projectName?: string;
  clientId?: string;
  clientName?: string;
  totalValue: number;
  variantCount: number;
}

export interface VariantForOffer {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  rooms: RoomForOffer[];
  totalPrice: number;
  included: boolean;
  hasProducts: boolean;
  roomCount: number;
  productCount: number;
}

export interface RoomForOffer {
  id: string;
  name: string;
  area: number;
  wasteFactorPercent: number;
  discountPercent: number;
  productCount: number;
  products: ProductForOffer[];
  totalPrice: number;
}

export interface ProductForOffer {
  id: string;
  name: string;
  productName: string;
  productCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
}

export interface PhaseOfferData {
  subject?: string;
  validUntil?: string;
  status?: string;
  conditions?: any;
  emailSubject?: string;
  emailBody?: string;
  selectedVariantIds?: string[];
  installationPhaseId?: string;
} 
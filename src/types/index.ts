export type BillingCycle = 'monthly' | 'annual';

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  badge?: string;
  popular?: boolean;
  description: string;
  monthlyPrice: number;
  annualPrice: number; // total for the year or monthly equivalent
  annualMonthlyEquivalent: number;
  discountPercentage: number;
  features: PlanFeature[];
  includedProducts: string[];
}

export interface ProductItem {
  id: string;
  category: 'hardware' | 'google' | 'marketing' | 'infrastructure';
  title: string;
  subtitle: string;
  description: string;
  price: number;
  recurring?: boolean;
  badge?: string;
  iconName: string;
  features: string[];
  deliveryTime: string;
  idealFor: string;
}

export interface ClientData {
  companyName: string; // Razão Social
  tradeName: string;   // Nome Fantasia
  documentNumber: string; // CNPJ ou CPF
  representativeName: string; // Responsável Legal
  documentType: 'CNPJ' | 'CPF';
  phone: string;
  whatsapp: string;
  email: string;
  addressStreet: string;
  addressNumber: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  businessSegment: string;
  instagramHandle?: string;
  googleMapsUrl?: string;
}

export type PaymentMethod = 'pix' | 'credit_card' | 'boleto' | 'recurrent';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'broker';
  brokerId?: string;
  verified: boolean;
  avatarUrl?: string;
  pixKey?: string;
  joinedAt: string;
}

export interface Broker {
  id: string;
  name: string;
  email: string;
  gmailVerified: boolean;
  phone: string;
  whatsapp: string;
  cpf: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'phone' | 'email' | 'random';
  active: boolean;
  commissionRate: number; // default 0.50 (50%)
  joinedAt: string;
  verificationBadge: string;
}

export interface ContractItem {
  id: string;
  contractNumber: string;
  client: ClientData;
  planId?: string;
  planName?: string;
  billingCycle?: BillingCycle;
  selectedProducts: {
    productId: string;
    productTitle: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalValue: number;
  paymentMethod: PaymentMethod;
  installments?: number;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  signedAt: string;
  validUntil: string;
  signatureDataUrl?: string;
  digitalSignatureHash: string;
  notes?: string;
  sentToWhatsappAt?: string;
  // Corretor e Comissão (50%)
  brokerId?: string;
  brokerName?: string;
  commissionRate?: number; // 0.50
  commissionValue?: number; // 50% do total
  commissionStatus?: 'pending' | 'paid';
  commissionPaidAt?: string;
}

export interface VisitSchedule {
  id: string;
  clientName: string;
  contactPerson: string;
  whatsapp: string;
  address: string;
  city: string;
  date: string;
  time: string;
  consultant: string;
  purpose: 'demonstration_nfc' | 'google_proposal' | 'contract_closing' | 'follow_up';
  status: 'scheduled' | 'in_route' | 'completed' | 'converted_to_contract' | 'cancelled';
  notes: string;
  estimatedContractValue: number;
}

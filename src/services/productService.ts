import { AdminProduct } from '../types';

const STORAGE_KEY = 'retoma_admin_products_v1';

export const INITIAL_ADMIN_PRODUCTS: AdminProduct[] = [
  {
    id: 'prod_admin_001',
    name: 'Cartão NFC Google Avaliação (Acrílico Premium)',
    description: 'Cartão inteligente com chip NFC NTAG213 e QR Code laser de backup. Aproximação direta com qualquer smartphone sem necessidade de instalar aplicativos para abrir a página de 5 estrelas.',
    sku: 'RET-NFC-001',
    category: 'Hardware NFC',
    price: 97.00,
    stock: 85,
    status: 'ativo',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-15T08:30:00.000Z',
    updatedAt: '2026-10-20T14:00:00.000Z',
  },
  {
    id: 'prod_admin_002',
    name: 'Implantação Completa Google Empresa (Meu Negócio)',
    description: 'Otimização avançada de SEO Local, verificação de propriedade, cadastro de fotos em alta resolução, horários, categorias e link encurtado exclusivo para coleta de avaliações.',
    sku: 'RET-GMB-002',
    category: 'Google & SEO Local',
    price: 249.00,
    stock: 999,
    status: 'ativo',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-16T11:00:00.000Z',
  },
  {
    id: 'prod_admin_003',
    name: 'Implantação no Google Mapas & Rotas GPS',
    description: 'Fixação de Pin com georreferenciamento exato, rotas pedestres e automotivas, sincronização com aplicativos de navegação e pontos de referência de Rio Branco e região.',
    sku: 'RET-MAP-003',
    category: 'Google & SEO Local',
    price: 180.00,
    stock: 999,
    status: 'ativo',
    imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-17T09:15:00.000Z',
  },
  {
    id: 'prod_admin_004',
    name: 'Criação de Instagram Profissional Comercial',
    description: 'Perfil comercial estratégico, bio persuasiva com chamada de conversão, capas de destaques personalizadas, integração de link na bio e configuração de respostas automáticas.',
    sku: 'RET-IGM-004',
    category: 'Marketing & Redes',
    price: 199.00,
    stock: 999,
    status: 'ativo',
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-18T16:20:00.000Z',
  },
  {
    id: 'prod_admin_005',
    name: 'Criação de E-mails Pessoais e Corporativos (@empresa)',
    description: 'Ativação de e-mails profissionais com domínio personalizado, segurança anti-spam SPF/DKIM/DMARC, configuração Webmail e suporte para smartphone Android/iOS.',
    sku: 'RET-EML-005',
    category: 'Infraestrutura & TI',
    price: 160.00,
    stock: 999,
    status: 'ativo',
    imageUrl: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-19T13:45:00.000Z',
  },
  {
    id: 'prod_admin_006',
    name: 'Design Publicitário & Pacote de Posts Promocionais',
    description: 'Pacote com 4 criativos de alto impacto para Feed, Stories e WhatsApp Status com copywriting persuasivo e identidade visual profissional para promoções e lançamentos.',
    sku: 'RET-PST-006',
    category: 'Design & Conteúdo',
    price: 220.00,
    stock: 45,
    status: 'ativo',
    imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-21T10:10:00.000Z',
  },
  {
    id: 'prod_admin_007',
    name: 'Display de Balcão em Acrílico com Chip NFC',
    description: 'Totem de balcão rígido em acrílico cristal 3mm com base pesada, chip NFC embutido e gravação laser. Ideal para caixas, recepções médicas e balcões de atendimento.',
    sku: 'RET-DSP-007',
    category: 'Hardware NFC',
    price: 129.00,
    stock: 3,
    status: 'ativo',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-23T14:30:00.000Z',
  },
  {
    id: 'prod_admin_008',
    name: 'Adesivo Resinado NFC Pro para Mesas e Vitrines',
    description: 'Adesivo em resina epóxi resistente a intempéries e produtos de limpeza, com chip NFC embutido. Ideal para mesas de restaurantes, balcões e vitrines externas.',
    sku: 'RET-ADS-008',
    category: 'Hardware NFC',
    price: 45.00,
    stock: 0,
    status: 'inativo',
    imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-10-24T18:00:00.000Z',
  },
];

export const DEFAULT_PRODUCT_CATEGORIES = [
  'Hardware NFC',
  'Google & SEO Local',
  'Marketing & Redes',
  'Infraestrutura & TI',
  'Design & Conteúdo',
  'Acessórios & Suportes',
  'Consultoria Comercial',
];

// Simula delay de rede de API (80-150ms)
const simulateLatency = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

class ProductService {
  private getStorage(): AdminProduct[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_PRODUCTS));
        return INITIAL_ADMIN_PRODUCTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ADMIN_PRODUCTS;
    }
  }

  private setStorage(products: AdminProduct[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Falha ao salvar produtos no localStorage:', e);
    }
  }

  async getAll(): Promise<AdminProduct[]> {
    await simulateLatency(100);
    return this.getStorage();
  }

  async getById(id: string): Promise<AdminProduct | null> {
    await simulateLatency(60);
    const products = this.getStorage();
    return products.find((p) => p.id === id) || null;
  }

  async isSkuUnique(sku: string, currentProductId?: string): Promise<boolean> {
    await simulateLatency(30);
    const products = this.getStorage();
    const cleanSku = sku.trim().toUpperCase();
    return !products.some(
      (p) => p.sku.toUpperCase() === cleanSku && p.id !== currentProductId
    );
  }

  async create(data: Omit<AdminProduct, 'id' | 'createdAt'>): Promise<AdminProduct> {
    await simulateLatency(120);
    const products = this.getStorage();

    // Validação de SKU duplicado
    const isUnique = !products.some((p) => p.sku.toUpperCase() === data.sku.trim().toUpperCase());
    if (!isUnique) {
      throw new Error(`O SKU "${data.sku}" já está em uso por outro produto.`);
    }

    if (data.price < 0) {
      throw new Error('O preço do produto não pode ser negativo.');
    }

    if (data.stock < 0) {
      throw new Error('A quantidade em estoque não pode ser negativa.');
    }

    const newProduct: AdminProduct = {
      ...data,
      id: 'prod_admin_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      sku: data.sku.trim().toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newProduct, ...products];
    this.setStorage(updated);
    return newProduct;
  }

  async update(id: string, data: Partial<Omit<AdminProduct, 'id' | 'createdAt'>>): Promise<AdminProduct> {
    await simulateLatency(120);
    const products = this.getStorage();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error('Produto não localizado para atualização.');
    }

    if (data.sku) {
      const isUnique = !products.some(
        (p) => p.sku.toUpperCase() === data.sku!.trim().toUpperCase() && p.id !== id
      );
      if (!isUnique) {
        throw new Error(`O SKU "${data.sku}" já está em uso por outro produto.`);
      }
    }

    if (data.price !== undefined && data.price < 0) {
      throw new Error('O preço do produto não pode ser negativo.');
    }

    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('A quantidade em estoque não pode ser negativa.');
    }

    const updatedProduct: AdminProduct = {
      ...products[index],
      ...data,
      sku: data.sku ? data.sku.trim().toUpperCase() : products[index].sku,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updatedProduct;
    this.setStorage(products);
    return updatedProduct;
  }

  async delete(id: string): Promise<boolean> {
    await simulateLatency(120);
    const products = this.getStorage();
    const initialLength = products.length;
    const filtered = products.filter((p) => p.id !== id);

    if (filtered.length === initialLength) {
      throw new Error('Produto não encontrado para exclusão.');
    }

    this.setStorage(filtered);
    return true;
  }

  async toggleStatus(id: string): Promise<AdminProduct> {
    await simulateLatency(80);
    const products = this.getStorage();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Produto não encontrado.');
    }

    const current = products[index];
    const newStatus = current.status === 'ativo' ? 'inativo' : 'ativo';
    const updated: AdminProduct = {
      ...current,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updated;
    this.setStorage(products);
    return updated;
  }

  async resetToDefaults(): Promise<AdminProduct[]> {
    await simulateLatency(150);
    this.setStorage(INITIAL_ADMIN_PRODUCTS);
    return INITIAL_ADMIN_PRODUCTS;
  }
}

export const productService = new ProductService();

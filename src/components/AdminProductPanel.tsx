import React, { useState, useEffect, useMemo } from 'react';
import { AdminProduct, ProductStatus } from '../types';
import { productService, DEFAULT_PRODUCT_CATEGORIES } from '../services/productService';
import { formatCurrencyBRL } from '../utils/whatsapp';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Edit3, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  Boxes, 
  Image as ImageIcon, 
  Tag, 
  Barcode, 
  DollarSign, 
  Layers, 
  RefreshCw, 
  Upload, 
  Sparkles,
  SlidersHorizontal,
  Info,
  Calendar,
  ShieldCheck,
  FileText,
  AlertCircle
} from 'lucide-react';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const AdminProductPanel: React.FC = () => {
  // State
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Filters, Search & Sorting
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Active items for modals
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<AdminProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);

  // Form State
  const [formValues, setFormValues] = useState<{
    name: string;
    description: string;
    sku: string;
    category: string;
    price: string;
    stock: string;
    status: ProductStatus;
    imageUrl: string;
  }>({
    name: '',
    description: '',
    sku: '',
    category: DEFAULT_PRODUCT_CATEGORIES[0],
    price: '',
    stock: '',
    status: 'ativo',
    imageUrl: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  // Show Toast
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Load Products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch {
      showToast('error', 'Erro ao carregar catálogo de produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Compute Categories from current products + defaults
  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>(DEFAULT_PRODUCT_CATEGORIES);
    products.forEach((p) => {
      if (p.category) categoriesSet.add(p.category);
    });
    return Array.from(categoriesSet);
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name, 'pt-BR');
        } else if (sortBy === 'price') {
          comparison = a.price - b.price;
        } else if (sortBy === 'stock') {
          comparison = a.stock - b.stock;
        } else if (sortBy === 'createdAt') {
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [products, searchTerm, selectedCategory, selectedStatus, sortBy, sortDirection]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Adjust page if filters reduce item count
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Metrics calculation
  const metrics = useMemo(() => {
    const totalCount = products.length;
    const activeCount = products.filter((p) => p.status === 'ativo').length;
    const inactiveCount = totalCount - activeCount;
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStockCount = products.filter((p) => p.stock === 0).length;
    const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

    return {
      totalCount,
      activeCount,
      inactiveCount,
      lowStockCount,
      outOfStockCount,
      totalInventoryValue,
    };
  }, [products]);

  // Open Form Modal for Create
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormValues({
      name: '',
      description: '',
      sku: `RET-${Math.random().toString(36).substring(2, 5).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      category: DEFAULT_PRODUCT_CATEGORIES[0],
      price: '',
      stock: '10',
      status: 'ativo',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Form Modal for Edit
  const handleOpenEditModal = (product: AdminProduct) => {
    setEditingProduct(product);
    setFormValues({
      name: product.name,
      description: product.description,
      sku: product.sku,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      status: product.status,
      imageUrl: product.imageUrl,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetailModal = (product: AdminProduct) => {
    setSelectedProductForDetail(product);
    setIsDetailModalOpen(true);
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (product: AdminProduct) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Quick Toggle Status
  const handleToggleStatus = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await productService.toggleStatus(productId);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showToast('info', `Status do produto alterado para "${updated.status.toUpperCase()}".`);
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao alterar status.');
    }
  };

  // Validate Form
  const validateForm = async (): Promise<boolean> => {
    const errors: Record<string, string> = {};

    if (!formValues.name.trim()) {
      errors.name = 'O nome do produto é obrigatório.';
    } else if (formValues.name.trim().length < 3) {
      errors.name = 'O nome deve ter no mínimo 3 caracteres.';
    }

    if (!formValues.description.trim()) {
      errors.description = 'A descrição do produto é obrigatória.';
    } else if (formValues.description.trim().length < 10) {
      errors.description = 'A descrição deve ter no mínimo 10 caracteres.';
    }

    if (!formValues.sku.trim()) {
      errors.sku = 'O código SKU é obrigatório.';
    } else {
      const isUnique = await productService.isSkuUnique(formValues.sku, editingProduct?.id);
      if (!isUnique) {
        errors.sku = 'Este SKU já está em uso por outro produto.';
      }
    }

    if (!formValues.category.trim()) {
      errors.category = 'A categoria é obrigatória.';
    }

    const priceNum = parseFloat(formValues.price.replace(',', '.'));
    if (!formValues.price.trim() || isNaN(priceNum)) {
      errors.price = 'Informe um preço válido (ex: 97.00).';
    } else if (priceNum < 0) {
      errors.price = 'O preço não pode ser negativo.';
    }

    const stockNum = parseInt(formValues.stock, 10);
    if (!formValues.stock.trim() || isNaN(stockNum)) {
      errors.stock = 'Informe a quantidade em estoque (número inteiro).';
    } else if (stockNum < 0) {
      errors.stock = 'O estoque não pode ser negativo.';
    }

    if (!formValues.imageUrl.trim()) {
      errors.imageUrl = 'Informe a URL da imagem do produto.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const isValid = await validateForm();
      if (!isValid) {
        setFormSubmitting(false);
        showToast('error', 'Por favor, corrija os erros no formulário antes de prosseguir.');
        return;
      }

      const price = parseFloat(formValues.price.replace(',', '.'));
      const stock = parseInt(formValues.stock, 10);

      if (editingProduct) {
        // Update existing
        const updated = await productService.update(editingProduct.id, {
          name: formValues.name.trim(),
          description: formValues.description.trim(),
          sku: formValues.sku.trim().toUpperCase(),
          category: formValues.category.trim(),
          price,
          stock,
          status: formValues.status,
          imageUrl: formValues.imageUrl.trim(),
        });

        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast('success', `Produto "${updated.name}" atualizado com sucesso!`);
      } else {
        // Create new
        const created = await productService.create({
          name: formValues.name.trim(),
          description: formValues.description.trim(),
          sku: formValues.sku.trim().toUpperCase(),
          category: formValues.category.trim(),
          price,
          stock,
          status: formValues.status,
          imageUrl: formValues.imageUrl.trim(),
        });

        setProducts((prev) => [created, ...prev]);
        showToast('success', `Produto "${created.name}" cadastrado com sucesso!`);
      }

      setIsFormModalOpen(false);
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao salvar produto.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await productService.delete(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      showToast('success', `Produto "${productToDelete.name}" (${productToDelete.sku}) excluído com sucesso!`);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao excluir produto.');
    }
  };

  // Handle Image File Upload (converts to base64 data URL)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormValues((prev) => ({ ...prev, imageUrl: reader.result as string }));
        if (formErrors.imageUrl) {
          setFormErrors((prev) => {
            const next = { ...prev };
            delete next.imageUrl;
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset image gallery for quick selection
  const IMAGE_PRESETS = [
    { label: 'Cartão NFC', url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80' },
    { label: 'Google Empresa', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80' },
    { label: 'Google Mapas', url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80' },
    { label: 'Instagram', url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80' },
    { label: 'E-mails Corporativos', url: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=800&q=80' },
    { label: 'Design de Posts', url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80' },
    { label: 'Totem Balcão', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' },
    { label: 'Adesivo NFC', url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <div className="py-6 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md transition-all transform animate-slide-in ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
                : toast.type === 'error'
                ? 'bg-red-950/90 text-red-200 border-red-500/40'
                : 'bg-blue-950/90 text-blue-200 border-blue-500/40'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
            <span className="flex-1 leading-relaxed">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Boxes className="w-3.5 h-3.5" />
            <span>Módulo Administrativo • CRUD de Catálogo</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Gestão de Produtos & Serviços
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Painel administrativo oficial para incluir, visualizar, editar e excluir produtos do ecossistema Retoma Digital com controle de estoque e precificação.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={async () => {
              if (confirm('Deseja recarregar os dados do catálogo?')) {
                await loadProducts();
                showToast('info', 'Catálogo recarregado com sucesso.');
              }
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="Atualizar lista"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Produto</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Produtos */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total de Itens
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {metrics.totalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Cadastrados no catálogo
          </div>
        </div>

        {/* Ativos vs Inativos */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Status Comercial
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 flex items-baseline gap-2">
            <span>{metrics.activeCount} <span className="text-xs text-emerald-300 font-normal">ativos</span></span>
            <span className="text-xs text-slate-500 font-normal">({metrics.inactiveCount} off)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Disponíveis para venda direta
          </div>
        </div>

        {/* Alerta de Estoque */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Atenção de Estoque
            </span>
            <div className={`p-2 rounded-xl ${metrics.lowStockCount > 0 || metrics.outOfStockCount > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">
            {metrics.lowStockCount + metrics.outOfStockCount}{' '}
            <span className="text-xs text-amber-400 font-normal">requer reposição</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {metrics.outOfStockCount} esgotado(s) • {metrics.lowStockCount} baixo estoque
          </div>
        </div>

        {/* Valor em Estoque */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Patrimônio em Estoque
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-300 mt-2 truncate">
            {formatCurrencyBRL(metrics.totalInventoryValue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Preço unitário × unidades em estoque
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Category, Status, Sort & View Toggle */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Buscar por nome, SKU (ex: RET-NFC-001) ou descrição..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-700/80 text-xs sm:text-sm text-white pl-10 pr-10 py-2.5 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-white cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Categoria */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 px-3 py-1.5 rounded-2xl text-xs">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-2"
              >
                <option value="all" className="bg-slate-900 text-white">Todas as Categorias</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 px-3 py-1.5 rounded-2xl text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-2"
              >
                <option value="all" className="bg-slate-900 text-white">Todos os Status</option>
                <option value="ativo" className="bg-slate-900 text-white">Apenas Ativos</option>
                <option value="inativo" className="bg-slate-900 text-white">Apenas Inativos</option>
              </select>
            </div>

            {/* Ordenação */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 px-3 py-1.5 rounded-2xl text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-2"
              >
                <option value="createdAt" className="bg-slate-900 text-white">Data de Cadastro</option>
                <option value="name" className="bg-slate-900 text-white">Nome do Produto</option>
                <option value="price" className="bg-slate-900 text-white">Preço (R$)</option>
                <option value="stock" className="bg-slate-900 text-white">Quantidade em Estoque</option>
              </select>
              <button
                type="button"
                onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className="text-slate-400 hover:text-white px-1 font-bold text-xs cursor-pointer"
                title={sortDirection === 'asc' ? 'Ordem Crescente' : 'Ordem Decrescente'}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <span>Filtros ativos:</span>
              {searchTerm && (
                <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-lg border border-blue-500/30">
                  Busca: "{searchTerm}"
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-lg border border-purple-500/30">
                  Categoria: {selectedCategory}
                </span>
              )}
              {selectedStatus !== 'all' && (
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                  Status: {selectedStatus}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>

      {/* Main Content: Products Table & Mobile Cards */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Lista de Produtos Cadastrados</h3>
            <p className="text-xs text-slate-400">
              Total de <strong>{filteredProducts.length}</strong> produtos localizados.
            </p>
          </div>

          {/* Items per page selector */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Itens por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="6">6</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Carregando catálogo de produtos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-400 flex items-center justify-center mx-auto">
              <Boxes className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Nenhum produto encontrado</h4>
              <p className="text-xs text-slate-400">
                Não localizamos produtos correspondentes aos filtros ou termo de busca informado.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                Limpar Filtros
              </button>
              <button
                onClick={handleOpenCreateModal}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                + Adicionar Produto
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Produto</th>
                    <th className="py-3 px-4">SKU / Código</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Preço (R$)</th>
                    <th className="py-3 px-4">Estoque</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Cadastro</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedProducts.map((product) => {
                    const isOutOfStock = product.stock === 0;
                    const isLowStock = product.stock > 0 && product.stock <= 5;
                    const formattedDate = new Date(product.createdAt).toLocaleDateString('pt-BR');

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => handleOpenDetailModal(product)}
                      >
                        {/* Imagem & Nome */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-700 bg-slate-900 shrink-0 shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                            <div className="min-w-0 max-w-xs">
                              <span className="font-bold text-white block truncate group-hover:text-blue-400 transition-colors">
                                {product.name}
                              </span>
                              <span className="text-[11px] text-slate-400 line-clamp-1">
                                {product.description}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 text-[11px]">
                            {product.sku}
                          </span>
                        </td>

                        {/* Categoria */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium text-[11px] border border-slate-700">
                            {product.category}
                          </span>
                        </td>

                        {/* Preço */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-black text-white text-sm">
                          {formatCurrencyBRL(product.price)}
                        </td>

                        {/* Estoque */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1.5 border ${
                              isOutOfStock
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : isLowStock
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>
                              {product.stock} {product.stock === 1 ? 'unidade' : 'unidades'}
                            </span>
                          </span>
                        </td>

                        {/* Status Toggle Rápido */}
                        <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => handleToggleStatus(product.id, e)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer inline-flex items-center gap-1 ${
                              product.status === 'ativo'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                            }`}
                            title="Clique para alternar status do produto"
                          >
                            {product.status === 'ativo' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Ativo</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3 text-slate-400" />
                                <span>Inativo</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Data de Cadastro */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                          {formattedDate}
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Visualizar */}
                            <button
                              onClick={() => handleOpenDetailModal(product)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                              title="Visualizar Detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Editar */}
                            <button
                              onClick={() => handleOpenEditModal(product)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                              title="Editar Produto"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Excluir */}
                            <button
                              onClick={() => handleOpenDeleteModal(product)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                              title="Excluir Produto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-3">
              {paginatedProducts.map((product) => {
                const isOutOfStock = product.stock === 0;
                const isLowStock = product.stock > 0 && product.stock <= 5;

                return (
                  <div
                    key={product.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-900"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 truncate">
                            {product.sku}
                          </span>
                          <span
                            onClick={(e) => handleToggleStatus(product.id, e)}
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold cursor-pointer ${
                              product.status === 'ativo'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {product.status.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-xs mt-1 line-clamp-1">{product.name}</h4>
                        <span className="text-[10px] text-slate-400 block">{product.category}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2">{product.description}</p>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Preço</span>
                        <span className="font-black text-white text-sm">{formatCurrencyBRL(product.price)}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Estoque</span>
                        <span
                          className={`font-bold text-xs ${
                            isOutOfStock ? 'text-red-400' : isLowStock ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {product.stock} un
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => handleOpenDetailModal(product)}
                        className="py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-400 font-semibold text-[11px] flex items-center justify-center gap-1 border border-slate-800 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-[11px] flex items-center justify-center gap-1 border border-slate-800 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(product)}
                        className="py-1.5 rounded-xl bg-slate-900 hover:bg-red-950/60 text-red-400 font-semibold text-[11px] flex items-center justify-center gap-1 border border-slate-800 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs text-slate-400">
              <div>
                Mostrando <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> a{' '}
                <strong>{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</strong> de{' '}
                <strong>{filteredProducts.length}</strong> produtos
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
                  title="Página Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
                  title="Próxima Página"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL DE FORMULÁRIO: ADICIONAR / EDITAR PRODUTO          */}
      {/* ======================================================== */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl relative animate-scale-up my-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">
                    {editingProduct ? 'Editar Produto do Catálogo' : 'Cadastrar Novo Produto'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Preencha as informações obrigatórias e valide preço e estoque.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <span>Nome do Produto *</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cartão NFC Google Avaliação Premium"
                  value={formValues.name}
                  onChange={(e) => {
                    setFormValues({ ...formValues, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                  }}
                  className={`w-full bg-slate-950 border text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 ${
                    formErrors.name ? 'border-red-500' : 'border-slate-700'
                  }`}
                />
                {formErrors.name && (
                  <span className="text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.name}
                  </span>
                )}
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Descrição Detalhada *
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva as especificações, benefícios e aplicação do produto..."
                  value={formValues.description}
                  onChange={(e) => {
                    setFormValues({ ...formValues, description: e.target.value });
                    if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
                  }}
                  className={`w-full bg-slate-950 border text-xs sm:text-sm text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 ${
                    formErrors.description ? 'border-red-500' : 'border-slate-700'
                  }`}
                />
                {formErrors.description && (
                  <span className="text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.description}
                  </span>
                )}
              </div>

              {/* SKU & Categoria (2 Colunas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SKU */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      SKU / Código Único *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const newSku = `RET-${Math.random().toString(36).substring(2, 5).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
                        setFormValues({ ...formValues, sku: newSku });
                        if (formErrors.sku) setFormErrors({ ...formErrors, sku: '' });
                      }}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
                    >
                      Gerar SKU Automático
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Ex: RET-NFC-001"
                    value={formValues.sku}
                    onChange={(e) => {
                      setFormValues({ ...formValues, sku: e.target.value.toUpperCase() });
                      if (formErrors.sku) setFormErrors({ ...formErrors, sku: '' });
                    }}
                    className={`w-full bg-slate-950 border font-mono uppercase text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 ${
                      formErrors.sku ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                  {formErrors.sku && (
                    <span className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.sku}
                    </span>
                  )}
                </div>

                {/* Categoria */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Categoria *
                  </label>
                  <select
                    value={formValues.category}
                    onChange={(e) => {
                      setFormValues({ ...formValues, category: e.target.value });
                      if (formErrors.category) setFormErrors({ ...formErrors, category: '' });
                    }}
                    className={`w-full bg-slate-950 border text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 ${
                      formErrors.category ? 'border-red-500' : 'border-slate-700'
                    }`}
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <span className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Preço, Estoque & Status (3 Colunas) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Preço */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Preço de Venda (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="97.00"
                      value={formValues.price}
                      onChange={(e) => {
                        setFormValues({ ...formValues, price: e.target.value });
                        if (formErrors.price) setFormErrors({ ...formErrors, price: '' });
                      }}
                      className={`w-full bg-slate-950 border font-mono text-xs sm:text-sm text-white pl-9 pr-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 ${
                        formErrors.price ? 'border-red-500' : 'border-slate-700'
                      }`}
                    />
                  </div>
                  {formErrors.price && (
                    <span className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.price}
                    </span>
                  )}
                </div>

                {/* Estoque */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Estoque (Unidades) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="10"
                    value={formValues.stock}
                    onChange={(e) => {
                      setFormValues({ ...formValues, stock: e.target.value });
                      if (formErrors.stock) setFormErrors({ ...formErrors, stock: '' });
                    }}
                    className={`w-full bg-slate-950 border font-mono text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 ${
                      formErrors.stock ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                  {formErrors.stock && (
                    <span className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.stock}
                    </span>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Status Inicial *
                  </label>
                  <select
                    value={formValues.status}
                    onChange={(e) => setFormValues({ ...formValues, status: e.target.value as ProductStatus })}
                    className="w-full bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500"
                  >
                    <option value="ativo">Ativo (Visível)</option>
                    <option value="inativo">Inativo (Pausado)</option>
                  </select>
                </div>
              </div>

              {/* Imagem do Produto */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Imagem do Produto *</span>
                  </label>
                  <label className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload de arquivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  type="url"
                  placeholder="https://exemplo.com/foto-do-produto.jpg"
                  value={formValues.imageUrl}
                  onChange={(e) => {
                    setFormValues({ ...formValues, imageUrl: e.target.value });
                    if (formErrors.imageUrl) setFormErrors({ ...formErrors, imageUrl: '' });
                  }}
                  className={`w-full bg-slate-950 border text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 ${
                    formErrors.imageUrl ? 'border-red-500' : 'border-slate-700'
                  }`}
                />
                {formErrors.imageUrl && (
                  <span className="text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.imageUrl}
                  </span>
                )}

                {/* Preset image suggestions */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-slate-400">Sugestões de fotos oficiais da Retoma:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {IMAGE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormValues({ ...formValues, imageUrl: preset.url });
                          if (formErrors.imageUrl) setFormErrors({ ...formErrors, imageUrl: '' });
                        }}
                        className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Image Preview */}
                {formValues.imageUrl && (
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-3 mt-2">
                    <img
                      src={formValues.imageUrl}
                      alt="Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-900"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div className="text-xs text-slate-400 min-w-0">
                      <span className="font-bold text-white block">Preview da Imagem</span>
                      <span className="text-[10px] text-emerald-400">✓ URL carregada e pronta</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  {formSubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE VISUALIZAÇÃO DETALHADA DO PRODUTO               */}
      {/* ======================================================== */}
      {isDetailModalOpen && selectedProductForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-scale-up">
            {/* Header Image Cover */}
            <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
              <img
                src={selectedProductForDetail.imageUrl}
                alt={selectedProductForDetail.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950/60 text-white hover:bg-slate-900 transition-colors backdrop-blur-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 left-4 flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-300 bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-500/40 backdrop-blur-md">
                  {selectedProductForDetail.sku}
                </span>
                <span
                  className={`text-[11px] px-2.5 py-1 rounded-full font-bold border backdrop-blur-md ${
                    selectedProductForDetail.status === 'ativo'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950/80 text-slate-400 border-slate-700'
                  }`}
                >
                  {selectedProductForDetail.status === 'ativo' ? 'Ativo no Catálogo' : 'Inativo / Pausado'}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {selectedProductForDetail.category}
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {selectedProductForDetail.name}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                {selectedProductForDetail.description}
              </p>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Preço de Venda</span>
                  <span className="text-lg font-black text-white mt-1 block">
                    {formatCurrencyBRL(selectedProductForDetail.price)}
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Estoque Disponível</span>
                  <span
                    className={`text-lg font-black mt-1 block ${
                      selectedProductForDetail.stock === 0
                        ? 'text-red-400'
                        : selectedProductForDetail.stock <= 5
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {selectedProductForDetail.stock} unidades
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Cadastrado em: {new Date(selectedProductForDetail.createdAt).toLocaleDateString('pt-BR')}
                </span>
                {selectedProductForDetail.updatedAt && (
                  <span>
                    Atualizado: {new Date(selectedProductForDetail.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenEditModal(selectedProductForDetail);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Produto</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (PEDIR CONFIRMAÇÃO)     */}
      {/* ======================================================== */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Confirmar Exclusão</h3>
                <p className="text-xs text-slate-400">Esta ação não poderá ser desfeita.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src={productToDelete.imageUrl}
                  alt={productToDelete.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-white text-xs block truncate">{productToDelete.name}</span>
                  <span className="font-mono text-[10px] text-blue-400">{productToDelete.sku}</span>
                  <span className="text-[10px] text-slate-400 block">• Preço: {formatCurrencyBRL(productToDelete.price)}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Tem certeza que deseja excluir o produto <strong>"{productToDelete.name}"</strong> do catálogo da Retoma Digital?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir Produto</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { ProductItem } from '../types';
import { INITIAL_PRODUCTS, RETOMA_PHONE_DISPLAY, RETOMA_WHATSAPP_OFFICIAL } from '../data/initialData';
import { formatCurrencyBRL } from '../utils/whatsapp';
import { 
  CreditCard, 
  Store, 
  MapPin, 
  Instagram, 
  Mail, 
  Palette, 
  Check, 
  ShoppingBag, 
  ArrowRight, 
  Rotate3d,
  Sparkles,
  Clock,
  CheckCircle2,
  Boxes
} from 'lucide-react';

interface ProductsTabProps {
  onOrderProductsDirectly: (products: { product: ProductItem; quantity: number }[]) => void;
  onOpen3DViewer: () => void;
  onOpenAdminProducts?: () => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  onOrderProductsDirectly,
  onOpen3DViewer,
  onOpenAdminProducts,
}) => {
  const [cart, setCart] = useState<Record<string, number>>({
    prod_nfc_card: 1,
  });

  const getProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard':
        return CreditCard;
      case 'Store':
        return Store;
      case 'MapPin':
        return MapPin;
      case 'Instagram':
        return Instagram;
      case 'Mail':
        return Mail;
      case 'Palette':
        return Palette;
      default:
        return Sparkles;
    }
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotalPrice = Object.entries(cart).reduce((sum, [pid, qty]) => {
    const prod = INITIAL_PRODUCTS.find((p) => p.id === pid);
    return sum + (prod ? prod.price * qty : 0);
  }, 0);

  const handleProceedToContract = () => {
    const items = Object.entries(cart).map(([pid, qty]) => ({
      product: INITIAL_PRODUCTS.find((p) => p.id === pid)!,
      quantity: qty,
    })).filter((i) => i.product && i.quantity > 0);

    if (items.length === 0) {
      alert('Selecione ao menos um produto ou serviço para prosseguir.');
      return;
    }

    onOrderProductsDirectly(items);
  };

  return (
    <div className="py-6 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Catálogo Completo de Soluções</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Produtos & Serviços de Presença e Vendas Locais
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Escolha itens avulsos ou combine soluções para o seu negócio. Todos os serviços contam com garantia de implantação, notas fiscais e suporte da equipe Retoma Digital.
          </p>
        </div>

        {/* Header Action buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {onOpenAdminProducts && (
            <button
              onClick={onOpenAdminProducts}
              className="bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Boxes className="w-4 h-4" />
              <span>Gerenciar Catálogo (Admin)</span>
            </button>
          )}

          <button
            onClick={onOpen3DViewer}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Rotate3d className="w-4 h-4 text-blue-400" />
            <span>Visualizar Cartão NFC em 3D</span>
          </button>
        </div>
      </div>

      {/* Cart Summary Bar if items selected */}
      {cartItemsCount > 0 && (
        <div className="sticky top-20 z-30 bg-blue-950/90 border border-blue-500/40 rounded-2xl p-4 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">
              {cartItemsCount}
            </div>
            <div>
              <div className="text-xs text-blue-300 font-medium">Itens selecionados no seu pedido:</div>
              <div className="text-lg font-black text-white">
                Total: {formatCurrencyBRL(cartTotalPrice)}
              </div>
            </div>
          </div>

          <button
            onClick={handleProceedToContract}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Gerar Contrato dos Produtos Selecionados</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INITIAL_PRODUCTS.map((prod) => {
          const Icon = getProductIcon(prod.iconName);
          const inCartQty = cart[prod.id] || 0;

          return (
            <div
              key={prod.id}
              className={`rounded-3xl p-6 flex flex-col justify-between border transition-all duration-200 ${
                inCartQty > 0
                  ? 'bg-slate-900/90 border-blue-500 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/30'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {prod.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight">
                  {prod.title}
                </h3>
                <p className="text-xs text-blue-400 font-semibold mt-0.5">
                  {prod.subtitle}
                </p>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  {prod.description}
                </p>

                {/* Features */}
                <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Benefícios Inclusos:
                  </span>
                  {prod.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery details */}
                <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Prazo: {prod.deliveryTime}</span>
                </div>
              </div>

              {/* Price & Cart Actions */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Investimento</span>
                  <span className="text-2xl font-black text-white">
                    {formatCurrencyBRL(prod.price)}
                  </span>
                </div>

                {inCartQty === 0 ? (
                  <button
                    onClick={() => handleUpdateQty(prod.id, 1)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Adicionar</span>
                    <span>+</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-700">
                    <button
                      onClick={() => handleUpdateQty(prod.id, -1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-white">
                      {inCartQty}
                    </span>
                    <button
                      onClick={() => handleUpdateQty(prod.id, 1)}
                      className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

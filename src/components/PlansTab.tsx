import React, { useState } from 'react';
import { Plan, BillingCycle } from '../types';
import { INITIAL_PLANS, RETOMA_PHONE_DISPLAY, RETOMA_WHATSAPP_OFFICIAL } from '../data/initialData';
import { formatCurrencyBRL } from '../utils/whatsapp';
import { 
  Check, 
  X, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  CreditCard, 
  HelpCircle,
  ArrowRight,
  Calculator,
  Star,
  Smartphone,
  Download,
  Play
} from 'lucide-react';
import { PromoVideoPlayer } from './PromoVideoPlayer';

interface PlansTabProps {
  onSelectPlanForContract: (plan: Plan, cycle: BillingCycle) => void;
  onOpen3DCard: () => void;
  onOpenInstallModal?: () => void;
  onOpenPromoVideo?: () => void;
  availableNfcStock?: number;
}

export const PlansTab: React.FC<PlansTabProps> = ({
  onSelectPlanForContract,
  onOpen3DCard,
  onOpenInstallModal,
  onOpenPromoVideo,
  availableNfcStock = 20,
}) => {
  const [cycle, setCycle] = useState<BillingCycle>('annual');

  return (
    <div className="space-y-12 py-4">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        {/* Prominent Live Ready-Stock & Price Banner */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Estoque Pronta-Entrega: {availableNfcStock} de 20 Unidades Disponíveis</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
            <span>12 Mensalidades de R$ 20,00 • Anual R$ 240,00 reais</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Escolha o Plano Ideal para Dominar as{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
            Buscas Locais no Google
          </span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Tenha cartões inteligentes NFC de aproximação em acrílico resistente com entrega imediata, perfil do Google Empresa blindado,
          posicionamento no Google Mapas, Instagram profissional e design publicitário contínuo.
        </p>

        {/* Highlight Banner: 12x R$ 20,00 ou Anual R$ 240,00 */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border border-blue-500/40 max-w-2xl mx-auto shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                ⭐ Oferta Especial de Lote Limitado
              </span>
              <div className="text-lg sm:text-xl font-black text-white">
                12 mensalidades de R$ 20,00 | Anual R$ 240,00 reais
              </div>
              <p className="text-xs text-slate-300">
                Restam <strong>{availableNfcStock} unidades</strong> prontas para pronta-entrega imediata em Rio Branco - AC.
              </p>
            </div>
            <button
              onClick={() => onSelectPlanForContract(INITIAL_PLANS[0], 'annual')}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-lg transition-transform hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              Garantir com Display NFC
            </button>
          </div>
        </div>

        {/* Monthly vs Annual Toggle */}
        <div className="pt-2 flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex items-center shadow-xl">
            <button
              onClick={() => setCycle('monthly')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                cycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Plano Mensal (Recorrente)
            </button>
            <button
              onClick={() => setCycle('annual')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                cycle === 'annual'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Plano Anual</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
                12x R$ 20,00 = R$ 240,00
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Hardware Físico Incluso nas Propostas de Plano */}
      <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Hardware Físico Incluso</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                {availableNfcStock} unidades disponíveis para pronta-entrega
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Display de Balcão NFC Google Avaliação em Acrílico Resistente
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Todas as propostas de plano incluem o <strong>Display Físico em Acrílico (modelos Branco ou Preto)</strong> configurado e testado para a sua empresa. O cliente apenas encosta o celular no chip NFC ou escaneia o QR Code dinâmico e avalia com 5 estrelas no Google na hora!
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                <Check className="w-3.5 h-3.5" />
                <span>Chip NFC de Aproximação Rápida</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                <span>QR Code Laser de Backup</span>
              </span>
              <span className="flex items-center gap-1.5 text-blue-300 font-semibold bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-xl">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Acrílico Premium Branco ou Preto</span>
              </span>
            </div>
          </div>

          <div className="relative group shrink-0">
            <div className="relative w-64 sm:w-80 h-44 sm:h-52 rounded-2xl overflow-hidden border-2 border-blue-400/50 shadow-2xl bg-slate-950 p-1">
              <img
                src="/assets/aistudio/download_29048104.webp"
                alt="Display de Balcão NFC Google Avaliação Acrílico Branco e Preto"
                className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-slate-950/85 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-2 right-2 text-center bg-slate-900/90 border border-slate-700/60 rounded-xl py-1 px-2 backdrop-blur-md">
                <span className="text-[10px] font-bold text-white block">
                  Foto Real do Display Físico Fornecido
                </span>
                <span className="text-[9px] text-emerald-400">
                  Pronta-entrega em Rio Branco e região
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
        {INITIAL_PLANS.map((plan) => {
          const isAnnual = cycle === 'annual';
          const displayedPrice = isAnnual ? plan.annualMonthlyEquivalent : plan.monthlyPrice;
          const totalAnnualCost = plan.annualPrice;
          const savings = plan.monthlyPrice * 12 - plan.annualPrice;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 border ${
                plan.popular
                  ? 'bg-slate-900/90 border-blue-500 ring-2 ring-blue-500/30 shadow-2xl shadow-blue-500/10'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-lg">
                  Mais Popular & Recomendado
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      {plan.badge}
                    </span>
                    <h3 className="text-2xl font-black text-white mt-1">
                      {plan.name}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-400 min-h-[40px] mb-4">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="mb-5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-semibold text-slate-400">R$</span>
                    <span className="text-4xl font-black text-white tracking-tight">
                      {displayedPrice.toFixed(0)}
                    </span>
                    <span className="text-slate-400 text-xs font-medium">/mês</span>
                  </div>

                  {/* Substituído faturados por unidades disponíveis e preço anual/mensal */}
                  <div className="mt-2 text-xs text-slate-300 border-t border-slate-800/60 pt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-emerald-400 font-semibold">
                      <span>Anual: {formatCurrencyBRL(totalAnnualCost)}</span>
                      <span className="text-[11px] text-slate-400">
                        {isAnnual ? '12 mensalidades' : 'Cobrança mensal'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-bold bg-cyan-950/50 border border-cyan-800/50 rounded-lg px-2.5 py-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      <span>Unidades disponíveis: {availableNfcStock} de 20 para Pronta-Entrega</span>
                    </div>
                  </div>
                </div>

                {/* Physical NFC Hardware Image Included in this Proposal */}
                <div className="mb-6 rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 group">
                  <div className="relative h-44 overflow-hidden bg-slate-950 flex items-center justify-center">
                    <img
                      src="/assets/aistudio/download_29048104.webp"
                      alt={`Cartão NFC Incluso no ${plan.name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
                    
                    {/* Badge units included */}
                    <div className="absolute top-2.5 left-2.5 bg-slate-950/90 border border-blue-500/50 text-blue-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                      <span>{plan.nfcCardCount || 1} {plan.nfcCardCount === 1 ? 'Display NFC Incluso' : 'Displays NFC Inclusos'}</span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-lg backdrop-blur-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      <span>Google 5★</span>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 text-center bg-slate-900/90 border border-slate-700/60 rounded-xl py-1 px-2 backdrop-blur-md">
                      <span className="text-[11px] font-bold text-white block">
                        Display de Balcão NFC (Acrílico Branco ou Preto)
                      </span>
                      <span className="text-[9px] text-emerald-400">
                        {plan.id === 'plan_essencial'
                          ? '1 un para recepção ou balcão'
                          : plan.id === 'plan_pro'
                          ? '2 un (balcão + atendimento/caixa)'
                          : '4 un para múltiplos pontos de atendimento'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    O que está incluso:
                  </div>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      {feature.included ? (
                        <div className={`mt-0.5 rounded-full p-0.5 shrink-0 ${
                          feature.highlight ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="mt-0.5 rounded-full p-0.5 shrink-0 bg-slate-800 text-slate-600">
                          <X className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <span className={
                        feature.included
                          ? feature.highlight
                            ? 'text-white font-semibold'
                            : 'text-slate-300'
                          : 'text-slate-600 line-through'
                      }>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-2">
                <button
                  onClick={() => onSelectPlanForContract(plan, cycle)}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  <span>Emitir Contrato deste Plano</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  Gera minuta em PDF e envia cópia para o WhatsApp imediatamente.
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 30-Second Commercial Showcase: Google Maps & NFC Proximity */}
      <div className="space-y-6 pt-4 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Play className="w-3.5 h-3.5 fill-red-400" />
            <span>Vídeo Comercial Oficial • 30 Segundos</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Como Seu Negócio é Localizado no Google Mapas & As Vantagens em 30 Segundos
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Descubra como clientes encontram sua empresa através de Mac, computadores e smartphones, traçam rotas GPS imediatas e avaliam com 5 estrelas usando o Cartão NFC da Retoma Digital.
          </p>
        </div>

        <PromoVideoPlayer
          onContractClick={() => onSelectPlanForContract(INITIAL_PLANS[1], cycle)}
          onScheduleClick={onOpenPromoVideo}
        />
      </div>

      {/* 3D Showcase Callout Banner */}
      <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-300" />
            <span>Exclusividade Retoma Digital</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Quer ver como fica o Cartão NFC personalizado com a sua marca em 3D?
          </h3>
          <p className="text-sm text-slate-300">
            Navegue pelo nosso simulador 3D interativo com tecnologia Three.js, teste a aproximação
            do smartphone e confira o acabamento em acrílico com chip NFC embutido.
          </p>
        </div>
        <button
          onClick={onOpen3DCard}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3.5 rounded-xl font-bold text-sm whitespace-nowrap shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Abrir Visualizador 3D do Cartão</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Monitor de Unidades Disponíveis para Pronta-Entrega & Preço do Plano */}
      <div className="max-w-4xl mx-auto bg-slate-900/80 border border-blue-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                ⚡ Estoque Físico Atualizado em Tempo Real
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Unidades Disponíveis para Pronta-Entrega
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Displays em acrílico resistente já prontos para pronta-entrega imediata em Rio Branco - AC.
              </p>
            </div>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-[11px] text-slate-400 uppercase font-bold block">Status do Lote:</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {availableNfcStock > 0 ? 'Despacho Imediato' : 'Esgotado'}
            </span>
          </div>
        </div>

        {/* Quantidades e Barra de Disponibilidade */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">Disponíveis Agora:</span>
            <div className="text-3xl sm:text-4xl font-black text-cyan-400">
              {availableNfcStock} <span className="text-sm font-normal text-slate-400">/ 20 un</span>
            </div>
            <p className="text-[11px] text-slate-400">Unidades prontas para entrega</p>
          </div>

          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">Já Reservadas / Entregues:</span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">
              {Math.max(0, 20 - availableNfcStock)} <span className="text-sm font-normal text-slate-400">un</span>
            </div>
            <p className="text-[11px] text-slate-400">Descontado a cada venda</p>
          </div>

          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">Prazo de Entrega:</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              Até 24h
            </div>
            <p className="text-[11px] text-slate-400">Em Rio Branco e região</p>
          </div>
        </div>

        {/* Barra de Progresso do Estoque */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-300">Progresso do Lote Físico (20 Unidades):</span>
            <span className="text-cyan-400">{availableNfcStock} unidades restantes</span>
          </div>
          <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, (availableNfcStock / 20) * 100))}%` }}
            />
          </div>
        </div>

        {/* Preço do Plano Destacado na Linha */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-slate-950 border border-blue-500/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[11px] font-black uppercase">
              Condição Comercial Fixada
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              12 mensalidades de R$ 20,00 | Anual R$ 240,00 reais
            </div>
            <p className="text-xs text-slate-300">
              Inclui Display em Acrílico Branco ou Preto com NFC Google 5★ e QR Code laser.
            </p>
          </div>

          <button
            onClick={() => onSelectPlanForContract(INITIAL_PLANS[0], 'annual')}
            className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl shadow-xl transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
          >
            <span>Emitir Contrato (12x R$ 20,00)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile App APK / Home Screen Launcher Promo Card */}
      {onOpenInstallModal && (
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-cyan-500/30 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
              <Smartphone className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">
                  💿 Aplicativo Retoma na Tela Inicial do seu Celular
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase">
                  PWA / APK
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Instale agora para acessar offline, demonstrar para clientes sem navegador e emitir contratos instantaneamente em visitas presenciais.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenInstallModal}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs whitespace-nowrap shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Instalar Aplicativo Agora</span>
          </button>
        </div>
      )}
    </div>
  );
};

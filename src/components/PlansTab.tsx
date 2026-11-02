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
}

export const PlansTab: React.FC<PlansTabProps> = ({
  onSelectPlanForContract,
  onOpen3DCard,
  onOpenInstallModal,
  onOpenPromoVideo,
}) => {
  const [cycle, setCycle] = useState<BillingCycle>('annual');
  const [monthlyClients, setMonthlyClients] = useState<number>(30);
  const [ticketValue, setTicketValue] = useState<number>(85);

  // Estimativa comercial corrigida para 30 clientes (Meta da Diretoria)
  const estimatedNewCustomers = Math.round(monthlyClients * 0.40); // 40% de conversão com avaliações 5 estrelas
  const estimatedMonthlyGain = monthlyClients * ticketValue;
  const estimatedAnnualGain = estimatedMonthlyGain * 12;

  return (
    <div className="space-y-12 py-4">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Aceleração Comercial & Inteligência Google</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Escolha o Plano Ideal para Dominar as{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
            Buscas Locais no Google
          </span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Tenha cartões inteligentes NFC de aproximação, perfil do Google Empresa blindado,
          posicionamento no Google Mapas, Instagram profissional e design publicitário contínuo.
        </p>

        {/* Monthly vs Annual Toggle */}
        <div className="pt-4 flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex items-center shadow-xl">
            <button
              onClick={() => setCycle('monthly')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                cycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Plano Mensal
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
                Economize 20%
              </span>
            </button>
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

                <p className="text-xs text-slate-400 min-h-[40px] mb-6">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="mb-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-semibold text-slate-400">R$</span>
                    <span className="text-4xl font-black text-white tracking-tight">
                      {displayedPrice.toFixed(0)}
                    </span>
                    <span className="text-slate-400 text-xs font-medium">/mês</span>
                  </div>

                  {isAnnual ? (
                    <div className="mt-2 text-xs text-emerald-400 font-medium flex items-center justify-between border-t border-slate-800/60 pt-2">
                      <span>Faturado {formatCurrencyBRL(totalAnnualCost)} / ano</span>
                      <span className="bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        Economiza {formatCurrencyBRL(savings)}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-slate-400 border-t border-slate-800/60 pt-2">
                      Cobrança mensal recorrente sem fidelidade.
                    </div>
                  )}
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

      {/* Interactive ROI Calculator */}
      <div className="max-w-4xl mx-auto bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Simulador de Retorno Financeiro (ROI)
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Calcule quanto sua empresa pode faturar a mais aparecendo no topo do Google com avaliações 5 estrelas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Clientes estimados / convertidos por mês:</span>
                <span className="text-blue-400 font-bold text-sm">{monthlyClients} clientes</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={monthlyClients}
                onChange={(e) => setMonthlyClients(Number(e.target.value))}
                className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex gap-2 mt-2">
                {[10, 20, 30, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMonthlyClients(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      monthlyClients === preset
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {preset === 30 ? '⭐ 30 Clientes (Meta Fixada)' : `${preset} Clientes`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Ticket Médio por cliente (R$):</span>
                <span className="text-emerald-400 font-bold text-sm">{formatCurrencyBRL(ticketValue)}</span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="5"
                value={ticketValue}
                onChange={(e) => setTicketValue(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl text-xs text-slate-400 space-y-1 border border-slate-800">
              <p>• 88% dos consumidores confiam em avaliações no Google como em recomendações pessoais.</p>
              <p>• Empresas com mais de 100 avaliações 5 estrelas recebem 3x mais rotas no Google Maps.</p>
            </div>
          </div>

          {/* Results card */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 rounded-2xl border border-blue-500/30 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Faturamento Estimado Extra
            </span>
            <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight">
              +{formatCurrencyBRL(estimatedMonthlyGain)}
              <span className="text-xs text-slate-400 block font-normal mt-1">/mês em vendas adicionais</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-left">
              <div>
                <span className="text-[11px] text-slate-400 block">Novos clientes/mês</span>
                <span className="text-lg font-bold text-white">+{estimatedNewCustomers} clientes</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Retorno Anual Previsto</span>
                <span className="text-lg font-bold text-emerald-400">+{formatCurrencyBRL(estimatedMonthlyGain * 12)}</span>
              </div>
            </div>
          </div>
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

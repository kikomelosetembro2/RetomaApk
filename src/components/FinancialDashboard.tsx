import React, { useState } from 'react';
import { ContractItem, Broker } from '../types';
import { RETOMA_WHATSAPP_OFFICIAL, RETOMA_PHONE_DISPLAY, INITIAL_BROKERS } from '../data/initialData';
import { formatCurrencyBRL, formatDateTimeBR, getWhatsAppContractUrl, getWhatsAppCommissionNoticeUrl } from '../utils/whatsapp';
import { generateContractPDF, generateCommissionVoucherPDF } from '../utils/pdfGenerator';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  FileText, 
  Download, 
  MessageCircle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Share2,
  Calendar,
  Layers,
  ArrowUpRight,
  Users,
  Copy,
  Check,
  Target,
  Award,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FinancialDashboardProps {
  contracts: ContractItem[];
  brokers?: Broker[];
  onOpenContractModal: (contract: ContractItem) => void;
  onNewContractClick: () => void;
  onPayCommission?: (contractId: string) => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  contracts,
  brokers = INITIAL_BROKERS,
  onOpenContractModal,
  onNewContractClick,
  onPayCommission,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBrokerFilter, setSelectedBrokerFilter] = useState<string>('all');
  const [copiedPixId, setCopiedPixId] = useState<string | null>(null);
  const [projectedScenario, setProjectedScenario] = useState<'pro' | 'start' | 'elite' | 'average'>('pro');

  const handleCopyPix = (pixKey: string, id: string) => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPixId(id);
    setTimeout(() => setCopiedPixId(null), 2500);
  };

  const handlePay = (contractId: string) => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignored
    }
    if (onPayCommission) {
      onPayCommission(contractId);
    }
  };

  const handleDownloadCommissionReceipt = (contract: ContractItem, brokerName: string, pixKey?: string) => {
    const pdf = generateCommissionVoucherPDF(contract, brokerName, pixKey);
    pdf.save(`Recibo_Comissao_50%_${contract.contractNumber}_${brokerName.replace(/\s+/g, '_')}.pdf`);
  };

  // Compute Metrics
  const totalFaturadoGlobal = contracts.reduce((sum, c) => sum + c.totalValue, 0);
  
  // MRR: Monthly recurring plans + monthly equivalent of annual plans
  const mrr = contracts.reduce((sum, c) => {
    if (c.status !== 'active') return sum;
    if (c.billingCycle === 'annual') {
      return sum + c.totalValue / 12;
    }
    return sum + c.totalValue;
  }, 0);

  const arr = mrr * 12;

  const activeContractsCount = contracts.filter((c) => c.status === 'active').length;
  const averageTicket = contracts.length > 0 ? totalFaturadoGlobal / contracts.length : 0;

  // NFC cards count
  const nfcCardsTotal = contracts.reduce((sum, c) => {
    const cardProd = c.selectedProducts.find((p) => p.productId === 'prod_nfc_card');
    return sum + (cardProd ? cardProd.quantity : 1);
  }, 0);

  // Projeção Fixada para 30 Clientes (Conforme solicitação da Diretoria)
  const TARGET_CLIENTS = 30;
  const targetProgressPct = Math.min(100, Math.round((activeContractsCount / TARGET_CLIENTS) * 100));
  const remainingClients = Math.max(0, TARGET_CLIENTS - activeContractsCount);

  const scenarioPricing = {
    start: {
      name: 'Plano Start Local',
      monthly: 119,
      annual: 1428,
      nfcCount: 1,
    },
    pro: {
      name: 'Plano Pro Aceleração (Recomendado)',
      monthly: 229,
      annual: 2748,
      nfcCount: 2,
    },
    elite: {
      name: 'Plano Elite Retoma',
      monthly: 399,
      annual: 4788,
      nfcCount: 4,
    },
    average: {
      name: 'Ticket Médio dos Fechamentos',
      monthly: Math.round((averageTicket || 2748) / 12),
      annual: Math.round(averageTicket || 2748),
      nfcCount: 2,
    },
  };

  const currentScenario = scenarioPricing[projectedScenario];
  const projected30Monthly = TARGET_CLIENTS * currentScenario.monthly;
  const projected30Annual = TARGET_CLIENTS * currentScenario.annual;
  const projected30BrokerCommissionAnnual = projected30Annual * 0.50;
  const projected30RetomaNetAnnual = projected30Annual * 0.50;
  const projected30BrokerCommissionMonthly = projected30Monthly * 0.50;
  const projected30RetomaNetMonthly = projected30Monthly * 0.50;
  const projected30NfcCards = TARGET_CLIENTS * currentScenario.nfcCount;

  // Filtered Contracts
  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.client.documentNumber.includes(searchTerm) ||
      (c.client.representativeName && c.client.representativeName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Numero_Contrato', 'Data', 'Cliente', 'CNPJ_CPF', 'Plano', 'Ciclo', 'Valor_Total', 'Forma_Pagamento', 'Corretor', 'Comissao_50%', 'Status_Comissao', 'Status_Contrato'];
    const rows = contracts.map((c) => [
      c.contractNumber,
      new Date(c.signedAt).toLocaleDateString('pt-BR'),
      `"${c.client.companyName.replace(/"/g, '""')}"`,
      c.client.documentNumber,
      `"${c.planName || 'Personalizado'}"`,
      c.billingCycle || 'mensal',
      c.totalValue.toFixed(2),
      c.paymentMethod,
      `"${c.brokerName || 'Direto'}"`,
      (c.commissionValue || c.totalValue * 0.5).toFixed(2),
      c.commissionStatus || 'pending',
      c.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relatorio_Financeiro_Comissoes_Retoma_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = (contract: ContractItem) => {
    try {
      const pdf = generateContractPDF(contract);
      pdf.save(`Contrato_${contract.contractNumber}_${contract.client.tradeName || contract.client.companyName}.pdf`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="py-6 space-y-8 max-w-7xl mx-auto">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Métricas em Tempo Real</span>
          </div>
          <h2 className="text-3xl font-black text-white">
            Dashboard Financeiro & Gestão de Contratos
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Acompanhe o faturamento consolidado, receita recorrente (MRR/ARR) e contratos emitidos pela Retoma Digital.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV (Excel)</span>
          </button>

          <button
            onClick={onNewContractClick}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-lg cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>+ Novo Contrato</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              MRR (Receita Recorrente Mensal)
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-3">
            {formatCurrencyBRL(mrr)}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Fluxo mensal garantido</span>
          </div>
        </div>

        {/* ARR */}
        <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              ARR (Projeção Anual)
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-300 mt-3">
            {formatCurrencyBRL(arr)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Base anualizada de contratos
          </div>
        </div>

        {/* Total Contratado */}
        <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Faturado no Sistema
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-3">
            {formatCurrencyBRL(totalFaturadoGlobal)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Ticket Médio: <strong>{formatCurrencyBRL(averageTicket)}</strong>
          </div>
        </div>

        {/* Contratos Ativos & Cartões */}
        <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Contratos & Cartões NFC
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-3">
            {activeContractsCount} <span className="text-xs text-slate-400 font-normal">ativos</span>
          </div>
          <div className="text-[11px] text-amber-400 font-semibold mt-2">
            {nfcCardsTotal} Cartões NFC em circulação
          </div>
        </div>
      </div>

      {/* Meta Comercial Fixada para 30 Clientes */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/60 border border-blue-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              <span>Meta Comercial Estratégica: Apenas 30 Clientes</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Projeção de Faturamento & Comissões (Base 30 Clientes)
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Valores corrigidos estimando uma carteira de 30 clientes ativos com comissão de 50% para corretores.
            </p>
          </div>

          {/* Scenario Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 px-2 hidden sm:inline">Cenário:</span>
            {[
              { id: 'start' as const, label: 'Start (R$ 119)' },
              { id: 'pro' as const, label: 'Pro (R$ 229) ⭐' },
              { id: 'elite' as const, label: 'Elite (R$ 399)' },
              { id: 'average' as const, label: 'Média Atual' },
            ].map((scen) => (
              <button
                key={scen.id}
                type="button"
                onClick={() => setProjectedScenario(scen.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  projectedScenario === scen.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {scen.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Towards 30 Clients */}
        <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Progresso da Meta:</span>
              <span className="text-blue-400 font-extrabold text-sm">{activeContractsCount} de {TARGET_CLIENTS} clientes</span>
              <span className="text-slate-500">({remainingClients === 0 ? 'Meta atingida!' : `Faltam ${remainingClients} contratos`})</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <span>{targetProgressPct}% atingido</span>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${targetProgressPct}%` }}
            />
          </div>
        </div>

        {/* 4 Cards breakdown for 30 clients */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Faturamento Anual (ARR) */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="uppercase font-bold text-[10px]">ARR Previsto (30 Clientes)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {formatCurrencyBRL(projected30Annual)}
            </div>
            <p className="text-[11px] text-slate-400">
              {TARGET_CLIENTS} contratos faturados anualmente
            </p>
          </div>

          {/* Card 2: Faturamento Mensal Recorrente (MRR) */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="uppercase font-bold text-[10px]">MRR Recorrente (30 Clientes)</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400">
              {formatCurrencyBRL(projected30Monthly)}
              <span className="text-xs text-slate-400 font-normal">/mês</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Fluxo contínuo de caixa mensal
            </p>
          </div>

          {/* Card 3: Comissão Total dos Corretores (50%) */}
          <div className="bg-slate-950/70 border border-purple-900/40 p-4 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-xs text-purple-300">
              <span className="uppercase font-bold text-[10px]">Comissões Corretores (50%)</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-300">
              {formatCurrencyBRL(projected30BrokerCommissionAnnual)}
            </div>
            <p className="text-[11px] text-slate-400">
              {formatCurrencyBRL(projected30BrokerCommissionMonthly)}/mês dividido aos corretores
            </p>
          </div>

          {/* Card 4: Lucro Líquido Retoma Digital */}
          <div className="bg-slate-950/70 border border-emerald-900/40 p-4 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-xs text-emerald-300">
              <span className="uppercase font-bold text-[10px]">Lucro Líquido Retoma (50%)</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {formatCurrencyBRL(projected30RetomaNetAnnual)}
            </div>
            <p className="text-[11px] text-slate-400">
              {formatCurrencyBRL(projected30RetomaNetMonthly)}/mês após pagar comissões
            </p>
          </div>
        </div>

        {/* Operational Note for 30 Clients */}
        <div className="p-3.5 bg-blue-950/30 border border-blue-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-500/20 text-blue-400 font-bold">30</span>
            <span>Com <strong>30 clientes</strong> na carteira, serão emitidos <strong>{projected30NfcCards} Cartões NFC Google Avaliação</strong> ativos no comércio.</span>
          </div>
          <span className="text-emerald-400 font-bold shrink-0">Comissão garantida de 50% por contrato</span>
        </div>
      </div>

      {/* Visual Revenue Breakdown & Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Timeline Chart */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Evolução do Faturamento Mensal (R$)</h3>
              <p className="text-xs text-slate-400">Histórico de fechamentos e receita recorrente</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
              +38% vs Mês Anterior
            </span>
          </div>

          {/* Bar Chart Mockup */}
          <div className="pt-4 h-48 flex items-end justify-between gap-3 px-2 border-b border-slate-800 pb-2">
            {[
              { month: 'Jun', val: 3200, height: '35%' },
              { month: 'Jul', val: 4100, height: '45%' },
              { month: 'Ago', val: 5600, height: '60%' },
              { month: 'Set', val: 6800, height: '72%' },
              { month: 'Out', val: 8900, height: '88%' },
              { month: 'Nov (Proj)', val: 11500, height: '100%', highlight: true },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatCurrencyBRL(bar.val)}
                </span>
                <div
                  style={{ height: bar.height }}
                  className={`w-full max-w-[48px] rounded-t-xl transition-all ${
                    bar.highlight
                      ? 'bg-gradient-to-t from-blue-600 to-indigo-500'
                      : 'bg-slate-800 group-hover:bg-blue-600/70'
                  }`}
                />
                <span className="text-[11px] font-semibold text-slate-400">
                  {bar.month}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <span>• Meta Fixada: <strong>30 Clientes ({formatCurrencyBRL(projected30Annual)}/ano)</strong></span>
            <span>• Atingimento: <strong className="text-emerald-400">{targetProgressPct}% ({activeContractsCount}/30)</strong></span>
          </div>
        </div>

        {/* Revenue Distribution by Solution */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Distribuição por Solução</h3>
            <p className="text-xs text-slate-400">Origem da receita dos contratos</p>

            <div className="space-y-3.5 mt-5">
              {[
                { name: 'Planos Mensais & Anuais', pct: 54, color: 'bg-blue-500' },
                { name: 'Cartões NFC Google Avaliação', pct: 22, color: 'bg-amber-500' },
                { name: 'Implantação Google Empresa & Mapas', pct: 14, color: 'bg-emerald-500' },
                { name: 'Instagram & Design de Posts', pct: 10, color: 'bg-purple-500' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.name}</span>
                    <span className="text-slate-400 font-bold">{item.pct}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400">
            💡 <strong>Insight:</strong> Os planos anuais aumentaram a retenção em 94% e garantem fluxo de caixa antecipado.
          </div>
        </div>
      </div>

      {/* Relatório de Vendas de Corretores no Dashboard */}
      <div className="bg-slate-900/70 border border-purple-900/40 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Painel de Desempenho Comercial</span>
            </div>
            <h3 className="text-xl font-bold text-white">Relatório de Vendas & Comissões dos Corretores (50%)</h3>
            <p className="text-xs text-slate-400">
              Desempenho de vendas de Francisco Araújo, Bernardo Araújo, Witor Araújo e equipe com comissão de 50%.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Comissão por Venda:</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-xl border border-emerald-500/30">
              50% por Contrato
            </span>
          </div>
        </div>

        {/* Brokers KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Comissões Geradas (50%)</span>
            <div className="text-2xl font-black text-white mt-1">
              {formatCurrencyBRL(contracts.reduce((sum, c) => sum + (c.commissionValue || c.totalValue * 0.5), 0))}
            </div>
            <span className="text-[10px] text-slate-500">50% do faturamento de contratos</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] font-bold text-emerald-400 uppercase">Comissões Pagas via Pix</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {formatCurrencyBRL(
                contracts
                  .filter((c) => c.commissionStatus === 'paid')
                  .reduce((sum, c) => sum + (c.commissionValue || c.totalValue * 0.5), 0)
              )}
            </div>
            <span className="text-[10px] text-emerald-500">Liquidadas para os corretores</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[11px] font-bold text-amber-400 uppercase">Comissões A Pagar (Pendentes)</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {formatCurrencyBRL(
                contracts
                  .filter((c) => c.commissionStatus !== 'paid')
                  .reduce((sum, c) => sum + (c.commissionValue || c.totalValue * 0.5), 0)
              )}
            </div>
            <span className="text-[10px] text-amber-400/80">Aguardando transferência Pix</span>
          </div>
        </div>

        {/* Brokers Individual Performance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {brokers.map((broker) => {
            const bContracts = contracts.filter(
              (c) => c.brokerId === broker.id || c.brokerName?.toLowerCase() === broker.name.toLowerCase()
            );
            const totalFaturado = bContracts.reduce((sum, c) => sum + c.totalValue, 0);
            const totalComissao = bContracts.reduce((sum, c) => sum + (c.commissionValue || c.totalValue * 0.5), 0);
            const pendente = bContracts
              .filter((c) => c.commissionStatus !== 'paid')
              .reduce((sum, c) => sum + (c.commissionValue || c.totalValue * 0.5), 0);

            const isCopied = copiedPixId === broker.id;

            return (
              <div
                key={broker.id}
                className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-3 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-black text-white text-base">{broker.name}</h4>
                    <span className="text-[10px] text-slate-400">{bContracts.length} contratos fechados</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                    {broker.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-800/60 py-2.5">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Vendas Totais</span>
                    <span className="font-bold text-slate-200">{formatCurrencyBRL(totalFaturado)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Comissão (50%)</span>
                    <span className="font-bold text-emerald-400">{formatCurrencyBRL(totalComissao)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Pendente Pix:</span>
                  <span className={`font-bold ${pendente > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {pendente > 0 ? formatCurrencyBRL(pendente) : '✓ Quitado'}
                  </span>
                </div>

                {/* Pix key and copy */}
                <div className="pt-1 flex items-center justify-between gap-1 text-[11px] bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  <span className="font-mono text-emerald-400 truncate text-[10px]">{broker.pixKey}</span>
                  <button
                    onClick={() => handleCopyPix(broker.pixKey, broker.id)}
                    className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer shrink-0 text-[10px]"
                    title="Copiar Pix"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'OK' : 'Pix'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contracts Table Section */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Todos os Contratos Registrados</h3>
            <p className="text-xs text-slate-400">
              Emissão de PDF, comissão de 50%, envio para WhatsApp e acompanhamento de vigência.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por cliente, contrato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs text-white pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-white px-3 py-2 rounded-xl focus:outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="pending">Pendentes</option>
              <option value="completed">Concluídos</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Contrato</th>
                <th className="py-3 px-4">Cliente / Razão Social</th>
                <th className="py-3 px-4">Corretor (50%)</th>
                <th className="py-3 px-4">Plano / Itens</th>
                <th className="py-3 px-4">Valor Total</th>
                <th className="py-3 px-4">Comissão (50%)</th>
                <th className="py-3 px-4">Status Pix</th>
                <th className="py-3 px-4 text-right">Ações Oficiais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredContracts.map((c) => {
                const whatsOfficialUrl = getWhatsAppContractUrl(c, RETOMA_WHATSAPP_OFFICIAL);
                const whatsClientUrl = getWhatsAppContractUrl(c, c.client.whatsapp);
                const commVal = c.commissionValue || c.totalValue * 0.5;
                const isCommPaid = c.commissionStatus === 'paid';
                const broker = brokers.find((b) => b.id === c.brokerId || b.name === c.brokerName);

                return (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-400 whitespace-nowrap">
                      {c.contractNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{c.client.companyName}</div>
                      <div className="text-[11px] text-slate-400">
                        {c.client.documentNumber} • {c.client.representativeName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-purple-300">
                        {c.brokerName || 'Francisco Araújo'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {broker ? `Pix: ${broker.pixKey}` : 'Corretor'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">
                        {c.planName || 'Personalizado'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {c.billingCycle === 'annual' ? 'Anual (12M)' : 'Mensal'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-white whitespace-nowrap">
                      {formatCurrencyBRL(c.totalValue)}
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-400 whitespace-nowrap">
                      {formatCurrencyBRL(commVal)}
                    </td>
                    <td className="py-3.5 px-4">
                      {isCommPaid ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Pix Pago</span>
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            Pendente
                          </span>
                          <button
                            onClick={() => handlePay(c.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2 py-0.5 rounded transition-colors cursor-pointer"
                          >
                            Pagar
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Baixar PDF Contrato */}
                        <button
                          onClick={() => handleDownloadPDF(c)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                          title="Baixar Contrato em PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Baixar Recibo de Comissão PDF */}
                        <button
                          onClick={() => handleDownloadCommissionReceipt(c, c.brokerName || 'Francisco Araújo', broker?.pixKey)}
                          className="p-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 text-purple-300 transition-colors cursor-pointer"
                          title="Baixar Recibo de Comissão (50%) em PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Enviar WhatsApp Oficial 68 99282-7744 */}
                        <a
                          href={whatsOfficialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-colors cursor-pointer"
                          title="Enviar Contrato para WhatsApp Oficial (68) 99282-7744"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        {/* Visualizar Detalhes */}
                        <button
                          onClick={() => onOpenContractModal(c)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          Detalhes
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredContracts.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              Nenhum contrato encontrado para os filtros selecionados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

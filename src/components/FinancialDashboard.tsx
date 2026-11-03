import React, { useState } from 'react';
import { ContractItem, Broker, AuthUser } from '../types';
import { RETOMA_WHATSAPP_OFFICIAL, INITIAL_BROKERS } from '../data/initialData';
import { formatCurrencyBRL, formatDateTimeBR, getWhatsAppContractUrl } from '../utils/whatsapp';
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
  CheckCircle2, 
  Layers, 
  ArrowUpRight, 
  Users, 
  Copy, 
  Check, 
  Target, 
  Zap,
  Lock,
  ShieldCheck,
  PieChart as PieChartIcon,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface FinancialDashboardProps {
  contracts: ContractItem[];
  brokers?: Broker[];
  currentUser?: AuthUser | null;
  onOpenContractModal: (contract: ContractItem) => void;
  onNewContractClick: () => void;
  onPayCommission?: (contractId: string) => void;
  onNavigateToBrokersTab?: () => void;
  onOpenAuthModal?: () => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  contracts,
  brokers = INITIAL_BROKERS,
  currentUser,
  onOpenContractModal,
  onNewContractClick,
  onPayCommission,
  onNavigateToBrokersTab,
  onOpenAuthModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedPixId, setCopiedPixId] = useState<string | null>(null);
  const [projectedScenario, setProjectedScenario] = useState<'pro' | 'start' | 'elite' | 'average'>('pro');
  const [pieMetric, setPieMetric] = useState<'value' | 'count'>('value');
  const [showAdminCommissionsInDash, setShowAdminCommissionsInDash] = useState<boolean>(true);

  const isAdmin = currentUser?.role === 'admin';

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
  const projected30NfcCards = TARGET_CLIENTS * currentScenario.nfcCount;

  // ==========================================
  // RECHARTS DATA PREPARATION
  // ==========================================

  // 1. Gráfico de Pizza: Distribuição de Vendas por Tipo de Plano
  const planSalesAgg = contracts.reduce((acc, c) => {
    const rawName = c.planName || 'Personalizado / Avulso';
    let key = 'Personalizado / Avulso';
    if (rawName.toLowerCase().includes('start') || rawName.toLowerCase().includes('essencial')) {
      key = 'Plano Start Local';
    } else if (rawName.toLowerCase().includes('pro') || rawName.toLowerCase().includes('acelera')) {
      key = 'Plano Pro Aceleração';
    } else if (rawName.toLowerCase().includes('elite')) {
      key = 'Plano Elite Retoma';
    }

    if (!acc[key]) {
      acc[key] = { name: key, totalValue: 0, count: 0 };
    }
    acc[key].totalValue += c.totalValue;
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, { name: string; totalValue: number; count: number }>);

  const PLAN_COLOR_MAP: Record<string, string> = {
    'Plano Pro Aceleração': '#3b82f6', // Azul brilhante
    'Plano Start Local': '#10b981',    // Esmeralda
    'Plano Elite Retoma': '#8b5cf6',   // Roxo
    'Personalizado / Avulso': '#f59e0b', // Âmbar
  };

  const pieChartData = Object.keys(planSalesAgg).length > 0
    ? Object.values(planSalesAgg).map((item) => ({
        ...item,
        value: pieMetric === 'value' ? item.totalValue : item.count,
        color: PLAN_COLOR_MAP[item.name] || '#06b6d4',
      }))
    : [
        { name: 'Plano Pro Aceleração', totalValue: 2748, count: 1, value: pieMetric === 'value' ? 2748 : 1, color: '#3b82f6' },
        { name: 'Plano Start Local', totalValue: 149, count: 1, value: pieMetric === 'value' ? 149 : 1, color: '#10b981' },
        { name: 'Plano Elite Retoma', totalValue: 4788, count: 1, value: pieMetric === 'value' ? 4788 : 1, color: '#8b5cf6' },
      ];

  const totalPieSum = pieChartData.reduce((sum, item) => sum + item.value, 0);

  // 2. Gráfico de Linhas: Faturamento Mensal Acumulado
  // Evolução cronológica com histórico consolidado e acumulação progressiva
  const monthlyTimelineBase = [
    { month: 'Jun/26', label: 'Junho 2026', revenue: 3200 },
    { month: 'Jul/26', label: 'Julho 2026', revenue: 4100 },
    { month: 'Ago/26', label: 'Agosto 2026', revenue: 5600 },
    { month: 'Set/26', label: 'Setembro 2026', revenue: 6800 },
    { month: 'Out/26', label: 'Outubro 2026', revenue: 7685 },
    { month: 'Nov/26', label: 'Novembro 2026 (Atual)', revenue: 11500 },
  ];

  let cumulativeSum = 0;
  const lineChartData = monthlyTimelineBase.map((item) => {
    cumulativeSum += item.revenue;
    return {
      month: item.month,
      label: item.label,
      receitaMensal: item.revenue,
      faturamentoAcumulado: cumulativeSum,
    };
  });

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
    // Se não for admin, exporta sem colunas de comissão
    const headers = isAdmin
      ? ['Numero_Contrato', 'Data', 'Cliente', 'CNPJ_CPF', 'Plano', 'Ciclo', 'Valor_Total', 'Forma_Pagamento', 'Corretor', 'Comissao_50%', 'Status_Comissao', 'Status_Contrato']
      : ['Numero_Contrato', 'Data', 'Cliente', 'CNPJ_CPF', 'Plano', 'Ciclo', 'Valor_Total', 'Forma_Pagamento', 'Status_Contrato'];

    const rows = contracts.map((c) => {
      const baseRow = [
        c.contractNumber,
        new Date(c.signedAt).toLocaleDateString('pt-BR'),
        `"${c.client.companyName.replace(/"/g, '""')}"`,
        c.client.documentNumber,
        `"${c.planName || 'Personalizado'}"`,
        c.billingCycle || 'mensal',
        c.totalValue.toFixed(2),
        c.paymentMethod,
      ];

      if (isAdmin) {
        baseRow.push(
          `"${c.brokerName || 'Direto'}"`,
          (c.commissionValue || c.totalValue * 0.5).toFixed(2),
          c.commissionStatus || 'pending'
        );
      }
      baseRow.push(c.status);
      return baseRow;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relatorio_Financeiro_Retoma_${new Date().toISOString().split('T')[0]}.csv`);
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
            <span>Métricas Oficiais em Tempo Real</span>
          </div>
          <h2 className="text-3xl font-black text-white">
            Dashboard Financeiro & Gestão de Contratos
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Acompanhe o faturamento consolidado, receita acumulada, MRR/ARR e contratos emitidos pela Retoma Digital.
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
            <span>Fluxo mensal contínuo</span>
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
              Projeção de Faturamento Consolidado (Base 30 Clientes)
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Valores corrigidos estimando uma carteira sólida de 30 clientes comerciais ativos na Retoma Digital.
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

        {/* 4 Cards breakdown for 30 clients (Sem exibição de comissão para público geral) */}
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

          {/* Card 3: Ticket Médio Anualizado por Cliente */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-xs text-indigo-300">
              <span className="uppercase font-bold text-[10px]">Ticket Médio Anual</span>
              <Target className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-indigo-300">
              {formatCurrencyBRL(currentScenario.annual)}
            </div>
            <p className="text-[11px] text-slate-400">
              Média por estabelecimento parceiro
            </p>
          </div>

          {/* Card 4: Hardware NFC Ativo */}
          <div className="bg-slate-950/70 border border-emerald-900/40 p-4 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-xs text-emerald-300">
              <span className="uppercase font-bold text-[10px]">Cartões NFC Ativos</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {projected30NfcCards} un
            </div>
            <p className="text-[11px] text-slate-400">
              Pontos de coleta de 5 estrelas no comércio
            </p>
          </div>
        </div>

        {/* Operational Note for 30 Clients */}
        <div className="p-3.5 bg-blue-950/30 border border-blue-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-500/20 text-blue-400 font-bold">30</span>
            <span>Com <strong>30 clientes</strong> na carteira, a Retoma alcança receita estável e consolidação da marca na região de Rio Branco e Acre.</span>
          </div>
          <span className="text-emerald-400 font-bold shrink-0">Meta Estratégica Oficial</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* GRÁFICOS RECHARTS: LINHAS (ACUMULADO) E PIZZA (PLANOS)    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GRÁFICO DE LINHAS: Faturamento Mensal Acumulado (7 colunas) */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Curva de Crescimento</span>
                </div>
                <h3 className="text-lg font-black text-white">Faturamento Mensal Acumulado</h3>
                <p className="text-xs text-slate-400">
                  Evolução cronológica da receita mensal e crescimento acumulado no período
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                  Acumulado: {formatCurrencyBRL(lineChartData[lineChartData.length - 1].faturamentoAcumulado)}
                </span>
              </div>
            </div>

            {/* Recharts Line Chart */}
            <div className="w-full h-72 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="lineColorGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-2xl shadow-2xl backdrop-blur-md text-xs space-y-1.5">
                            <div className="font-bold text-white border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
                              <span>{data.label}</span>
                              <span className="text-[10px] text-slate-400">{data.month}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-cyan-400">
                              <span>Faturamento Acumulado:</span>
                              <span className="font-mono font-bold text-sm">{formatCurrencyBRL(data.faturamentoAcumulado)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-emerald-400">
                              <span>Receita do Mês:</span>
                              <span className="font-mono font-semibold">{formatCurrencyBRL(data.receitaMensal)}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <RechartsLegend 
                    verticalAlign="top" 
                    align="right" 
                    height={32}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }}
                  />
                  <Line
                    type="monotone"
                    name="Faturamento Acumulado"
                    dataKey="faturamentoAcumulado"
                    stroke="url(#lineColorGradient)"
                    strokeWidth={3.5}
                    dot={{ fill: '#0284c7', r: 5, stroke: '#38bdf8', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    name="Receita do Mês"
                    dataKey="receitaMensal"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ fill: '#059669', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <span>• Base consolidada com fechamentos mensais e projeção da carteira</span>
            <span className="text-cyan-400 font-semibold">Meta 30: {formatCurrencyBRL(projected30Annual)}/ano</span>
          </div>
        </div>

        {/* GRÁFICO DE PIZZA: Distribuição por Tipo de Plano (5 colunas) */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                  <PieChartIcon className="w-3 h-3" />
                  <span>Mix de Planos</span>
                </div>
                <h3 className="text-lg font-black text-white">Vendas por Tipo de Plano</h3>
                <p className="text-xs text-slate-400">Distribuição percentual da receita</p>
              </div>

              {/* Toggle Metric */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setPieMetric('value')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    pieMetric === 'value' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  R$ Valor
                </button>
                <button
                  type="button"
                  onClick={() => setPieMetric('count')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    pieMetric === 'count' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Qtd
                </button>
              </div>
            </div>

            {/* Recharts Pie Chart */}
            <div className="w-full h-56 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        const pct = totalPieSum > 0 ? ((item.value / totalPieSum) * 100).toFixed(1) : '0';
                        return (
                          <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-2xl shadow-xl backdrop-blur-md text-xs space-y-1">
                            <div className="font-bold text-white flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              <span>{item.name}</span>
                            </div>
                            <div className="text-slate-300">
                              Faturamento: <strong className="text-white font-mono">{formatCurrencyBRL(item.totalValue)}</strong>
                            </div>
                            <div className="text-slate-400">
                              Contratos: <strong className="text-white">{item.count} un</strong> ({pct}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Interactive Legend Badges */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {pieChartData.map((item, idx) => {
                const pct = totalPieSum > 0 ? Math.round((item.value / totalPieSum) * 100) : 0;
                return (
                  <div key={idx} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-slate-200 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{item.count} contratos</span>
                        <span className="font-bold text-white">{pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <span className="text-blue-400 font-bold shrink-0">💡 Destaque:</span>
            <span>O <strong>Plano Pro Aceleração</strong> é o mais representativo por incluir cartões NFC + Google Mapas + Instagram.</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SEÇÃO DE COMISSÕES DOS CORRETORES: APENAS NO PAINEL ADM   */}
      {/* ======================================================== */}
      {isAdmin ? (
        /* PAINEL ADMINISTRATIVO AUTORIZADO (Exibição apenas para administradores autenticados) */
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-purple-950/50 border border-purple-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Painel Administrativo da Diretoria • Acesso Exclusivo</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Gestão de Comissões dos Consultores (50%)
              </h3>
              <p className="text-xs text-slate-300">
                Visualização restrita da equipe de corretores credenciados (Francisco Araújo, Bernardo Araújo, Witor Araújo e Etevino de Araújo).
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onNavigateToBrokersTab && (
                <button
                  onClick={onNavigateToBrokersTab}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Abrir Gestão Completa de Corretores</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Brokers KPI Summary para Administração */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/80 border border-purple-900/40 p-4 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Comissões Geradas (50%)</span>
              <div className="text-2xl font-black text-purple-300 mt-1">
                {formatCurrencyBRL(contracts.reduce((sum, c) => sum + (c.commissionValue || c.totalValue * 0.5), 0))}
              </div>
              <span className="text-[10px] text-slate-500">50% do total faturado dos contratos</span>
            </div>
            <div className="bg-slate-950/80 border border-emerald-900/40 p-4 rounded-2xl">
              <span className="text-[11px] font-bold text-emerald-400 uppercase">Comissões Pagas via Pix</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {formatCurrencyBRL(
                  contracts
                    .filter((c) => c.commissionStatus === 'paid')
                    .reduce((sum, c) => sum + (c.commissionValue || c.totalValue * 0.5), 0)
                )}
              </div>
              <span className="text-[10px] text-emerald-500">Transferências Pix já liquidadas</span>
            </div>
            <div className="bg-slate-950/80 border border-amber-900/40 p-4 rounded-2xl">
              <span className="text-[11px] font-bold text-amber-400 uppercase">Comissões Pendentes</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {formatCurrencyBRL(
                  contracts
                    .filter((c) => c.commissionStatus !== 'paid')
                    .reduce((sum, c) => sum + (c.commissionValue || c.totalValue * 0.5), 0)
                )}
              </div>
              <span className="text-[10px] text-amber-400/80">Aguardando confirmação e Pix</span>
            </div>
          </div>

          {/* Individual Performance Cards (Admin Only) */}
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
                  className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-purple-500/50 transition-all"
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
                      title="Copiar Chave Pix"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copiado' : 'Pix'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* PAINEL NÃO-ADMINISTRATIVO (Visualização de comissões protegida e ocultada) */
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 text-amber-400 border border-slate-700/60 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Comissões & Repasses de Consultores</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase">
                  Apenas Painel Administrativo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Em conformidade com a política de governança interna da Retoma Digital, as comissões de consultores (50%), chaves Pix e comprovantes de repasse são exibidos <strong>exclusivamente na área administrativa da diretoria</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Entrar como Administrador</span>
              </button>
            )}
            {onNavigateToBrokersTab && (
              <button
                onClick={onNavigateToBrokersTab}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Acessar Painel</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Contracts Table Section */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Todos os Contratos Registrados</h3>
            <p className="text-xs text-slate-400">
              Emissão de PDF, envio para WhatsApp oficial e acompanhamento de vigência.
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
                <th className="py-3 px-4">Plano / Itens</th>
                <th className="py-3 px-4">Valor Total</th>
                {isAdmin && (
                  <>
                    <th className="py-3 px-4">Corretor (50%)</th>
                    <th className="py-3 px-4">Comissão (50%)</th>
                    <th className="py-3 px-4">Status Pix</th>
                  </>
                )}
                <th className="py-3 px-4">Status Contrato</th>
                <th className="py-3 px-4 text-right">Ações Oficiais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredContracts.map((c) => {
                const whatsOfficialUrl = getWhatsAppContractUrl(c, RETOMA_WHATSAPP_OFFICIAL);
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
                    
                    {/* Colunas Administrativas Exclusivas para Admin */}
                    {isAdmin && (
                      <>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-purple-300">
                            {c.brokerName || 'Francisco Araújo'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {broker ? `Pix: ${broker.pixKey}` : 'Corretor'}
                          </div>
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
                      </>
                    )}

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        c.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {c.status === 'active' ? 'Ativo' : 'Pendente'}
                      </span>
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

                        {/* Baixar Recibo de Comissão PDF (Admin Only) */}
                        {isAdmin && (
                          <button
                            onClick={() => handleDownloadCommissionReceipt(c, c.brokerName || 'Francisco Araújo', broker?.pixKey)}
                            className="p-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 text-purple-300 transition-colors cursor-pointer"
                            title="Baixar Recibo de Comissão (50%) em PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}

                        {/* Enviar Cópia do Contrato em PDF para os 2 WhatsApps (Central + Cliente) */}
                        <button
                          onClick={() => onOpenContractModal(c)}
                          className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-bold text-[10px]"
                          title="Enviar Cópia do Contrato (PDF) para os 2 Números do WhatsApp (Central Oficial e Cliente)"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>2x Whats</span>
                        </button>

                        {/* Visualizar Detalhes & Envio */}
                        <button
                          onClick={() => onOpenContractModal(c)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          Ver & Enviar
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

import React, { useState } from 'react';
import { Broker, ContractItem } from '../types';
import { formatCurrencyBRL, formatDateTimeBR, getWhatsAppCommissionNoticeUrl } from '../utils/whatsapp';
import { generateCommissionVoucherPDF } from '../utils/pdfGenerator';
import { 
  Users, 
  UserPlus, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  MessageCircle, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Phone,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BrokersTabProps {
  brokers: Broker[];
  contracts: ContractItem[];
  onAddBroker: (broker: Broker) => void;
  onPayCommission: (contractId: string) => void;
}

export const BrokersTab: React.FC<BrokersTabProps> = ({
  brokers,
  contracts,
  onAddBroker,
  onPayCommission,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedPixId, setCopiedPixId] = useState<string | null>(null);

  // New Broker Form
  const [newBroker, setNewBroker] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    cpf: '',
    pixKey: '',
    pixKeyType: 'cpf' as Broker['pixKeyType'],
  });

  const handleCopyPix = (pixKey: string, brokerId: string) => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPixId(brokerId);
    setTimeout(() => setCopiedPixId(null), 2500);
  };

  const handleCreateBroker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBroker.name || !newBroker.pixKey || !newBroker.whatsapp) {
      alert('Preencha os campos obrigatórios (Nome, WhatsApp e Chave Pix).');
      return;
    }

    const broker: Broker = {
      id: 'broker_' + Date.now(),
      name: newBroker.name,
      email: newBroker.name.toLowerCase().replace(/\s+/g, '.') + '@gmail.com',
      gmailVerified: true,
      phone: newBroker.phone || newBroker.whatsapp,
      whatsapp: newBroker.whatsapp,
      cpf: newBroker.cpf,
      pixKey: newBroker.pixKey,
      pixKeyType: newBroker.pixKeyType,
      active: true,
      commissionRate: 0.50, // 50%
      joinedAt: new Date().toISOString().split('T')[0],
      verificationBadge: `VERIFICADO-GMAIL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };

    onAddBroker(broker);
    setShowAddModal(false);
    setNewBroker({
      name: '',
      phone: '',
      whatsapp: '',
      cpf: '',
      pixKey: '',
      pixKeyType: 'cpf',
    });
  };

  const handlePay = (contractId: string) => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignored
    }
    onPayCommission(contractId);
  };

  const handleDownloadVoucher = (contract: ContractItem, broker: Broker) => {
    const pdf = generateCommissionVoucherPDF(contract, broker.name, broker.pixKey);
    pdf.save(`Recibo_Comissao_${contract.contractNumber}_${broker.name.replace(/\s+/g, '_')}.pdf`);
  };

  // Compute aggregated stats
  const totalCommissionsAll = contracts.reduce((acc, c) => acc + (c.commissionValue || c.totalValue * 0.5), 0);
  const totalCommissionsPaid = contracts
    .filter((c) => c.commissionStatus === 'paid')
    .reduce((acc, c) => acc + (c.commissionValue || c.totalValue * 0.5), 0);
  const totalCommissionsPending = totalCommissionsAll - totalCommissionsPaid;

  return (
    <div className="py-6 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Programa de Comissionamento 50%</span>
          </div>
          <h2 className="text-3xl font-black text-white">
            Equipe de Corretores de Vendas & Comissões
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gestão dos corretores comerciais (Francisco Araújo, Bernardo Araújo, Witor Araújo, Etevino de Araújo e novos membros) com comissão fixa de 50% por contrato emitido.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-2xl shadow-lg shadow-emerald-900/30 transition-colors flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Novo Corretor</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total de Comissões Geradas (50%)
          </span>
          <div className="text-3xl font-black text-white mt-2">
            {formatCurrencyBRL(totalCommissionsAll)}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">
            Exatamente 50% de cada contrato fechado
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Comissões Já Pagas via Pix
          </span>
          <div className="text-3xl font-black text-emerald-400 mt-2">
            {formatCurrencyBRL(totalCommissionsPaid)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Transferências liquidadas
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Comissões Pendentes de Liberação
          </span>
          <div className="text-3xl font-black text-amber-400 mt-2">
            {formatCurrencyBRL(totalCommissionsPending)}
          </div>
          <div className="text-[11px] text-amber-300/80 mt-1">
            Aguardando Pix para o corretor
          </div>
        </div>
      </div>

      {/* Brokers Performance Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          <span>Corretores Credenciados ({brokers.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {brokers.map((broker) => {
            // Find broker's contracts
            const brokerContracts = contracts.filter(
              (c) => c.brokerId === broker.id || c.brokerName?.toLowerCase() === broker.name.toLowerCase()
            );

            const totalSales = brokerContracts.reduce((sum, c) => sum + c.totalValue, 0);
            const totalCommission = brokerContracts.reduce(
              (sum, c) => sum + (c.commissionValue || c.totalValue * 0.5),
              0
            );
            const paidCommission = brokerContracts
              .filter((c) => c.commissionStatus === 'paid')
              .reduce((sum, c) => sum + (c.commissionValue || c.totalValue * 0.5), 0);
            const pendingCommission = totalCommission - paidCommission;

            const isCopied = copiedPixId === broker.id;

            return (
              <div
                key={broker.id}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-5 hover:border-slate-700 transition-all shadow-xl"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        50% de Comissão Fixa
                      </span>
                      <h4 className="text-xl font-black text-white mt-1.5">
                        {broker.name}
                      </h4>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-black text-sm">
                      {broker.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-3 space-y-1 text-xs text-slate-400 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{broker.phone}</span>
                    </div>
                    {broker.cpf && (
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                        <span>CPF: {broker.cpf}</span>
                      </div>
                    )}
                  </div>

                  {/* Pix Key Badge */}
                  <div className="mt-3 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                      Chave Pix ({broker.pixKeyType.toUpperCase()}):
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400 truncate">
                        {broker.pixKey}
                      </span>
                      <button
                        onClick={() => handleCopyPix(broker.pixKey, broker.id)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer"
                        title="Copiar Chave Pix"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiada</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar Pix</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Performance Breakdown */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block">Contratos Fechados</span>
                      <span className="text-lg font-black text-white">{brokerContracts.length}</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block">Total Faturado</span>
                      <span className="text-sm font-bold text-blue-400">{formatCurrencyBRL(totalSales)}</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block">Comissão Paga</span>
                      <span className="text-sm font-bold text-emerald-400">{formatCurrencyBRL(paidCommission)}</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block">A Pagar (Pendente)</span>
                      <span className="text-sm font-bold text-amber-400">{formatCurrencyBRL(pendingCommission)}</span>
                    </div>
                  </div>
                </div>

                {/* Direct WhatsApp contact */}
                <a
                  href={`https://api.whatsapp.com/send?phone=55${broker.whatsapp.replace(/\D/g, '')}&text=${encodeURIComponent(`Olá ${broker.name}, aqui é da Retoma Digital sobre o relatório de suas comissões de vendas!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Falar no WhatsApp do Corretor</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Commissions Ledger Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white">Extrato de Comissões por Contrato Fechado</h3>
          <p className="text-xs text-slate-400">
            Cada contrato registrado gera comissão automática de 50% para o corretor responsável.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Contrato</th>
                <th className="py-3 px-4">Corretor (50%)</th>
                <th className="py-3 px-4">Cliente Fechado</th>
                <th className="py-3 px-4">Valor Contrato</th>
                <th className="py-3 px-4">Comissão do Corretor</th>
                <th className="py-3 px-4">Status Pix</th>
                <th className="py-3 px-4 text-right">Ações de Pagamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {contracts.map((c) => {
                const broker: Broker = brokers.find((b) => b.id === c.brokerId || b.name === c.brokerName) || {
                  id: 'unknown',
                  name: c.brokerName || 'Corretor Comercial',
                  email: 'corretor@retomadigital.com.br',
                  gmailVerified: true,
                  phone: '',
                  whatsapp: '68992827744',
                  cpf: '',
                  pixKey: 'Cadastrada no sistema',
                  pixKeyType: 'phone' as const,
                  active: true,
                  commissionRate: 0.50,
                  joinedAt: '',
                  verificationBadge: 'VERIFICADO-RETOMA',
                };

                const commVal = c.commissionValue || c.totalValue * 0.5;
                const isPaid = c.commissionStatus === 'paid';
                const whatsNoticeUrl = getWhatsAppCommissionNoticeUrl(c, broker.whatsapp);

                return (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-400">
                      {c.contractNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{c.brokerName || 'Não Atribuído'}</div>
                      <div className="text-[10px] text-slate-400">Pix: {broker.pixKey}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">
                      {c.client.companyName}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-300">
                      {formatCurrencyBRL(c.totalValue)}
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">
                      {formatCurrencyBRL(commVal)}
                      <span className="text-[10px] text-slate-500 font-normal block">(50% do total)</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {isPaid ? (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Pago</span>
                        </span>
                      ) : (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Aguardando Pix</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isPaid && (
                          <button
                            onClick={() => handlePay(c.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow"
                            title="Marcar como pago via Pix"
                          >
                            Pagar Pix
                          </button>
                        )}

                        {/* Download Official Commission Voucher PDF */}
                        <button
                          onClick={() => handleDownloadVoucher(c, broker)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors cursor-pointer"
                          title="Emitir Recibo de Comissão em PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Send notice on WhatsApp */}
                        <a
                          href={whatsNoticeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-colors cursor-pointer"
                          title="Enviar comprovante para WhatsApp do Corretor"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Rodapé de Recibos e Comprovantes */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Desenvolvedores do Projeto & Direitos Autorais:</span>
            <strong className="text-white">Bernardo Araújo e Francisco Araújo</strong>
          </div>
          <div className="text-slate-400">
            Rio Branco - Acre • Nov/2026
          </div>
        </div>
      </div>

      {/* New Broker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-black text-white">Cadastrar Novo Corretor de Vendas</h3>
            <p className="text-xs text-slate-400">
              O novo corretor terá direito a 50% de comissão por cada contrato fechado e receberá comprovante via Pix.
            </p>

            <form onSubmit={handleCreateBroker} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Completo do Corretor *
                </label>
                <input
                  type="text"
                  required
                  value={newBroker.name}
                  onChange={(e) => setNewBroker({ ...newBroker, name: e.target.value })}
                  placeholder="Ex: Nome do Corretor"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newBroker.whatsapp}
                    onChange={(e) => setNewBroker({ ...newBroker, whatsapp: e.target.value })}
                    placeholder="(68) 99999-0000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={newBroker.cpf}
                    onChange={(e) => setNewBroker({ ...newBroker, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo de Chave Pix
                  </label>
                  <select
                    value={newBroker.pixKeyType}
                    onChange={(e) => setNewBroker({ ...newBroker, pixKeyType: e.target.value as Broker['pixKeyType'] })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="cpf">CPF</option>
                    <option value="phone">Telefone</option>
                    <option value="email">E-mail</option>
                    <option value="random">Chave Aleatória</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Chave Pix para Pagamento *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBroker.pixKey}
                    onChange={(e) => setNewBroker({ ...newBroker, pixKey: e.target.value })}
                    placeholder="Digite a chave Pix exata"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Comissão de 50% será automaticamente vinculada às vendas deste corretor.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow"
                >
                  Cadastrar Corretor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

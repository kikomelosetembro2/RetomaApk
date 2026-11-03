import React, { useState } from 'react';
import { AuthUser, Broker, ContractItem } from '../types';
import { formatCurrencyBRL, formatDateTimeBR, getWhatsAppCommissionNoticeUrl, getWhatsAppContractUrl } from '../utils/whatsapp';
import { generateCommissionVoucherPDF, generateContractPDF } from '../utils/pdfGenerator';
import { RETOMA_PHONE_DISPLAY, RETOMA_WHATSAPP_OFFICIAL, APP_APK_VERSION } from '../data/initialData';
import { 
  ShieldCheck, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Download, 
  MessageCircle, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink,
  Plus,
  CreditCard,
  Clock,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BrokerPortalViewProps {
  currentUser: AuthUser;
  brokerData?: Broker;
  contracts: ContractItem[];
  onNewContract: () => void;
  onLogout: () => void;
}

export const BrokerPortalView: React.FC<BrokerPortalViewProps> = ({
  currentUser,
  brokerData,
  contracts,
  onNewContract,
  onLogout,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  // Filter only this broker's contracts
  const myContracts = contracts.filter(
    (c) => c.brokerId === currentUser.brokerId || c.brokerName?.toLowerCase() === currentUser.name.toLowerCase()
  );

  const totalSales = myContracts.reduce((sum, c) => sum + c.totalValue, 0);
  const totalCommission = myContracts.reduce((sum, c) => sum + (c.commissionValue || c.totalValue * 0.5), 0);
  const paidCommission = myContracts
    .filter((c) => c.commissionStatus === 'paid')
    .reduce((sum, c) => sum + (c.commissionValue || c.totalValue * 0.5), 0);
  const pendingCommission = totalCommission - paidCommission;

  const referralLink = `${window.location.origin}/?ref=${currentUser.name.toLowerCase().replace(/\s+/g, '_')}`;

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyPix = () => {
    if (brokerData?.pixKey) {
      navigator.clipboard.writeText(brokerData.pixKey);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  const handleDownloadVoucher = (contract: ContractItem) => {
    const pdf = generateCommissionVoucherPDF(contract, currentUser.name, brokerData?.pixKey);
    pdf.save(`Recibo_Comissao_${contract.contractNumber}_${currentUser.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleDownloadContract = (contract: ContractItem) => {
    const pdf = generateContractPDF(contract);
    pdf.save(`Contrato_${contract.contractNumber}.pdf`);
  };

  return (
    <div className="py-6 space-y-8 max-w-7xl mx-auto">
      {/* Broker Profile Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-purple-500/20">
              {currentUser.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">{currentUser.name}</h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Gmail Verificado</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {currentUser.email} • Corretor Oficial Retoma Digital • Comissão Fixa de 50%
              </p>
              <div className="text-[11px] text-purple-300 font-mono mt-1">
                Badge: {brokerData?.verificationBadge || 'ID-RET-VERIFICADO-2026'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNewContract}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-2xl shadow-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Emitir Novo Contrato com Minha Comissão (50%)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards for the Logged Broker */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-3xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Minhas Vendas Fechadas
          </span>
          <div className="text-3xl font-black text-white mt-2">
            {myContracts.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Contratos emitidos</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-3xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Faturamento Total Gerado
          </span>
          <div className="text-3xl font-black text-blue-400 mt-2">
            {formatCurrencyBRL(totalSales)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Valor global vendido</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-3xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Minha Comissão Total (50%)
          </span>
          <div className="text-3xl font-black text-emerald-400 mt-2">
            {formatCurrencyBRL(totalCommission)}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">50% líquido de comissão</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-3xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Aguardando Pix (Pendente)
          </span>
          <div className="text-3xl font-black text-amber-400 mt-2">
            {formatCurrencyBRL(pendingCommission)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {pendingCommission > 0 ? 'Em processamento Pix' : '✓ Tudo quitado'}
          </span>
        </div>
      </div>

      {/* Pix Key and Referral Link Info Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pix Box */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Sua Chave Pix Cadastrada para Comissões</span>
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded font-bold">
              Repasse Automático
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Chave Pix Ativa:</span>
              <span className="font-mono text-sm font-bold text-emerald-400">
                {brokerData?.pixKey || currentUser.pixKey || 'Não cadastrada'}
              </span>
            </div>
            <button
              onClick={handleCopyPix}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              {copiedPix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            A comissão de 50% é transferida para esta chave logo após a assinatura de cada contrato.
          </p>
        </div>

        {/* Link de Venda Exclusivo */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Seu Link de Venda & Demonstração</span>
            </span>
            <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded font-bold">
              Comissão Garantida
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
            <span className="font-mono text-xs text-blue-300 truncate">
              {referralLink}
            </span>
            <button
              onClick={handleCopyReferralLink}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Envie este link para estabelecimentos de Rio Branco para demonstrar o Cartão NFC e fechar contratos com 50% de comissão vinculada a você.
          </p>
        </div>
      </div>

      {/* My Contracts Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Minhas Vendas & Comissões (Extrato Individual)</h3>
            <p className="text-xs text-slate-400">
              Histórico detalhado de contratos fechados por você com comprovantes em PDF e notificações.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Contrato</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Valor Total</th>
                <th className="py-3 px-4">Minha Comissão (50%)</th>
                <th className="py-3 px-4">Status Pix</th>
                <th className="py-3 px-4 text-right">Comprovantes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {myContracts.map((c) => {
                const isPaid = c.commissionStatus === 'paid';
                const commVal = c.commissionValue || c.totalValue * 0.5;
                const whatsReceipt = getWhatsAppCommissionNoticeUrl(c, brokerData?.whatsapp || '68992827744');

                return (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-400">
                      {c.contractNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{c.client.companyName}</div>
                      <div className="text-[10px] text-slate-400">{c.client.documentNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {new Date(c.signedAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-200">
                      {formatCurrencyBRL(c.totalValue)}
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">
                      {formatCurrencyBRL(commVal)}
                    </td>
                    <td className="py-3.5 px-4">
                      {isPaid ? (
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Pix Pago</span>
                        </span>
                      ) : (
                        <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Aguardando Pix</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Baixar Recibo de Comissão */}
                        <button
                          onClick={() => handleDownloadVoucher(c)}
                          className="bg-purple-900/50 hover:bg-purple-800 text-purple-200 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Baixar Recibo Oficial de Comissão em PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Baixar Contrato */}
                        <button
                          onClick={() => handleDownloadContract(c)}
                          className="bg-slate-800 hover:bg-slate-700 text-blue-400 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Baixar Contrato em PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* WhatsApp do Comprovante */}
                        <a
                          href={whatsReceipt}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Notificar no WhatsApp"
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

          {myContracts.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-xs">
              Você ainda não possui contratos emitidos nesta conta. Clique em "Emitir Novo Contrato" para começar!
            </div>
          )}
        </div>

        {/* Rodapé de Comprovantes, Versão do APK e Direitos Autorais */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-[11px]">
              Versão do APK: {APP_APK_VERSION}
            </span>
            <span>•</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Desenvolvedores do Projeto & Direitos Autorais:</span>
            <strong className="text-white">Bernardo Araújo e Francisco Araújo</strong>
          </div>
          <div className="text-slate-400">
            Rio Branco - Acre • Nov/2026
          </div>
        </div>
      </div>
    </div>
  );
};

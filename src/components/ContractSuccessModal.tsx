import React from 'react';
import { ContractItem } from '../types';
import { RETOMA_WHATSAPP_OFFICIAL, RETOMA_PHONE_DISPLAY } from '../data/initialData';
import { getWhatsAppContractUrl, formatCurrencyBRL, formatDateTimeBR } from '../utils/whatsapp';
import { generateContractPDF } from '../utils/pdfGenerator';
import { 
  CheckCircle, 
  MessageCircle, 
  Download, 
  X, 
  ExternalLink, 
  FileText, 
  Share2,
  Printer,
  ShieldCheck
} from 'lucide-react';

interface ContractSuccessModalProps {
  contract: ContractItem | null;
  onClose: () => void;
  onViewInDashboard: () => void;
}

export const ContractSuccessModal: React.FC<ContractSuccessModalProps> = ({
  contract,
  onClose,
  onViewInDashboard,
}) => {
  if (!contract) return null;

  const officialWhatsUrl = getWhatsAppContractUrl(contract, RETOMA_WHATSAPP_OFFICIAL);
  const clientWhatsUrl = getWhatsAppContractUrl(contract, contract.client.whatsapp);

  const handleDownloadPDF = () => {
    try {
      const pdf = generateContractPDF(contract);
      pdf.save(`Contrato_${contract.contractNumber}_${contract.client.tradeName || contract.client.companyName}.pdf`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Contrato Emitido com Sucesso!
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            O documento foi assinado digitalmente, o PDF foi gerado e registrado no sistema.
          </p>
        </div>

        {/* Contract Key Summary Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Identificador do Contrato:</span>
              <div className="text-base font-bold text-blue-400">{contract.contractNumber}</div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Valor Total:</span>
              <div className="text-lg font-black text-emerald-400">{formatCurrencyBRL(contract.totalValue)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500">Cliente / Razão Social:</span>
              <div className="font-semibold text-slate-200">{contract.client.companyName}</div>
            </div>
            <div>
              <span className="text-slate-500">Responsável Legal:</span>
              <div className="font-semibold text-slate-200">{contract.client.representativeName || 'Não especificado'}</div>
            </div>
            <div>
              <span className="text-slate-500">Plano / Serviços:</span>
              <div className="font-semibold text-slate-200">
                {contract.planName || 'Serviços Personalizados'} ({contract.billingCycle === 'annual' ? 'Anual' : 'Mensal'})
              </div>
            </div>
            <div>
              <span className="text-slate-500">Autenticação Digital:</span>
              <div className="font-mono text-[11px] text-blue-300 truncate">{contract.digitalSignatureHash}</div>
            </div>

            {contract.brokerName && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Corretor Responsável:</span>
                  <span className="font-bold text-purple-300 ml-1.5">{contract.brokerName}</span>
                </div>
                <div className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-bold">
                  Comissão (50%): {formatCurrencyBRL(contract.commissionValue || contract.totalValue * 0.5)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mandatory Action Highlight: Enviar para WhatsApp 68 99282-7744 */}
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Ação Solicitada • Despacho WhatsApp
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={officialWhatsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-colors cursor-pointer text-center"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Enviar Cópia para WhatsApp Oficial (68) 99282-7744</span>
            </a>

            {contract.client.whatsapp && contract.client.whatsapp !== RETOMA_WHATSAPP_OFFICIAL && (
              <a
                href={clientWhatsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-3.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Share2 className="w-4 h-4" />
                <span>Enviar para Cliente</span>
              </a>
            )}
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Baixar PDF Novamente</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onViewInDashboard();
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
          >
            <span>Ver no Dashboard Financeiro →</span>
          </button>
        </div>

        {/* Rodapé do Contrato / Recibo: Desenvolvedores e Direitos Autorais */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Desenvolvedores do Projeto & Direitos Autorais:</span>
            <strong className="text-slate-200">Bernardo Araújo e Francisco Araújo</strong>
          </div>
          <div className="text-slate-400 font-medium shrink-0">
            Rio Branco - Acre • Nov/2026
          </div>
        </div>
      </div>
    </div>
  );
};

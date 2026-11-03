import React, { useState } from 'react';
import { ContractItem } from '../types';
import { 
  RETOMA_WHATSAPP_OFFICIAL, 
  RETOMA_PHONE_DISPLAY, 
  RETOMA_WHATSAPP_SECONDARY, 
  RETOMA_PHONE_SECONDARY_DISPLAY,
  APP_APK_VERSION 
} from '../data/initialData';
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
  ShieldCheck, 
  Send,
  Sparkles,
  FileCheck,
  CheckCircle2
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

  const [dualSentStatus, setDualSentStatus] = useState<boolean>(false);
  const [sharingFile, setSharingFile] = useState<boolean>(false);

  // URLs individuais do WhatsApp
  const officialWhatsUrl = getWhatsAppContractUrl(contract, RETOMA_WHATSAPP_OFFICIAL);
  const clientTargetNumber = contract.client.whatsapp || RETOMA_WHATSAPP_SECONDARY;
  const clientWhatsUrl = getWhatsAppContractUrl(contract, clientTargetNumber);
  const secondaryDirectorWhatsUrl = getWhatsAppContractUrl(contract, RETOMA_WHATSAPP_SECONDARY);

  // Baixar PDF
  const handleDownloadPDF = () => {
    try {
      const pdf = generateContractPDF(contract);
      pdf.save(`Contrato_${contract.contractNumber}_${contract.client.tradeName || contract.client.companyName}.pdf`);
    } catch (e) {
      console.error(e);
    }
  };

  // Enviar Cópia para os 2 Números do WhatsApp
  const handleSendToBothWhatsApp = () => {
    setDualSentStatus(true);

    // Abre o primeiro WhatsApp (Central Oficial Retoma)
    window.open(officialWhatsUrl, '_blank', 'noopener,noreferrer');

    // Abre o segundo WhatsApp com pequeno delay de 400ms para o navegador não bloquear popups
    setTimeout(() => {
      window.open(clientWhatsUrl, '_blank', 'noopener,noreferrer');
    }, 450);
  };

  // Compartilhar arquivo PDF real via Web Share API diretamente para o WhatsApp
  const handleShareActualPdfToWhatsApp = async () => {
    try {
      setSharingFile(true);
      const pdf = generateContractPDF(contract);
      const pdfBlob = pdf.output('blob');
      const fileName = `Contrato_${contract.contractNumber}_${(contract.client.tradeName || contract.client.companyName).replace(/\s+/g, '_')}.pdf`;
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: `Contrato ${contract.contractNumber} - Retoma Digital`,
          text: `📄 Cópia Oficial do Contrato ${contract.contractNumber} emitido para ${contract.client.companyName}. Autenticação Hash: ${contract.digitalSignatureHash}`,
          files: [pdfFile],
        });
      } else {
        // Fallback: Baixa o PDF e abre o WhatsApp
        pdf.save(fileName);
        window.open(officialWhatsUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Erro ao compartilhar PDF:', err);
      // Fallback
      handleDownloadPDF();
      window.open(officialWhatsUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setSharingFile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
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
            Documento assinado digitalmente, PDF gerado com validade jurídica e estoque de cartões pronta-entrega atualizado.
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
                {contract.planName || 'Plano Oficial'} ({contract.billingCycle === 'annual' ? 'Anual' : 'Mensal'})
              </div>
            </div>
            <div>
              <span className="text-slate-500">Autenticação Digital:</span>
              <div className="font-mono text-[11px] text-blue-300 truncate">{contract.digitalSignatureHash}</div>
            </div>

            {contract.brokerName && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Consultor Comercial:</span>
                  <span className="font-bold text-purple-300 ml-1.5">{contract.brokerName}</span>
                </div>
                <div className="bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-lg font-semibold text-[11px]">
                  Atendimento Oficial Rio Branco - AC
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Destaque Principal: Envio para os Dois Números de WhatsApp */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Send className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Envio da Cópia do Contrato em PDF para os 2 Números do WhatsApp
                </h4>
                <p className="text-[11px] text-slate-300">
                  Envie simultaneamente para a Central Retoma e para o WhatsApp do Cliente Contratante.
                </p>
              </div>
            </div>

            {dualSentStatus && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Despachado com Sucesso!</span>
              </span>
            )}
          </div>

          {/* Botão Master: Disparar para os 2 Números com 1 Clique */}
          <button
            type="button"
            onClick={handleSendToBothWhatsApp}
            className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white py-4 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-emerald-950/50 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-white shrink-0" />
            <span>🚀 Enviar Cópia do Contrato (PDF) para os 2 Números do WhatsApp</span>
          </button>

          {/* Botões Individuais com os Números Destinatários */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <a
              href={officialWhatsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-slate-950/70 hover:bg-slate-800/90 border border-emerald-500/30 rounded-xl transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-4 h-4 fill-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Número 1: Central Retoma
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
                </div>
                <div className="text-xs font-bold text-white truncate">{RETOMA_PHONE_DISPLAY}</div>
                <div className="text-[10px] text-slate-400">Diretoria & Suporte Oficial</div>
              </div>
            </a>

            <a
              href={clientWhatsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-slate-950/70 hover:bg-slate-800/90 border border-blue-500/30 rounded-xl transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Share2 className="w-4 h-4 text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Número 2: WhatsApp do Cliente
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400" />
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {contract.client.whatsapp || RETOMA_PHONE_SECONDARY_DISPLAY}
                </div>
                <div className="text-[10px] text-slate-400">
                  {contract.client.representativeName || contract.client.companyName}
                </div>
              </div>
            </a>
          </div>

          {/* Opção Adicional: Compartilhar Arquivo PDF Real pelo WhatsApp */}
          <div className="pt-2 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
            <button
              type="button"
              disabled={sharingFile}
              onClick={handleShareActualPdfToWhatsApp}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{sharingFile ? 'Preparando arquivo PDF...' : '📎 Compartilhar Arquivo PDF no WhatsApp'}</span>
            </button>

            <span className="text-[11px] text-slate-400 text-center sm:text-right">
              O arquivo PDF do contrato já foi baixado automaticamente em seu dispositivo.
            </span>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow"
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

        {/* Rodapé do Contrato / Recibo: Versão do APK, Desenvolvedores e Direitos Autorais */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
          <div className="flex flex-wrap items-center gap-1.5 text-center sm:text-left">
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold">
              Versão do APK: {APP_APK_VERSION}
            </span>
            <span>•</span>
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

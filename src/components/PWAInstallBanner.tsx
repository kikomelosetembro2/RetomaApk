import React, { useState } from 'react';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';
import logoImg from '../assets/logo.png';

interface PWAInstallBannerProps {
  onOpenModal: () => void;
  isInstalled: boolean;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  onOpenModal,
  isInstalled,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || isDismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border-b border-cyan-500/30 px-4 py-2.5 sm:px-6 shadow-lg z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={logoImg}
              alt="Ícone App Retoma"
              className="w-8 h-8 rounded-lg border border-cyan-400/40 object-cover bg-slate-950"
            />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                Instalar Aplicativo Retoma no Celular
              </span>
              <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                Ícone na Tela Inicial
              </span>
            </div>
            <p className="text-[11px] text-slate-300 hidden sm:block truncate">
              Abra em tela cheia como APK nativo, emita contratos mais rápido e acesse direto pelo ícone.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar App</span>
          </button>
          
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            title="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

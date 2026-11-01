import React from 'react';
import { 
  Download, 
  Smartphone, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  X, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import logoImg from '../assets/logo.png';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  hasNativePrompt: boolean;
  isIOS: boolean;
  isInstalled: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  hasNativePrompt,
  isIOS,
  isInstalled,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 blur-2xl pointer-events-none" />

        {/* Header with close button */}
        <div className="relative flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                Instalar Aplicativo Retoma
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full">
                  APK / PWA
                </span>
              </h3>
              <p className="text-xs text-slate-400">Ícone nativo e acesso rápido na sua tela inicial</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* App Card / Mockup */}
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="relative group">
              <img
                src={logoImg}
                alt="Ícone do Aplicativo Retoma"
                className="w-18 h-18 rounded-2xl shadow-xl border border-slate-600/50 object-cover bg-slate-950 p-1"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-white truncate">Retoma Digital</h4>
              <p className="text-xs text-slate-300">Contratos, Vendas & Cartão NFC Google</p>
              
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verificado e Seguro
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-slate-400">Offline Ready</span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-slate-400">Sem gastar memória</span>
              </div>
            </div>
          </div>

          {/* Installed State */}
          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-emerald-300">
                Aplicativo já instalado com sucesso!
              </p>
              <p className="text-xs text-slate-400">
                Você pode abrir o Retoma direto do ícone na tela inicial do seu celular.
              </p>
            </div>
          ) : (
            <>
              {/* Instructions depending on platform */}
              {isIOS ? (
                <div className="space-y-3 bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                    <Sparkles className="w-4 h-4" />
                    Como instalar no iPhone / iPad (Safari):
                  </div>
                  <ol className="text-xs text-slate-300 space-y-2.5">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-700 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        1
                      </span>
                      <span>
                        Toque no botão de <strong>Compartilhar</strong>{' '}
                        <Share className="w-3.5 h-3.5 inline mx-1 text-cyan-400" /> no menu inferior do Safari.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-700 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        2
                      </span>
                      <span>
                        Role a lista para baixo e toque em{' '}
                        <strong className="text-white">Adicionar à Tela de Início</strong>{' '}
                        <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-cyan-400" />.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-700 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        3
                      </span>
                      <span>
                        Toque em <strong>Adicionar</strong> no canto superior direito. Pronto! O ícone ficará disponível na tela do celular.
                      </span>
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                      <div className="font-semibold text-cyan-400">⚡ Acesso Instantâneo</div>
                      <div className="text-slate-400 text-[11px]">Abra como um app de celular nativo, sem barra de navegador.</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                      <div className="font-semibold text-cyan-400">📱 Tela Cheia</div>
                      <div className="text-slate-400 text-[11px]">Melhor experiência para preencher contratos e demonstrações.</div>
                    </div>
                  </div>

                  {!hasNativePrompt && (
                    <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700 text-xs text-slate-300 space-y-1.5">
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                        Instalação manual no Chrome / Celular:
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Toque nos <strong>3 pontinhos (⋮)</strong> no topo do navegador e selecione{' '}
                        <strong className="text-white">"Instalar aplicativo"</strong> ou{' '}
                        <strong className="text-white">"Adicionar à tela inicial"</strong>.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              {hasNativePrompt ? (
                <button
                  onClick={onInstall}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Instalar Agora na Tela Inicial
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onInstall}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  {isIOS ? 'Entendi as instruções' : 'Tentar Instalação Automática'}
                </button>
              )}
            </>
          )}

          {/* Footer note with developers copyright */}
          <div className="text-[11px] text-center text-slate-500 pt-2 border-t border-slate-800/80">
            Retoma Digital APK • Desenvolvedores: Bernardo Araújo e Francisco Araújo • Rio Branco - AC
          </div>
        </div>
      </div>
    </div>
  );
};

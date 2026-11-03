import { 
  Building2, 
  FileText, 
  Calendar, 
  BarChart3, 
  ShoppingBag, 
  Rotate3d, 
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Users,
  Lock,
  LogOut,
  CheckCircle,
  User,
  Smartphone,
  Download,
  Boxes,
  Play
} from 'lucide-react';
import retomaLogo from '../assets/logo.png';
import { RETOMA_PHONE_DISPLAY, RETOMA_WHATSAPP_OFFICIAL } from '../data/initialData';
import { AuthUser } from '../types';

export type NavTab = 'plans' | 'contract' | 'products' | 'admin-products' | 'schedule' | 'financial' | 'brokers' | 'card3d';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeContractsCount: number;
  pendingVisitsCount: number;
  currentUser: AuthUser | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenInstallModal?: () => void;
  onOpenPromoVideo?: () => void;
  isInstalled?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeContractsCount,
  pendingVisitsCount,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenInstallModal,
  onOpenPromoVideo,
  isInstalled,
}) => {
  const tabs = [
    { id: 'plans' as NavTab, label: 'Planos Mensal / Anual', icon: Sparkles, badge: '12x R$ 20' },
    { id: 'contract' as NavTab, label: 'Gerador de Contrato', icon: FileText, badge: 'PDF & Whats' },
    { id: 'products' as NavTab, label: 'Produtos & Serviços', icon: ShoppingBag },
    { id: 'admin-products' as NavTab, label: 'Painel Administrativo', icon: Lock, badge: 'Restrito' },
    { id: 'schedule' as NavTab, label: 'Agendamento de Visitas', icon: Calendar, count: pendingVisitsCount },
    { id: 'financial' as NavTab, label: 'Dashboard Financeiro', icon: BarChart3, count: activeContractsCount },
    { 
      id: 'brokers' as NavTab, 
      label: currentUser?.role === 'broker' ? 'Meu Portal Corretor' : 'Portal do Corretor', 
      icon: Users, 
      badge: currentUser ? 'Logado' : 'Acesso Restrito' 
    },
    { id: 'card3d' as NavTab, label: 'Cartão NFC 3D', icon: Rotate3d, badge: '3D Real' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 text-white backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo */}
          <div 
            onClick={() => onSelectTab('plans')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform overflow-hidden">
              <img 
                src={retomaLogo} 
                alt="Retoma Digital Logo" 
                className="w-full h-full object-cover rounded-[10px]" 
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-white">
                  RETOMA
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                  DIGITAL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none hidden sm:block">
                Inteligência Local • Google & NFC
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`relative px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      isActive ? 'bg-blue-800 text-blue-100' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-500 text-slate-950">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Auth, Install App & WhatsApp CTAs */}
          <div className="flex items-center gap-2">
            {/* Promo Video 30s Button */}
            {onOpenPromoVideo && (
              <button
                onClick={onOpenPromoVideo}
                className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-rose-500 text-white px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Assista ao vídeo de 30 segundos sobre como sua empresa é localizada no Google Maps"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span className="hidden sm:inline">Vídeo 30s Maps</span>
                <span className="sm:hidden">Vídeo</span>
              </button>
            )}

            {/* Install PWA Button */}
            {!isInstalled && onOpenInstallModal && (
              <button
                onClick={onOpenInstallModal}
                className="relative bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-600/20 flex items-center gap-1.5 cursor-pointer whitespace-nowrap animate-pulse hover:animate-none"
                title="Instalar ícone do aplicativo no celular ou computador"
              >
                <Smartphone className="w-3.5 h-3.5 text-cyan-200" />
                <span className="hidden sm:inline">Instalar App</span>
                <span className="sm:hidden">Instalar</span>
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-700/80 p-1 pl-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-[11px] font-bold text-white flex items-center gap-1">
                      <span>{currentUser.name.split(' ')[0]}</span>
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div className="text-[9px] text-slate-400">
                      {currentUser.role === 'admin' ? 'Diretoria' : 'Corretor 50%'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Sair da Conta"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Lock className="w-3.5 h-3.5 text-blue-200" />
                <span>Login Corretor / Gmail</span>
              </button>
            )}

            <a
              href={`https://api.whatsapp.com/send?phone=${RETOMA_WHATSAPP_OFFICIAL}&text=${encodeURIComponent('Olá equipe Retoma Digital! Gostaria de informações sobre os planos, cartões NFC e implantação no Google.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow cursor-pointer whitespace-nowrap"
              title="Falar no WhatsApp Oficial: (68) 99282-7744"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-200 fill-emerald-200" />
              <span className="hidden md:inline">{RETOMA_PHONE_DISPLAY}</span>
            </a>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center overflow-x-auto py-2.5 space-x-1 scrollbar-none border-t border-slate-800/80">
          {onOpenPromoVideo && (
            <button
              onClick={onOpenPromoVideo}
              className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Vídeo 30s</span>
            </button>
          )}

          {!isInstalled && onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instalar no Celular</span>
            </button>
          )}

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-500 text-slate-950">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

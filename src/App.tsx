import React, { useState } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { PlansTab } from './components/PlansTab';
import { ContractTab } from './components/ContractTab';
import { ProductsTab } from './components/ProductsTab';
import { ScheduleVisitsTab } from './components/ScheduleVisitsTab';
import { FinancialDashboard } from './components/FinancialDashboard';
import { BrokersTab } from './components/BrokersTab';
import { BrokerPortalView } from './components/BrokerPortalView';
import { AuthModal } from './components/AuthModal';
import { Card3DViewer } from './components/Card3DViewer';
import { ContractSuccessModal } from './components/ContractSuccessModal';
import { AdminProductPanel } from './components/AdminProductPanel';
import { PromoVideoModal } from './components/PromoVideoModal';
import { Plan, BillingCycle, ContractItem, VisitSchedule, ProductItem, Broker, AuthUser } from './types';
import { 
  INITIAL_CONTRACTS, 
  INITIAL_PLANS, 
  INITIAL_PRODUCTS, 
  INITIAL_BROKERS,
  RETOMA_PHONE_DISPLAY, 
  RETOMA_WHATSAPP_OFFICIAL,
  PROJECT_COPYRIGHT_TEXT 
} from './data/initialData';
import { MessageCircle, ShieldCheck, Sparkles, MapPin, Phone, Lock, UserPlus, LogIn, CheckCircle, Smartphone, Download } from 'lucide-react';
import retomaLogo from './assets/logo.png';
import { usePWAInstall } from './hooks/usePWAInstall';
import { PWAInstallModal } from './components/PWAInstallModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('plans');
  const [contracts, setContracts] = useState<ContractItem[]>(INITIAL_CONTRACTS);
  const [brokers, setBrokers] = useState<Broker[]>(INITIAL_BROKERS);
  const [selectedPlanForContract, setSelectedPlanForContract] = useState<Plan | null>(INITIAL_PLANS[1]);
  const [selectedCycleForContract, setSelectedCycleForContract] = useState<BillingCycle>('annual');
  const [successModalContract, setSuccessModalContract] = useState<ContractItem | null>(null);
  const [showPromoVideoModal, setShowPromoVideoModal] = useState<boolean>(false);

  // Authenticated User State (default logged as Francisco Araújo to demonstrate the verified experience)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>({
    id: 'broker_francisco',
    name: 'Francisco Araújo',
    email: 'francisco.araujo@gmail.com',
    role: 'broker',
    brokerId: 'broker_francisco',
    verified: true,
    pixKey: '68999811234',
    joinedAt: '2026-01-10',
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // PWA & Mobile Home Screen Installation Hook
  const {
    isInstalled,
    isIOS,
    hasNativePrompt,
    isInstallModalOpen,
    setIsInstallModalOpen,
    triggerInstall,
  } = usePWAInstall();

  const handleAddBroker = (newBroker: Broker) => {
    setBrokers((prev) => [...prev, newBroker]);
  };

  const handlePayCommission = (contractId: string) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? { ...c, commissionStatus: 'paid', commissionPaidAt: new Date().toISOString() }
          : c
      )
    );
  };

  // Switch to Contract from Plans
  const handleSelectPlanForContract = (plan: Plan, cycle: BillingCycle) => {
    setSelectedPlanForContract(plan);
    setSelectedCycleForContract(cycle);
    setCurrentTab('contract');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to Contract from Products
  const handleOrderProductsDirectly = (items: { product: ProductItem; quantity: number }[]) => {
    setSelectedPlanForContract(null);
    setCurrentTab('contract');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to Contract from Schedule Visit
  const handleConvertVisitToContract = (visit: VisitSchedule) => {
    setSelectedPlanForContract(INITIAL_PLANS[1]);
    setSelectedCycleForContract('annual');
    setCurrentTab('contract');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add new contract
  const handleContractCreated = (newContract: ContractItem) => {
    setContracts([newContract, ...contracts]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Advisory Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-blue-900/50 py-1.5 px-4 text-center text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-white">Central Comercial Retoma Digital:</span>
            <span>Atendimento & Emissão em Rio Branco - AC e todo o Brasil</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Contratos com Validade Jurídica MP 2.200-2</span>
            </span>
            <a
              href={`https://api.whatsapp.com/send?phone=${RETOMA_WHATSAPP_OFFICIAL}&text=${encodeURIComponent('Olá equipe Retoma! Preciso de suporte com meu contrato.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              <span>{RETOMA_PHONE_DISPLAY}</span>
            </a>
          </div>
        </div>
      </div>

      {/* PWA Mobile & Desktop Install Prompt Banner */}
      <PWAInstallBanner
        onOpenModal={() => setIsInstallModalOpen(true)}
        isInstalled={isInstalled}
      />

      {/* Main Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeContractsCount={contracts.length}
        pendingVisitsCount={2}
        currentUser={currentUser}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onLogout={() => setCurrentUser(null)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenPromoVideo={() => setShowPromoVideoModal(true)}
        isInstalled={isInstalled}
      />

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'plans' && (
          <PlansTab
            onSelectPlanForContract={handleSelectPlanForContract}
            onOpen3DCard={() => setCurrentTab('card3d')}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            onOpenPromoVideo={() => setShowPromoVideoModal(true)}
          />
        )}

        {currentTab === 'contract' && (
          <ContractTab
            brokers={brokers}
            preselectedPlan={selectedPlanForContract}
            preselectedCycle={selectedCycleForContract}
            onContractCreated={handleContractCreated}
            onOpenContractSuccess={(c) => setSuccessModalContract(c)}
          />
        )}

        {currentTab === 'products' && (
          <ProductsTab
            onOrderProductsDirectly={handleOrderProductsDirectly}
            onOpen3DViewer={() => setCurrentTab('card3d')}
            onOpenAdminProducts={() => setCurrentTab('admin-products')}
          />
        )}

        {currentTab === 'admin-products' && (
          <AdminProductPanel />
        )}

        {currentTab === 'schedule' && (
          <ScheduleVisitsTab
            onConvertToContract={handleConvertVisitToContract}
          />
        )}

        {currentTab === 'financial' && (
          <FinancialDashboard
            contracts={contracts}
            brokers={brokers}
            currentUser={currentUser}
            onOpenContractModal={(c) => setSuccessModalContract(c)}
            onNewContractClick={() => {
              setSelectedPlanForContract(INITIAL_PLANS[1]);
              setCurrentTab('contract');
            }}
            onPayCommission={handlePayCommission}
            onNavigateToBrokersTab={() => setCurrentTab('brokers')}
            onOpenAuthModal={() => setShowAuthModal(true)}
          />
        )}

        {currentTab === 'brokers' && (
          !currentUser ? (
            <div className="max-w-2xl mx-auto py-12 text-center space-y-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Área Administrativa & Portal do Corretor
                </h2>
                <p className="text-sm text-slate-400 max-w-lg mx-auto">
                  Acesso restrito para corretores credenciados (Francisco Araújo, Bernardo Araújo, Witor Araújo, Etevino de Araújo e equipe) e diretoria com conta Gmail verificada.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Entrar com Gmail Verificado</span>
                </button>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>Cadastrar Novo Corretor</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Autenticação protegida com selo de verificação digital Retoma</span>
              </div>
            </div>
          ) : currentUser.role === 'broker' ? (
            <BrokerPortalView
              currentUser={currentUser}
              brokerData={brokers.find((b) => b.id === currentUser.brokerId || b.name === currentUser.name)}
              contracts={contracts}
              onNewContract={() => {
                setSelectedPlanForContract(INITIAL_PLANS[1]);
                setCurrentTab('contract');
              }}
              onLogout={() => setCurrentUser(null)}
            />
          ) : (
            <BrokersTab
              brokers={brokers}
              contracts={contracts}
              onAddBroker={handleAddBroker}
              onPayCommission={handlePayCommission}
            />
          )
        )}

        {currentTab === 'card3d' && (
          <div className="py-6 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                Renderização 3D PBR com Three.js
              </span>
              <h2 className="text-3xl font-black text-white">
                Showcase & Simulador do Cartão NFC Google
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Personalize com o nome do seu estabelecimento, teste a rotação 360°, alterne os acabamentos e faça a simulação de aproximação via smartphone.
              </p>
            </div>

            <Card3DViewer
              initialBusinessName="Sua Empresa Aqui"
              onOrderCard={() => {
                setSelectedPlanForContract(INITIAL_PLANS[1]);
                setCurrentTab('contract');
              }}
            />
          </div>
        )}
      </main>

      {/* Success Modal for Generated Contract */}
      <ContractSuccessModal
        contract={successModalContract}
        onClose={() => setSuccessModalContract(null)}
        onViewInDashboard={() => {
          setSuccessModalContract(null);
          setCurrentTab('financial');
        }}
      />

      {/* Auth Modal for Login with Gmail & Verified Broker Registration */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
        onRegisterBroker={handleAddBroker}
        brokers={brokers}
      />

      {/* PWA Mobile App Installation Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onInstall={triggerInstall}
        hasNativePrompt={hasNativePrompt}
        isIOS={isIOS}
        isInstalled={isInstalled}
      />

      {/* 30-Second Commercial Showcase Video Modal */}
      <PromoVideoModal
        isOpen={showPromoVideoModal}
        onClose={() => setShowPromoVideoModal(false)}
        onContractClick={() => {
          setSelectedPlanForContract(INITIAL_PLANS[1]);
          setCurrentTab('contract');
        }}
        onScheduleClick={() => {
          setCurrentTab('schedule');
        }}
      />

      {/* Footer - Presente em todas as páginas do projeto */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={retomaLogo} 
                alt="Retoma Digital Logo" 
                className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-md shadow-blue-500/10" 
              />
              <div>
                <div className="font-bold text-slate-200">Retoma Digital & Soluções Locais</div>
                <div className="text-[11px] text-slate-500">
                  CNPJ: 48.912.384/0001-92 • Rio Branco - AC
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-slate-400 text-xs">
              <button
                onClick={() => setIsInstallModalOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{isInstalled ? 'App Instalado' : '💿 Instalar Aplicativo no Celular'}</span>
              </button>
              <span>•</span>
              <span>Suporte WhatsApp: <strong>{RETOMA_PHONE_DISPLAY}</strong></span>
              <span>•</span>
              <span>Cartão NFC Homologado</span>
              <span>•</span>
              <span>Google Meu Negócio & Mapas</span>
            </div>

            <div className="text-slate-500 text-[11px]">
              © {new Date().getFullYear()} Retoma Digital. Todos os direitos reservados.
            </div>
          </div>

          {/* Rodapé Obrigatório de Direitos Autorais e Desenvolvedores */}
          <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-xs bg-slate-950/70 rounded-2xl px-5 py-3.5 border border-slate-800/60 shadow-inner">
            <div className="flex flex-wrap items-center gap-2 text-center sm:text-left">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">
                Desenvolvedores do Projeto & Direitos Autorais:
              </span>
              <strong className="text-white font-bold tracking-wide">
                Bernardo Araújo e Francisco Araújo
              </strong>
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-semibold shrink-0">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px]">
                Rio Branco - Acre
              </span>
              <span>•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px]">
                Nov/2026
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  AppAdminUser, 
  AdminPermissionLevel, 
  AppSettings, 
  ContractItem, 
  Broker 
} from '../types';
import { 
  INITIAL_APP_ADMINS, 
  INITIAL_BROKERS, 
  APP_APK_VERSION, 
  RETOMA_PHONE_DISPLAY, 
  RETOMA_WHATSAPP_OFFICIAL,
  PROJECT_COPYRIGHT_TEXT 
} from '../data/initialData';
import { formatCurrencyBRL } from '../utils/whatsapp';
import { generateCommissionVoucherPDF } from '../utils/pdfGenerator';
import { AdminProductPanel } from './AdminProductPanel';
import { 
  ShieldCheck, 
  Lock, 
  UserPlus, 
  Key, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  Sparkles, 
  DollarSign, 
  Users, 
  Settings, 
  Boxes, 
  LogOut, 
  CheckCircle2, 
  RefreshCw, 
  Smartphone, 
  Download, 
  Tag,
  CreditCard,
  Shield,
  Layers,
  FileCheck
} from 'lucide-react';

interface AdminPanelProps {
  contracts: ContractItem[];
  brokers: Broker[];
  availableNfcStock: number;
  onUpdateAvailableNfcStock: (newStock: number) => void;
  onPayCommission: (contractId: string) => void;
  appSettings: AppSettings;
  onUpdateAppSettings: (settings: AppSettings) => void;
}

type AdminSubTab = 'admins' | 'commissions' | 'settings' | 'products';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  contracts,
  brokers = INITIAL_BROKERS,
  availableNfcStock,
  onUpdateAvailableNfcStock,
  onPayCommission,
  appSettings,
  onUpdateAppSettings,
}) => {
  // Administradores com persistência em localStorage
  const [admins, setAdmins] = useState<AppAdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('retoma_app_admins');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignored
    }
    return INITIAL_APP_ADMINS;
  });

  // Admin Logado no Painel
  const [currentAdmin, setCurrentAdmin] = useState<AppAdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('retoma_logged_admin');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignored
    }
    return null;
  });

  // Sub-Aba Ativa
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('admins');

  // Form de Login State
  const [loginEmail, setLoginEmail] = useState<string>('bernardo.admin@retoma.com.br');
  const [loginPassword, setLoginPassword] = useState<string>('admin2026');
  const [loginError, setLoginError] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);

  // Modal de Cadastro/Edição de Administrador
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [editingAdmin, setEditingAdmin] = useState<AppAdminUser | null>(null);
  const [adminForm, setAdminForm] = useState<{
    name: string;
    email: string;
    password: string;
    permissionLevel: AdminPermissionLevel;
    status: 'ativo' | 'inativo';
  }>({
    name: '',
    email: '',
    password: '',
    permissionLevel: 'master',
    status: 'ativo',
  });
  const [adminFormErrors, setAdminFormErrors] = useState<Record<string, string>>({});
  const [showAdminPassword, setShowAdminPassword] = useState<Record<string, boolean>>({});

  // Configurações do Aplicativo Form State
  const [settingsForm, setSettingsForm] = useState<AppSettings>(appSettings);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState<boolean>(false);

  // Salvar Admins no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('retoma_app_admins', JSON.stringify(admins));
    } catch {
      // Ignored
    }
  }, [admins]);

  // Salvar Admin Logado
  useEffect(() => {
    try {
      if (currentAdmin) {
        localStorage.setItem('retoma_logged_admin', JSON.stringify(currentAdmin));
      } else {
        localStorage.removeItem('retoma_logged_admin');
      }
    } catch {
      // Ignored
    }
  }, [currentAdmin]);

  // Login Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedEmail = loginEmail.trim().toLowerCase();
    const adminFound = admins.find(
      (a) => a.email.toLowerCase() === trimmedEmail && a.password === loginPassword.trim()
    );

    if (!adminFound) {
      setLoginError('E-mail ou senha de administrador inválidos.');
      return;
    }

    if (adminFound.status === 'inativo') {
      setLoginError('Este usuário administrador está desativado pelo Diretor Master.');
      return;
    }

    setCurrentAdmin(adminFound);
  };

  const handleQuickLogin = (admin: AppAdminUser) => {
    setLoginEmail(admin.email);
    setLoginPassword(admin.password);
    setCurrentAdmin(admin);
  };

  const handleLogout = () => {
    setCurrentAdmin(null);
  };

  // Abrir Modal de Cadastro de Admin
  const handleOpenAddAdmin = () => {
    setEditingAdmin(null);
    setAdminForm({
      name: '',
      email: '',
      password: '',
      permissionLevel: 'gerente',
      status: 'ativo',
    });
    setAdminFormErrors({});
    setIsAdminModalOpen(true);
  };

  // Abrir Modal de Edição de Admin
  const handleOpenEditAdmin = (admin: AppAdminUser) => {
    setEditingAdmin(admin);
    setAdminForm({
      name: admin.name,
      email: admin.email,
      password: admin.password,
      permissionLevel: admin.permissionLevel,
      status: admin.status,
    });
    setAdminFormErrors({});
    setIsAdminModalOpen(true);
  };

  // Salvar Administrador (Novo ou Edição)
  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!adminForm.name.trim()) errors.name = 'Nome completo é obrigatório';
    if (!adminForm.email.trim() || !adminForm.email.includes('@')) errors.email = 'E-mail corporativo válido é obrigatório';
    if (!adminForm.password.trim() || adminForm.password.length < 6) errors.password = 'Senha deve ter no mínimo 6 dígitos';

    if (Object.keys(errors).length > 0) {
      setAdminFormErrors(errors);
      return;
    }

    const permissionsForLevel = {
      master: {
        canEditAppInfo: true,
        canEditPricing: true,
        canEditStock: true,
        canViewCommissions: true,
        canPayCommissions: true,
        canManageAdmins: true,
        canManageProducts: true,
      },
      gerente: {
        canEditAppInfo: false,
        canEditPricing: false,
        canEditStock: true,
        canViewCommissions: true,
        canPayCommissions: true,
        canManageAdmins: false,
        canManageProducts: true,
      },
      operador: {
        canEditAppInfo: false,
        canEditPricing: false,
        canEditStock: true,
        canViewCommissions: false,
        canPayCommissions: false,
        canManageAdmins: false,
        canManageProducts: false,
      },
    }[adminForm.permissionLevel];

    if (editingAdmin) {
      // Atualizar
      setAdmins((prev) =>
        prev.map((a) =>
          a.id === editingAdmin.id
            ? {
                ...a,
                name: adminForm.name.trim(),
                email: adminForm.email.trim(),
                password: adminForm.password.trim(),
                permissionLevel: adminForm.permissionLevel,
                status: adminForm.status,
                permissions: permissionsForLevel,
              }
            : a
        )
      );
    } else {
      // Criar Novo
      const newAdmin: AppAdminUser = {
        id: 'admin_' + Date.now(),
        name: adminForm.name.trim(),
        email: adminForm.email.trim(),
        password: adminForm.password.trim(),
        permissionLevel: adminForm.permissionLevel,
        status: adminForm.status,
        createdAt: new Date().toISOString().split('T')[0],
        permissions: permissionsForLevel,
      };
      setAdmins((prev) => [...prev, newAdmin]);
    }

    setIsAdminModalOpen(false);
  };

  // Excluir Administrador
  const handleDeleteAdmin = (adminId: string) => {
    const admin = admins.find((a) => a.id === adminId);
    if (!admin) return;

    if (admins.filter((a) => a.permissionLevel === 'master').length <= 1 && admin.permissionLevel === 'master') {
      alert('Não é possível excluir o único Administrador Master do sistema.');
      return;
    }

    if (confirm(`Deseja realmente remover o administrador "${admin.name}"?`)) {
      setAdmins((prev) => prev.filter((a) => a.id !== adminId));
    }
  };

  // Salvar Configurações Gerais do Aplicativo
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAppSettings(settingsForm);
    onUpdateAvailableNfcStock(settingsForm.readyDeliveryNfcStock);
    setSettingsSavedSuccess(true);
    setTimeout(() => setSettingsSavedSuccess(false), 3500);
  };

  // Se não estiver logado como administrador, exibe Tela de Login Exclusiva
  if (!currentAdmin) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 rounded-3xl bg-blue-600/10 border border-blue-500/20 text-blue-400 shadow-xl">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Painel Administrativo da Retoma Digital
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Acesso restrito para administradores autorizados. Gerenciamento de estoque, comissões de consultores, produtos e credenciais.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
          {loginError && (
            <div className="p-3.5 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              E-mail do Administrador
            </label>
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="admin@retoma.com.br"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Senha de Acesso do Administrador
            </label>
            <div className="relative">
              <input
                type={showLoginPassword ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Entrar no Painel Administrativo</span>
          </button>

          {/* Acesso Rápido para Demonstração / Testes */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Acesso Rápido com Credenciais Oficiais:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {admins.map((adm) => (
                <button
                  key={adm.id}
                  type="button"
                  onClick={() => handleQuickLogin(adm)}
                  className="p-2.5 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-left transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold text-white block truncate">{adm.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">{adm.email}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    adm.permissionLevel === 'master'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : adm.permissionLevel === 'gerente'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {adm.permissionLevel}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    );
  }

  // Painel Administrativo Autenticado
  return (
    <div className="space-y-8 py-4">
      {/* Top Header do Painel Administrativo */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/50 to-slate-900 border border-blue-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Painel Administrativo Autenticado</span>
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
              currentAdmin.permissionLevel === 'master'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : currentAdmin.permissionLevel === 'gerente'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              Nível: {currentAdmin.permissionLevel.toUpperCase()}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {currentAdmin.name}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            {currentAdmin.email} • Acesso a comissões, administradores, estoque e configurações
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </div>

      {/* Navegação entre Sub-Abas do Painel */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
        {[
          { id: 'admins' as AdminSubTab, label: 'Cadastro de Administradores', icon: Users, badge: `${admins.length} Admins` },
          { id: 'commissions' as AdminSubTab, label: 'Comissões de Consultores (50%)', icon: DollarSign, badge: 'Privado' },
          { id: 'settings' as AdminSubTab, label: 'Informações & Configurações do App', icon: Settings, badge: 'Estoque & Preço' },
          { id: 'products' as AdminSubTab, label: 'Gerenciar Produtos (CRUD)', icon: Boxes, badge: 'Catálogo' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-Aba 1: Cadastro de Administradores por Nível de Senha & Permissões */}
      {activeSubTab === 'admins' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Cadastro e Gestão de Administradores por Nível de Senha</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cadastre e altere senhas, níveis de acesso (Master, Gerente, Operador) e permissões de edição do app.
              </p>
            </div>

            {currentAdmin.permissions.canManageAdmins && (
              <button
                type="button"
                onClick={handleOpenAddAdmin}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Cadastrar Novo Administrador</span>
              </button>
            )}
          </div>

          {/* Tabela de Administradores */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Administrador</th>
                  <th className="px-4 py-3">E-mail Corporativo</th>
                  <th className="px-4 py-3">Nível de Acesso</th>
                  <th className="px-4 py-3">Senha de Acesso</th>
                  <th className="px-4 py-3">Permissões</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-white whitespace-nowrap">
                      {admin.name}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">
                      {admin.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase ${
                        admin.permissionLevel === 'master'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : admin.permissionLevel === 'gerente'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {admin.permissionLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-mono text-slate-300">
                        <span>{showAdminPassword[admin.id] ? admin.password : '••••••••'}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setShowAdminPassword((prev) => ({ ...prev, [admin.id]: !prev[admin.id] }))
                          }
                          className="text-slate-400 hover:text-white p-0.5"
                          title="Ver / Ocultar Senha"
                        >
                          {showAdminPassword[admin.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <div className="text-[10px] space-y-0.5">
                        {admin.permissions.canEditAppInfo && <div>• Edita App & Versão</div>}
                        {admin.permissions.canEditPricing && <div>• Edita Preços</div>}
                        {admin.permissions.canEditStock && <div>• Atualiza Estoque 20 un</div>}
                        {admin.permissions.canViewCommissions && <div>• Vê Comissões 50%</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        admin.status === 'ativo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {admin.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {currentAdmin.permissions.canManageAdmins && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEditAdmin(admin)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors cursor-pointer"
                              title="Editar Administrador / Alterar Senha"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAdmin(admin.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 transition-colors cursor-pointer"
                              title="Excluir Administrador"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Aba 2: Comissões dos Consultores (50%) - Visualização Restrita */}
      {activeSubTab === 'commissions' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">
                Controle de Comissões de Consultores (50% por Venda)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Área de acesso restrito ao Administrador. Valores pagos e pendentes aos consultores (Francisco Araújo, Bernardo Araújo, Witor Araújo e Etevino de Araújo).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {brokers.map((broker) => {
              const brokerContracts = contracts.filter((c) => c.brokerId === broker.id || c.brokerName === broker.name);
              const totalSalesVal = brokerContracts.reduce((acc, c) => acc + c.totalValue, 0);
              const totalComm = totalSalesVal * 0.50;
              const pendingComm = brokerContracts
                .filter((c) => c.commissionStatus !== 'paid')
                .reduce((acc, c) => acc + (c.commissionValue || c.totalValue * 0.50), 0);

              return (
                <div key={broker.id} className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">
                      50% Comissão
                    </span>
                    <span className="text-[10px] text-slate-500">{brokerContracts.length} vendas</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">{broker.name}</h4>
                    <div className="text-[11px] text-slate-400">Pix: {broker.pixKey}</div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Vendas:</span>
                      <span className="font-bold text-white">{formatCurrencyBRL(totalSalesVal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Comissão Devida:</span>
                      <span className="font-black text-emerald-400">{formatCurrencyBRL(totalComm)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-amber-400">Pendente de Pix:</span>
                      <span className="font-bold text-amber-400">{formatCurrencyBRL(pendingComm)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Histórico de Vendas com Botão de Pagamento e Emissão de Recibo */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">Vendas Registradas & Pagamento de Comissão via Pix</h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Contrato</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Consultor Responsável</th>
                    <th className="px-4 py-3">Valor da Venda</th>
                    <th className="px-4 py-3">Comissão (50%)</th>
                    <th className="px-4 py-3">Status Pix</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                  {contracts.map((c) => {
                    const commVal = c.commissionValue || c.totalValue * 0.50;
                    const isPaid = c.commissionStatus === 'paid';
                    const broker = brokers.find((b) => b.id === c.brokerId || b.name === c.brokerName);

                    return (
                      <tr key={c.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-bold text-blue-400">{c.contractNumber}</td>
                        <td className="px-4 py-3 text-white font-medium">{c.client.companyName}</td>
                        <td className="px-4 py-3 text-purple-300 font-semibold">{c.brokerName || 'Francisco Araújo'}</td>
                        <td className="px-4 py-3 text-white">{formatCurrencyBRL(c.totalValue)}</td>
                        <td className="px-4 py-3 font-black text-emerald-400">{formatCurrencyBRL(commVal)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {isPaid ? 'Pago via Pix' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!isPaid && (
                              <button
                                type="button"
                                onClick={() => onPayCommission(c.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] cursor-pointer"
                              >
                                Pagar Pix
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const doc = generateCommissionVoucherPDF(c, c.brokerName || 'Consultor', broker?.pixKey);
                                doc.save(`Recibo_Comissao_${c.contractNumber}.pdf`);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              <span>Recibo PDF</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Aba 3: Informações do Aplicativo & Configurações */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <span>Alterar Informações Gerais do Aplicativo</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Altere a quantidade de cartões de pronta entrega (20 unidades), preços dos planos e a versão do APK.
              </p>
            </div>

            {settingsSavedSuccess && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Informações salvas e atualizadas com sucesso!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* 1. Estoque de Cartões Pronta-Entrega */}
            <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
                📦 Quantidade de Cartões Pronta-Entrega em Estoque
              </label>
              <p className="text-[11px] text-slate-400">
                Padrão inicial: 20 unidades prontas. É descontado e atualizado a cada venda no aplicativo.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="number"
                  min="0"
                  max="500"
                  required
                  value={settingsForm.readyDeliveryNfcStock}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, readyDeliveryNfcStock: Number(e.target.value) })
                  }
                  className="w-32 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-black text-cyan-400 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setSettingsForm({ ...settingsForm, readyDeliveryNfcStock: 20 })}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer"
                >
                  Restaurar para 20
                </button>
              </div>
            </div>

            {/* 2. Versão do APK no Rodapé */}
            <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
                📱 Versão do APK Exibida no Rodapé
              </label>
              <p className="text-[11px] text-slate-400">
                Versão inicial solicitada: <strong>Versão 10/2026-11</strong>. Aparece no rodapé de todas as páginas e contratos.
              </p>
              <input
                type="text"
                required
                value={settingsForm.apkVersion}
                onChange={(e) => setSettingsForm({ ...settingsForm, apkVersion: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* 3. Preço Mensal do Plano */}
            <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
                💰 Preço da Mensalidade do Plano (R$)
              </label>
              <p className="text-[11px] text-slate-400">
                Valor das 12 mensalidades (padrão: R$ 20,00).
              </p>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">R$</span>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  required
                  value={settingsForm.planMonthlyPrice}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, planMonthlyPrice: Number(e.target.value) })
                  }
                  className="w-36 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-black text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs text-slate-400">/ mês</span>
              </div>
            </div>

            {/* 4. Preço Anual do Plano */}
            <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-400">
                💰 Preço do Plano Anual (R$)
              </label>
              <p className="text-[11px] text-slate-400">
                12x de R$ 20,00 = R$ 240,00 reais.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">R$</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={settingsForm.planAnnualPrice}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, planAnnualPrice: Number(e.target.value) })
                  }
                  className="w-36 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-black text-white focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs text-slate-400">à vista / ano</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Alterações do Aplicativo</span>
            </button>
          </div>
        </form>
      )}

      {/* Sub-Aba 4: Gerenciar Produtos (CRUD) */}
      {activeSubTab === 'products' && (
        <AdminProductPanel />
      )}

      {/* Modal para Cadastro / Edição de Administrador */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase">
                <Shield className="w-3.5 h-3.5" />
                <span>{editingAdmin ? 'Editar Administrador' : 'Novo Administrador'}</span>
              </div>
              <h3 className="text-xl font-black text-white">
                {editingAdmin ? 'Atualizar Dados & Senha de Acesso' : 'Cadastrar Novo Administrador'}
              </h3>
            </div>

            <form onSubmit={handleSaveAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  placeholder="Ex: Bernardo Araújo"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
                {adminFormErrors.name && (
                  <span className="text-[11px] text-red-400 mt-1 block">{adminFormErrors.name}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  E-mail Corporativo de Login *
                </label>
                <input
                  type="email"
                  required
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  placeholder="nome.admin@retoma.com.br"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
                {adminFormErrors.email && (
                  <span className="text-[11px] text-red-400 mt-1 block">{adminFormErrors.email}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Senha de Acesso (Mínimo 6 dígitos) *
                </label>
                <input
                  type="text"
                  required
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="Digite a senha"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                />
                {adminFormErrors.password && (
                  <span className="text-[11px] text-red-400 mt-1 block">{adminFormErrors.password}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nível de Permissão *
                  </label>
                  <select
                    value={adminForm.permissionLevel}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, permissionLevel: e.target.value as AdminPermissionLevel })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="master">Master (Total)</option>
                    <option value="gerente">Gerente (Finanças/Estoque)</option>
                    <option value="operador">Operador (Estoque)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status da Conta *
                  </label>
                  <select
                    value={adminForm.status}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, status: e.target.value as 'ativo' | 'inativo' })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  {editingAdmin ? 'Salvar Alterações' : 'Cadastrar Administrador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

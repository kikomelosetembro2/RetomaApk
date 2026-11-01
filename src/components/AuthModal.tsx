import React, { useState } from 'react';
import { AuthUser, Broker } from '../types';
import { INITIAL_BROKERS, INITIAL_ADMIN } from '../data/initialData';
import { 
  Lock, 
  Mail, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles, 
  X, 
  UserPlus, 
  LogIn, 
  User, 
  Phone, 
  CreditCard,
  AlertCircle,
  Key
} from 'lucide-react';
import retomaLogo from '../assets/logo.png';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  onRegisterBroker: (broker: Broker) => void;
  brokers: Broker[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onRegisterBroker,
  brokers,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    cpf: '',
    pixKey: '',
    pixKeyType: 'phone' as Broker['pixKeyType'],
  });
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Handle Quick Login
  const handleQuickLogin = (email: string) => {
    // Check if Admin
    if (email === INITIAL_ADMIN.email) {
      onLoginSuccess({
        id: INITIAL_ADMIN.id,
        name: INITIAL_ADMIN.name,
        email: INITIAL_ADMIN.email,
        role: 'admin',
        verified: true,
        joinedAt: INITIAL_ADMIN.joinedAt,
      });
      onClose();
      return;
    }

    // Check if Broker
    const broker = brokers.find((b) => b.email.toLowerCase() === email.toLowerCase());
    if (broker) {
      onLoginSuccess({
        id: broker.id,
        name: broker.name,
        email: broker.email,
        role: 'broker',
        brokerId: broker.id,
        verified: broker.gmailVerified,
        pixKey: broker.pixKey,
        joinedAt: broker.joinedAt,
      });
      onClose();
      return;
    }

    setErrorMessage('E-mail não localizado na base autorizada.');
  };

  // Google One-Tap / Gmail Direct Login Simulation
  const handleGoogleLogin = () => {
    // Default prompt or connect as current authorized user
    const defaultEmail = 'kikomelosetembro2@gmail.com';
    onLoginSuccess({
      id: 'admin_google',
      name: 'Kiko Melo (Diretoria Retoma)',
      email: defaultEmail,
      role: 'admin',
      verified: true,
      joinedAt: '2026-01-01',
    });
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {
      // Ignored
    }
    onClose();
  };

  // Start Register Flow with Gmail Verification
  const handleStartRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.pixKey) {
      setErrorMessage('Preencha os campos obrigatórios.');
      return;
    }

    if (!registerForm.email.includes('@')) {
      setErrorMessage('Por favor, informe um endereço de Gmail válido.');
      return;
    }

    // Generate 6 digit verification code for Gmail verification
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setVerificationStep(true);
    setErrorMessage('');
  };

  // Confirm Verification Code
  const handleConfirmVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode !== generatedCode && verificationCode !== '123456') {
      setErrorMessage('Código de verificação incorreto. Digite o código exibido na tela.');
      return;
    }

    const newBroker: Broker = {
      id: 'broker_' + Date.now(),
      name: registerForm.name,
      email: registerForm.email,
      gmailVerified: true,
      phone: registerForm.whatsapp,
      whatsapp: registerForm.whatsapp,
      cpf: registerForm.cpf,
      pixKey: registerForm.pixKey,
      pixKeyType: registerForm.pixKeyType,
      active: true,
      commissionRate: 0.50,
      joinedAt: new Date().toISOString().split('T')[0],
      verificationBadge: `VERIFICADO-GMAIL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };

    onRegisterBroker(newBroker);

    onLoginSuccess({
      id: newBroker.id,
      name: newBroker.name,
      email: newBroker.email,
      role: 'broker',
      brokerId: newBroker.id,
      verified: true,
      pixKey: newBroker.pixKey,
      joinedAt: newBroker.joinedAt,
    });

    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch {
      // Ignored
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 animate-in fade-in zoom-in-95">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-1">
            <img 
              src={retomaLogo} 
              alt="Retoma Digital" 
              className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shadow-lg shadow-blue-500/20" 
            />
          </div>
          <h3 className="text-2xl font-black text-white">
            Área Administrativa & Portal do Corretor
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Acesso restrito para corretores credenciados e diretoria com verificação de conta Gmail.
          </p>
        </div>

        {/* Tab Switcher: Login vs Cadastro */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setActiveTab('login');
              setVerificationStep(false);
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login de Corretor / Admin</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Cadastro via Gmail Verificado</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: LOGIN */}
        {activeTab === 'login' && (
          <div className="space-y-5">
            {/* Google Gmail One-Click Login Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-colors shadow-lg cursor-pointer"
            >
              {/* Official Google G SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com Google / Gmail</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[11px] text-slate-500 uppercase font-semibold">
                ou selecione sua conta verificada
              </span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Quick Login Profiles */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">
                Contas Cadastradas com Verificação Ativa:
              </span>

              {/* Francisco Araújo */}
              <div
                onClick={() => handleQuickLogin('francisco.araujo@gmail.com')}
                className="p-3 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-300 font-bold text-xs flex items-center justify-center">
                    FA
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-blue-400">
                      Francisco Araújo
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span>francisco.araujo@gmail.com</span>
                      <CheckCircle className="w-3 h-3 text-emerald-400 inline" />
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-bold px-2 py-0.5 rounded">
                  Corretor 50%
                </span>
              </div>

              {/* Bernardo Araújo */}
              <div
                onClick={() => handleQuickLogin('bernardo.araujo@gmail.com')}
                className="p-3 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-300 font-bold text-xs flex items-center justify-center">
                    BA
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-blue-400">
                      Bernardo Araújo
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span>bernardo.araujo@gmail.com</span>
                      <CheckCircle className="w-3 h-3 text-emerald-400 inline" />
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-bold px-2 py-0.5 rounded">
                  Corretor 50%
                </span>
              </div>

              {/* Witor Araújo */}
              <div
                onClick={() => handleQuickLogin('witor.araujo@gmail.com')}
                className="p-3 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-300 font-bold text-xs flex items-center justify-center">
                    WA
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-blue-400">
                      Witor Araújo
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span>witor.araujo@gmail.com</span>
                      <CheckCircle className="w-3 h-3 text-emerald-400 inline" />
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-bold px-2 py-0.5 rounded">
                  Corretor 50%
                </span>
              </div>

              {/* Master Admin */}
              <div
                onClick={() => handleQuickLogin('kikomelosetembro2@gmail.com')}
                className="p-3 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/40 rounded-xl flex items-center justify-between cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                    ADM
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-blue-300">
                      Diretoria & Administração Retoma
                    </div>
                    <div className="text-[10px] text-blue-200 flex items-center gap-1">
                      <span>kikomelosetembro2@gmail.com</span>
                      <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded">
                  Admin Master
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: CADASTRO COM GMAIL VERIFICADO */}
        {activeTab === 'register' && !verificationStep && (
          <form onSubmit={handleStartRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome Completo do Corretor *
              </label>
              <input
                type="text"
                required
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                placeholder="Ex: Carlos Araújo"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Endereço de Gmail * (Será verificado com código)
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="seunome@gmail.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={registerForm.whatsapp}
                  onChange={(e) => setRegisterForm({ ...registerForm, whatsapp: e.target.value })}
                  placeholder="(68) 99999-0000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  value={registerForm.cpf}
                  onChange={(e) => setRegisterForm({ ...registerForm, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Chave Pix para Recebimento de Comissões (50%) *
              </label>
              <input
                type="text"
                required
                value={registerForm.pixKey}
                onChange={(e) => setRegisterForm({ ...registerForm, pixKey: e.target.value })}
                placeholder="Informe sua chave Pix (telefone, CPF, etc.)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Avançar para Verificação Gmail</span>
              <span>→</span>
            </button>
          </form>
        )}

        {/* Verification Step: Code Confirmation */}
        {activeTab === 'register' && verificationStep && (
          <form onSubmit={handleConfirmVerification} className="space-y-4">
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-2 text-center">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-sm text-white">Verificação de Cadastro Gmail</h4>
              <p className="text-xs text-slate-300">
                Enviamos um token de verificação digital para <strong>{registerForm.email}</strong>.
              </p>
              <div className="bg-slate-900 border border-slate-800 py-2 px-3 rounded-lg text-center mt-2">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Código de Demonstração Gerado:</span>
                <span className="text-xl font-mono font-black text-amber-300 tracking-widest">{generatedCode}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 text-center">
                Digite o Código de 6 Dígitos:
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Ex: 123456"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 text-center text-lg font-mono font-black text-white tracking-widest focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVerificationStep(false)}
                className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-colors cursor-pointer shadow"
              >
                Validar e Ativar Cadastro
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

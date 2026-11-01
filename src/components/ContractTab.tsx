import React, { useState, useRef, useEffect } from 'react';
import { Plan, ProductItem, BillingCycle, PaymentMethod, ContractItem, ClientData, Broker } from '../types';
import { 
  INITIAL_PLANS, 
  INITIAL_PRODUCTS, 
  INITIAL_BROKERS, 
  RETOMA_WHATSAPP_OFFICIAL, 
  RETOMA_PHONE_DISPLAY,
  PROJECT_COPYRIGHT_TEXT 
} from '../data/initialData';
import { generateContractPDF } from '../utils/pdfGenerator';
import { getWhatsAppContractUrl, formatCurrencyBRL } from '../utils/whatsapp';
import confetti from 'canvas-confetti';
import { 
  FileText, 
  CheckCircle, 
  Download, 
  Send, 
  Trash2, 
  PenTool, 
  ShieldCheck, 
  CreditCard, 
  Sparkles,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Users,
  DollarSign
} from 'lucide-react';

interface ContractTabProps {
  brokers?: Broker[];
  preselectedPlan?: Plan | null;
  preselectedCycle?: BillingCycle;
  onContractCreated: (contract: ContractItem) => void;
  onOpenContractSuccess: (contract: ContractItem) => void;
}

export const ContractTab: React.FC<ContractTabProps> = ({
  brokers = INITIAL_BROKERS,
  preselectedPlan,
  preselectedCycle = 'annual',
  onContractCreated,
  onOpenContractSuccess,
}) => {
  // Client Data Form State
  const [client, setClient] = useState<ClientData>({
    companyName: '',
    tradeName: '',
    documentType: 'CNPJ',
    documentNumber: '',
    representativeName: '',
    phone: '',
    whatsapp: '',
    email: '',
    addressStreet: '',
    addressNumber: '',
    addressNeighborhood: '',
    addressCity: 'Rio Branco',
    addressState: 'AC',
    addressZip: '',
    businessSegment: 'Comércio / Serviços Gerais',
    instagramHandle: '',
  });

  // Broker selection
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>('broker_francisco');

  // Contract Scope Selection
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    preselectedPlan ? preselectedPlan.id : 'plan_pro'
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(preselectedCycle);
  const [selectedProductQuantities, setSelectedProductQuantities] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [installments, setInstallments] = useState<number>(12);
  const [contractNotes, setContractNotes] = useState<string>('');

  // Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Update selected plan if prop changes
  useEffect(() => {
    if (preselectedPlan) {
      setSelectedPlanId(preselectedPlan.id);
    }
    if (preselectedCycle) {
      setBillingCycle(preselectedCycle);
    }
  }, [preselectedPlan, preselectedCycle]);

  // Handle Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawnSignature(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  // Calculate Totals
  const currentPlan = INITIAL_PLANS.find((p) => p.id === selectedPlanId);
  const planCost = currentPlan
    ? billingCycle === 'annual'
      ? currentPlan.annualPrice
      : currentPlan.monthlyPrice
    : 0;

  const extraProductsTotal = Object.entries(selectedProductQuantities).reduce(
    (acc, [productId, qty]) => {
      const prod = INITIAL_PRODUCTS.find((p) => p.id === productId);
      const quantity = Number(qty) || 0;
      return acc + (prod ? prod.price * quantity : 0);
    },
    0
  );

  let totalContractValue = planCost + extraProductsTotal;
  if (paymentMethod === 'pix') {
    // 5% discount for pix
    totalContractValue = totalContractValue * 0.95;
  }

  // Pre-fill demo client data for quick sales or tests
  const handlePreFillDemo = () => {
    setClient({
      companyName: 'Restaurante & Pizzaria Sabor do Acre Ltda',
      tradeName: 'Pizzaria Sabor do Acre',
      documentType: 'CNPJ',
      documentNumber: '24.912.845/0001-19',
      representativeName: 'Rodrigo Mendonça da Silva',
      phone: '(68) 3224-5540',
      whatsapp: '68992827744',
      email: 'gerencia@pizzariasabordooacre.com.br',
      addressStreet: 'Avenida Brasil',
      addressNumber: '1050',
      addressNeighborhood: 'Centro',
      addressCity: 'Rio Branco',
      addressState: 'AC',
      addressZip: '69900-110',
      businessSegment: 'Alimentação & Gastronomia',
      instagramHandle: '@pizzariasabordooacre',
    });
  };

  const handleSubmitContract = (e: React.FormEvent) => {
    e.preventDefault();

    if (!client.companyName || !client.documentNumber || !client.whatsapp) {
      alert('Por favor, preencha os dados obrigatórios do cliente (Nome/Razão Social, CPF/CNPJ e WhatsApp).');
      return;
    }

    setIsGenerating(true);

    // Get Signature data URL if drawn
    let signatureUrl = '';
    if (hasDrawnSignature && canvasRef.current) {
      signatureUrl = canvasRef.current.toDataURL('image/png');
    }

    // Generate cryptographic validation hash
    const randomHash = 'RET-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
    const contractNum = 'RET-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    // Prepare products breakdown
    const selectedProductsList: ContractItem['selectedProducts'] = [];

    // Add items from plan
    if (currentPlan) {
      currentPlan.includedProducts.forEach((pid) => {
        const prod = INITIAL_PRODUCTS.find((p) => p.id === pid);
        if (prod) {
          selectedProductsList.push({
            productId: prod.id,
            productTitle: `${prod.title} (Incluso no ${currentPlan.name})`,
            quantity: 1,
            unitPrice: 0,
          });
        }
      });
    }

    // Add extra items
    Object.entries(selectedProductQuantities).forEach(([pid, qty]) => {
      const quantity = Number(qty) || 0;
      if (quantity > 0) {
        const prod = INITIAL_PRODUCTS.find((p) => p.id === pid);
        if (prod) {
          selectedProductsList.push({
            productId: prod.id,
            productTitle: prod.title,
            quantity: quantity,
            unitPrice: prod.price,
          });
        }
      }
    });

    const now = new Date();
    const validUntilDate = new Date();
    if (billingCycle === 'annual') {
      validUntilDate.setFullYear(validUntilDate.getFullYear() + 1);
    } else {
      validUntilDate.setMonth(validUntilDate.getMonth() + 1);
    }

    const selectedBroker = brokers.find((b) => b.id === selectedBrokerId);
    const commissionVal = totalContractValue * 0.50; // 50% de comissão

    const newContract: ContractItem = {
      id: 'cont_' + Date.now(),
      contractNumber: contractNum,
      client,
      planId: currentPlan?.id,
      planName: currentPlan?.name,
      billingCycle,
      selectedProducts: selectedProductsList,
      totalValue: totalContractValue,
      paymentMethod,
      installments: paymentMethod === 'credit_card' ? installments : undefined,
      status: 'active',
      signedAt: now.toISOString(),
      validUntil: validUntilDate.toISOString(),
      signatureDataUrl: signatureUrl,
      digitalSignatureHash: randomHash,
      notes: contractNotes,
      brokerId: selectedBrokerId,
      brokerName: selectedBroker?.name || 'Francisco Araújo',
      commissionRate: 0.50,
      commissionValue: commissionVal,
      commissionStatus: 'pending',
    };

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignored
    }

    // Register contract in global state
    onContractCreated(newContract);

    // Generate and trigger PDF download immediately
    try {
      const pdf = generateContractPDF(newContract);
      pdf.save(`Contrato_${newContract.contractNumber}_${client.tradeName || client.companyName}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    }

    setIsGenerating(false);
    onOpenContractSuccess(newContract);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Emissão Jurídica Automatizada</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Formulário Oficial de Contrato de Prestação de Serviços
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Preencha os dados do cliente, escolha o plano ou produtos e emita o PDF oficial com envio automático para o WhatsApp.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePreFillDemo}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          title="Preenche campos de exemplo para testar a emissão do contrato rapidamente"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Preencher Dados de Exemplo</span>
        </button>
      </div>

      <form onSubmit={handleSubmitContract} className="space-y-8">
        {/* Section 1: Dados do Cliente */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">1. Qualificação do Cliente / Contratante</h3>
              <p className="text-xs text-slate-400">Informações que constarão no cabeçalho e cláusulas do contrato em PDF.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Razão Social / Nome Completo *
              </label>
              <input
                type="text"
                required
                value={client.companyName}
                onChange={(e) => setClient({ ...client, companyName: e.target.value })}
                placeholder="Ex: Comercial Silva & Filhos Ltda"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome Fantasia (Marca do Cartão)
              </label>
              <input
                type="text"
                value={client.tradeName}
                onChange={(e) => setClient({ ...client, tradeName: e.target.value })}
                placeholder="Ex: Loja Silva Moda"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Documento
              </label>
              <select
                value={client.documentType}
                onChange={(e) => setClient({ ...client, documentType: e.target.value as 'CNPJ' | 'CPF' })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="CNPJ">CNPJ (Pessoa Jurídica)</option>
                <option value="CPF">CPF (Profissional Liberal / Autônomo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Número do {client.documentType} *
              </label>
              <input
                type="text"
                required
                value={client.documentNumber}
                onChange={(e) => setClient({ ...client, documentNumber: e.target.value })}
                placeholder={client.documentType === 'CNPJ' ? '00.000.000/0001-00' : '000.000.000-00'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Responsável Legal / Representante
              </label>
              <input
                type="text"
                value={client.representativeName}
                onChange={(e) => setClient({ ...client, representativeName: e.target.value })}
                placeholder="Ex: Carlos Roberto da Silva"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp do Cliente *
              </label>
              <input
                type="tel"
                required
                value={client.whatsapp}
                onChange={(e) => setClient({ ...client, whatsapp: e.target.value })}
                placeholder="(68) 99999-0000"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                E-mail para Notificações & Contrato
              </label>
              <input
                type="email"
                value={client.email}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
                placeholder="contato@empresa.com.br"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Segmento de Atuação
              </label>
              <input
                type="text"
                value={client.businessSegment}
                onChange={(e) => setClient({ ...client, businessSegment: e.target.value })}
                placeholder="Ex: Restaurante, Barbearia, Clínica"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Address fields */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Endereço Completo (Rua, Número, Bairro)
              </label>
              <input
                type="text"
                value={client.addressStreet}
                onChange={(e) => setClient({ ...client, addressStreet: e.target.value })}
                placeholder="Ex: Av. Ceará, 1250 - Bairro Centro"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cidade & UF
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={client.addressCity}
                  onChange={(e) => setClient({ ...client, addressCity: e.target.value })}
                  placeholder="Rio Branco"
                  className="w-2/3 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  value={client.addressState}
                  onChange={(e) => setClient({ ...client, addressState: e.target.value })}
                  placeholder="AC"
                  maxLength={2}
                  className="w-1/3 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Seleção de Plano e Produtos */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="p-2 rounded-xl bg-amber-600/10 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">2. Objeto do Contrato: Plano & Produtos</h3>
              <p className="text-xs text-slate-400">Defina o plano principal e adicione produtos avulsos se necessário.</p>
            </div>
          </div>

          {/* Billing Cycle Picker */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Periodicidade do Contrato:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Mensal Recorrente
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>Anual (12 Meses)</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                  -20% OFF
                </span>
              </button>
            </div>
          </div>

          {/* Plans Radio Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {INITIAL_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/20'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-blue-400 uppercase">
                      {plan.badge}
                    </span>
                    <input
                      type="radio"
                      name="plan"
                      checked={isSelected}
                      onChange={() => setSelectedPlanId(plan.id)}
                      className="accent-blue-500 w-4 h-4 cursor-pointer"
                    />
                  </div>
                  <h4 className="font-bold text-white text-base">{plan.name}</h4>
                  <div className="mt-3 text-xl font-black text-white">
                    {formatCurrencyBRL(price)}
                    <span className="text-xs text-slate-400 font-normal">
                      {billingCycle === 'annual' ? ' / ano' : ' / mês'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {plan.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Extra Addon Products */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Deseja adicionar produtos ou serviços avulsos adicionais?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {INITIAL_PRODUCTS.map((prod) => {
                const currentQty = selectedProductQuantities[prod.id] || 0;
                return (
                  <div
                    key={prod.id}
                    className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{prod.title}</div>
                      <div className="text-xs text-emerald-400 font-semibold">{formatCurrencyBRL(prod.price)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedProductQuantities((prev: Record<string, number>) => ({
                            ...prev,
                            [prod.id]: Math.max(0, currentQty - 1),
                          }))
                        }
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-white">
                        {currentQty}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedProductQuantities((prev: Record<string, number>) => ({
                            ...prev,
                            [prod.id]: currentQty + 1,
                          }))
                        }
                        className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: Pagamento e Total */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">3. Condições de Pagamento</h3>
              <p className="text-xs text-slate-400">Escolha como o cliente efetuará o acerto do contrato.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { id: 'pix' as PaymentMethod, label: 'PIX (5% Desconto)', badge: 'À Vista' },
              { id: 'credit_card' as PaymentMethod, label: 'Cartão de Crédito', badge: 'Até 12x' },
              { id: 'boleto' as PaymentMethod, label: 'Boleto Bancário', badge: 'Emissão PDF' },
              { id: 'recurrent' as PaymentMethod, label: 'Cobrança Recorrente', badge: 'Automático' },
            ].map((method) => (
              <div
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === method.id
                    ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {method.badge}
                  </span>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="accent-emerald-500 cursor-pointer"
                  />
                </div>
                <div className="mt-2 font-bold text-sm text-white">{method.label}</div>
              </div>
            ))}
          </div>

          {paymentMethod === 'credit_card' && (
            <div className="flex items-center gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300">Número de Parcelas:</label>
              <select
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 10, 12].map((num) => (
                  <option key={num} value={num}>
                    {num}x de {formatCurrencyBRL(totalContractValue / num)} sem juros
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Total Value Summary Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-950 to-emerald-950/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Valor Total do Contrato
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                {formatCurrencyBRL(totalContractValue)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {currentPlan?.name} ({billingCycle === 'annual' ? 'Anual' : 'Mensal'}) + Itens adicionais
              </p>
            </div>

            <div className="text-right text-xs text-slate-400 space-y-1">
              <div>Vigência: <strong>{billingCycle === 'annual' ? '12 Meses' : '30 Dias (Renovação Automática)'}</strong></div>
              <div>Garantia de Entrega dos Cartões: <strong>Até 7 dias úteis</strong></div>
              <div>Comarca de Foro: <strong>Rio Branco - AC</strong></div>
            </div>
          </div>
        </div>

        {/* Section 4: Corretor Responsável & Comissão (50%) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="p-2 rounded-xl bg-purple-600/10 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">4. Corretor Responsável pelo Fechamento (Comissão de 50%)</h3>
              <p className="text-xs text-slate-400">
                Selecione o corretor que realizou a venda para emissão automática de 50% de comissão via Pix.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {brokers.map((broker) => {
              const isSelected = selectedBrokerId === broker.id;
              const comm = totalContractValue * 0.50;

              return (
                <div
                  key={broker.id}
                  onClick={() => setSelectedBrokerId(broker.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20 shadow-lg'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full uppercase">
                      50% Comissão
                    </span>
                    <input
                      type="radio"
                      name="broker"
                      checked={isSelected}
                      onChange={() => setSelectedBrokerId(broker.id)}
                      className="accent-purple-500 cursor-pointer"
                    />
                  </div>
                  <h4 className="font-bold text-white text-base mt-2">{broker.name}</h4>
                  <div className="text-xs text-slate-400 mt-1">Pix: {broker.pixKey}</div>
                  <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Valor Comissão:</span>
                    <span className="font-black text-emerald-400">{formatCurrencyBRL(comm)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-purple-200">
              <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Comissão de 50% (<strong>{formatCurrencyBRL(totalContractValue * 0.50)}</strong>) será vinculada ao corretor selecionado com recibo em PDF e notificação WhatsApp.
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: Assinatura Digital do Cliente */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">5. Assinatura Eletrônica do Contratante</h3>
                <p className="text-xs text-slate-400">
                  Desenhe a assinatura no quadro abaixo ou utilize a validação criptográfica automática.
                </p>
              </div>
            </div>

            {hasDrawnSignature && (
              <button
                type="button"
                onClick={clearSignature}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Assinatura</span>
              </button>
            )}
          </div>

          <div className="relative border-2 border-dashed border-slate-700 rounded-2xl bg-slate-950 p-2 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={180}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-44 bg-slate-950/80 rounded-xl cursor-crosshair touch-none"
            />
            {!hasDrawnSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-600 text-xs sm:text-sm font-medium">
                ✍️ Assine aqui com o dedo ou mouse (ou clique em Gerar para assinar digitalmente)
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Validade jurídica conforme art. 10 da MP 2.200-2/2001. Carimbo de data/hora e hash SHA-256 serão anexados ao PDF.
            </span>
          </div>
        </div>

        {/* Submit Actions Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-auto flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white py-4 px-8 rounded-2xl font-black text-sm uppercase tracking-wider shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span>
              {isGenerating ? 'Emitindo Contrato & PDF...' : 'Emitir Contrato Oficial em PDF & Salvar'}
            </span>
          </button>
        </div>

        {/* Rodapé do Contrato: Desenvolvedores e Direitos Autorais */}
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Desenvolvedores do Projeto & Direitos Autorais:</span>
            <strong className="text-white">Bernardo Araújo e Francisco Araújo</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Rio Branco - Acre</span>
            <span>•</span>
            <span className="text-purple-400 font-semibold">Nov/2026</span>
          </div>
        </div>
      </form>
    </div>
  );
};

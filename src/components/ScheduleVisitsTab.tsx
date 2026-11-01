import React, { useState } from 'react';
import { VisitSchedule } from '../types';
import { INITIAL_SCHEDULES, RETOMA_PHONE_DISPLAY, RETOMA_WHATSAPP_OFFICIAL } from '../data/initialData';
import { getWhatsAppVisitUrl, formatCurrencyBRL } from '../utils/whatsapp';
import confetti from 'canvas-confetti';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Navigation, 
  MessageCircle, 
  CheckCircle, 
  Plus, 
  Briefcase, 
  FileText,
  Filter,
  Sparkles
} from 'lucide-react';

interface ScheduleVisitsTabProps {
  onConvertToContract: (visit: VisitSchedule) => void;
}

export const ScheduleVisitsTab: React.FC<ScheduleVisitsTabProps> = ({
  onConvertToContract,
}) => {
  const [schedules, setSchedules] = useState<VisitSchedule[]>(INITIAL_SCHEDULES);
  const [showNewModal, setShowNewModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New Visit Form State
  const [formData, setFormData] = useState({
    clientName: '',
    contactPerson: '',
    whatsapp: '',
    address: '',
    city: 'Rio Branco - AC',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    consultant: 'Consultor Retoma',
    purpose: 'demonstration_nfc' as VisitSchedule['purpose'],
    estimatedContractValue: 2748.0,
    notes: '',
  });

  const handleCreateVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.whatsapp || !formData.address) {
      alert('Preencha os campos obrigatórios (Empresa, WhatsApp e Endereço).');
      return;
    }

    const newVisit: VisitSchedule = {
      id: 'vis_' + Date.now(),
      ...formData,
      status: 'scheduled',
    };

    setSchedules([newVisit, ...schedules]);
    setShowNewModal(false);

    // Reset form
    setFormData({
      clientName: '',
      contactPerson: '',
      whatsapp: '',
      address: '',
      city: 'Rio Branco - AC',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      consultant: 'Consultor Retoma',
      purpose: 'demonstration_nfc',
      estimatedContractValue: 2748.0,
      notes: '',
    });
  };

  const handleMarkAsCompleted = (id: string) => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignored
    }

    setSchedules((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: 'converted_to_contract' } : v
      )
    );
  };

  const filteredVisits = schedules.filter((s) => {
    if (filterStatus === 'all') return true;
    return s.status === filterStatus;
  });

  const scheduledCount = schedules.filter((s) => s.status === 'scheduled').length;
  const convertedCount = schedules.filter((s) => s.status === 'converted_to_contract').length;

  return (
    <div className="py-6 space-y-8 max-w-7xl mx-auto">
      {/* Header and Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Gestão Comercial de Campo</span>
          </div>
          <h2 className="text-3xl font-black text-white">
            Agendamento de Visitas para Demonstração & Venda
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Planeje roteiros presenciais para demonstrar o Cartão NFC na prática, encantar o cliente e fechar contratos na hora.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-2xl shadow-lg shadow-blue-600/30 transition-colors flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Nova Visita Comercial</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Visitas Agendadas</span>
            <div className="text-2xl font-black text-blue-400 mt-1">{scheduledCount}</div>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Contratos Fechados em Visita</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{convertedCount}</div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Pipeline Estimado</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {formatCurrencyBRL(
                schedules.reduce((sum, s) => sum + s.estimatedContractValue, 0)
              )}
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtrar:</span>
        </span>
        {[
          { id: 'all', label: 'Todas as Visitas' },
          { id: 'scheduled', label: 'Pendentes' },
          { id: 'converted_to_contract', label: 'Venda Concluída' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterStatus === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Visits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVisits.map((visit) => {
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${visit.address}, ${visit.city}`)}`;
          const whatsUrl = getWhatsAppVisitUrl(visit, visit.whatsapp);

          const purposeLabel = {
            demonstration_nfc: 'Demonstração do Cartão NFC',
            google_proposal: 'Proposta Google Empresa & Mapas',
            contract_closing: 'Fechamento de Contrato',
            follow_up: 'Visita de Pós-Venda',
          }[visit.purpose];

          return (
            <div
              key={visit.id}
              className={`rounded-3xl p-6 border transition-all space-y-4 flex flex-col justify-between ${
                visit.status === 'converted_to_contract'
                  ? 'bg-slate-900/40 border-emerald-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
                      {purposeLabel}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1.5">
                      {visit.clientName}
                    </h3>
                  </div>

                  {visit.status === 'converted_to_contract' ? (
                    <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ✓ Contrato Fechado
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                      Agendado
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{visit.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{visit.whatsapp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Data: {visit.date.split('-').reverse().join('/')} às {visit.time}h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Potencial: {formatCurrencyBRL(visit.estimatedContractValue)}</span>
                  </div>
                </div>

                {/* Address Box */}
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">{visit.address}</span>
                    <span className="text-slate-400">{visit.city}</span>
                  </div>
                </div>

                {visit.notes && (
                  <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                    "{visit.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                {/* Trace route via Google Maps */}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  title="Abrir rota no Google Maps GPS"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Traçar Rota GPS</span>
                </a>

                {/* Send WhatsApp Reminder */}
                <a
                  href={whatsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  title="Enviar mensagem de confirmação para o cliente"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Cliente</span>
                </a>

                {/* Convert to Contract */}
                {visit.status !== 'converted_to_contract' && (
                  <button
                    onClick={() => onConvertToContract(visit)}
                    className="ml-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Gerar Contrato</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Visit Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-black text-white">Agendar Demonstração Presencial</h3>
            <p className="text-xs text-slate-400">
              Preencha os dados do cliente para incluir no roteiro de visitas da equipe comercial.
            </p>

            <form onSubmit={handleCreateVisit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Empresa / Estabelecimento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Ex: Supermercado Araújo"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome do Contato / Decisor
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Ex: Sr. Antônio (Gerente)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    WhatsApp do Cliente *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="(68) 99999-0000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Endereço da Visita (Rua, Número, Bairro) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ex: Av. Nações Unidas, 850 - 7º BEC"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Objetivo</label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value as VisitSchedule['purpose'] })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="demonstration_nfc">Demonstração NFC</option>
                    <option value="google_proposal">Proposta Google</option>
                    <option value="contract_closing">Fechamento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notas & Dores do Cliente
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Levar 2 cartões NFC para demonstrar ao proprietário..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow"
                >
                  Salvar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

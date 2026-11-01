import { ContractItem, VisitSchedule } from '../types';
import { RETOMA_WHATSAPP_OFFICIAL, RETOMA_PHONE_DISPLAY, RETOMA_COMPANY_NAME } from '../data/initialData';

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDateTimeBR(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateString;
  }
}

/**
 * Monta o link do WhatsApp para o número oficial (68 99282-7744) com o contrato completo.
 */
export function getWhatsAppContractUrl(contract: ContractItem, targetPhone = RETOMA_WHATSAPP_OFFICIAL): string {
  const cleanPhone = targetPhone.replace(/\D/g, '');
  const cycleText = contract.billingCycle === 'annual' ? 'Anual (12 Meses)' : 'Mensal Recorrente';
  const paymentMethodLabel = {
    pix: 'PIX (À Vista)',
    credit_card: `Cartão de Crédito ${contract.installments ? `em ${contract.installments}x` : ''}`,
    boleto: 'Boleto Bancário',
    recurrent: 'Assinatura Recorrente',
  }[contract.paymentMethod];

  const productsList = contract.selectedProducts
    .map((p) => `• ${p.quantity}x ${p.productTitle} (${formatCurrencyBRL(p.unitPrice * p.quantity)})`)
    .join('\n');

  const brokerSection = contract.brokerName
    ? `\n🤝 *CORRETOR RESPONSÁVEL:*
• *Nome:* ${contract.brokerName}
• *Comissão (50%):* ${formatCurrencyBRL(contract.commissionValue || contract.totalValue * 0.5)} (${contract.commissionStatus === 'paid' ? 'Paga via Pix' : 'Aguardando Pagamento'})`
    : '';

  const text = `📋 *NOVO CONTRATO EFETUADO - ${RETOMA_COMPANY_NAME}*
---------------------------------------
📄 *Contrato Nº:* ${contract.contractNumber}
📅 *Data/Hora:* ${formatDateTimeBR(contract.signedAt)}
🔐 *Autenticação Hash:* \`${contract.digitalSignatureHash}\`

🏢 *DADOS DO CLIENTE:*
• *Razão Social:* ${contract.client.companyName}
• *Nome Fantasia:* ${contract.client.tradeName || contract.client.companyName}
• *${contract.client.documentType}:* ${contract.client.documentNumber}
• *Responsável:* ${contract.client.representativeName}
• *WhatsApp:* ${contract.client.whatsapp}
• *E-mail:* ${contract.client.email}
• *Cidade/UF:* ${contract.client.addressCity} - ${contract.client.addressState}

📦 *SERVIÇOS & PLANO CONTRATADO:*
• *Plano Principal:* ${contract.planName || 'Serviços Personalizados'}
• *Ciclo:* ${cycleText}
${productsList ? `*Itens Inclusos:*\n${productsList}` : ''}

💰 *CONDIÇÕES FINANCEIRAS:*
• *Valor Total:* *${formatCurrencyBRL(contract.totalValue)}*
• *Forma de Pagamento:* ${paymentMethodLabel}
• *Vigência:* Até ${new Date(contract.validUntil).toLocaleDateString('pt-BR')}${brokerSection}

✍️ *STATUS:* Contrato Assinado Digitalmente pelo cliente e emitido em PDF.
---------------------------------------
_Mensagem gerada automaticamente pelo Sistema de Contratos Retoma Digital._`;

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
}

/**
 * Envia o comprovante/recibo de comissão para o WhatsApp do corretor ou administração
 */
export function getWhatsAppCommissionNoticeUrl(contract: ContractItem, brokerPhone: string): string {
  const cleanPhone = brokerPhone.replace(/\D/g, '');
  const commissionVal = contract.commissionValue || contract.totalValue * 0.5;

  const text = `🎉 *COMISSÃO DE VENDA LIBERADA (50%) - RETOMA DIGITAL*
---------------------------------------
💼 *Corretor:* ${contract.brokerName || 'Corretor'}
📄 *Ref. Contrato:* ${contract.contractNumber}
🏢 *Cliente Fechado:* ${contract.client.companyName}
💰 *Valor do Contrato:* ${formatCurrencyBRL(contract.totalValue)}
💵 *Sua Comissão (50%):* *${formatCurrencyBRL(commissionVal)}*
📅 *Data do Fechamento:* ${formatDateTimeBR(contract.signedAt)}
⚡ *Status:* ${contract.commissionStatus === 'paid' ? '✅ Pago via Pix' : '⏳ Aguardando Liberação / Pix'}
---------------------------------------
_Parabéns pelo fechamento comercial! Retoma Soluções Digitais._`;

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
}

/**
 * Monta o link para avisar o cliente ou o consultor sobre o agendamento de visita
 */
export function getWhatsAppVisitUrl(visit: VisitSchedule, targetPhone = RETOMA_WHATSAPP_OFFICIAL): string {
  const cleanPhone = targetPhone.replace(/\D/g, '');
  const purposeMap = {
    demonstration_nfc: 'Demonstração Prática do Cartão NFC Google Avaliação',
    google_proposal: 'Apresentação de Proposta Google Empresa & Mapas',
    contract_closing: 'Fechamento e Assinatura de Contrato Presencial',
    follow_up: 'Visita de Acompanhamento / Pós-Venda',
  };

  const text = `📍 *AGENDAMENTO DE VISITA COMERCIAL - RETOMA DIGITAL*
---------------------------------------
🏢 *Empresa / Estabelecimento:* ${visit.clientName}
👤 *Contato:* ${visit.contactPerson}
📱 *WhatsApp do Cliente:* ${visit.whatsapp}
📅 *Data:* ${visit.date.split('-').reverse().join('/')} às ${visit.time}h
📍 *Endereço:* ${visit.address} - ${visit.city}
🎯 *Objetivo:* ${purposeMap[visit.purpose]}
💼 *Consultor:* ${visit.consultant}
💵 *Potencial Estimado:* ${formatCurrencyBRL(visit.estimatedContractValue)}

📝 *Notas da Reunião:*
${visit.notes || 'Nenhuma observação informada.'}
---------------------------------------
_Clique no endereço para traçar rota no Google Maps e levar os cartões NFC demonstrativos!_`;

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
}

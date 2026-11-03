import jsPDF from 'jspdf';
import { ContractItem } from '../types';
import {
  RETOMA_COMPANY_NAME,
  RETOMA_CNPJ,
  RETOMA_PHONE_DISPLAY,
  RETOMA_CITY,
  PROJECT_COPYRIGHT_TEXT,
} from '../data/initialData';
import { formatCurrencyBRL } from './whatsapp';

export function generateContractPDF(contract: ContractItem): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 22) {
      doc.addPage();
      y = 20;
    }
  };

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 24, 'F');

  // Accent Line
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(margin, y + 23, contentWidth, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('RETOMA DIGITAL • INTELIGÊNCIA LOCAL', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS DIGITAIS E SOLUÇÕES NFC GOOGLE', margin + 6, y + 15);
  doc.text(`Doc. Nº: ${contract.contractNumber} | Autenticado Digitalmente`, margin + 6, y + 20);

  y += 32;

  // Title Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('INSTRUMENTO PARTICULAR DE PRESTAÇÃO DE SERVIÇOS', pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Introduction
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const introText =
    `Pelo presente instrumento particular, de um lado como CONTRATADA a empresa ${RETOMA_COMPANY_NAME}, inscrita no CNPJ sob nº ${RETOMA_CNPJ}, com sede em ${RETOMA_CITY}, telefone ${RETOMA_PHONE_DISPLAY}; e de outro lado como CONTRATANTE:` ;
  const introLines = doc.splitTextToSize(introText, contentWidth);
  doc.text(introLines, margin, y);
  y += introLines.length * 4.5 + 4;

  // Contratante Info Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 32, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('QUALIFICAÇÃO DO CONTRATANTE:', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const c = contract.client;
  doc.text(`Razão Social / Nome: ${c.companyName} (${c.tradeName || c.companyName})`, margin + 4, y + 12);
  doc.text(`${c.documentType}: ${c.documentNumber}  |  Representante: ${c.representativeName}`, margin + 4, y + 17);
  doc.text(`Telefone / WhatsApp: ${c.whatsapp}  |  E-mail: ${c.email}`, margin + 4, y + 22);
  doc.text(`Endereço: ${c.addressStreet}, ${c.addressNumber} - ${c.addressNeighborhood}, ${c.addressCity}/${c.addressState} - CEP: ${c.addressZip}`, margin + 4, y + 27);

  y += 38;

  // Cláusulas
  const printClause = (title: string, bodyText: string) => {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(title, margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const split = doc.splitTextToSize(bodyText, contentWidth);
    checkPageBreak(split.length * 4.2 + 4);
    doc.text(split, margin, y);
    y += split.length * 4.2 + 4;
  };

  const cycleName = contract.billingCycle === 'annual' ? 'Plano Anual (Vigência 12 Meses)' : 'Plano Mensal Recorrente';
  const productsSummary = contract.selectedProducts
    .map((p) => `${p.quantity}x ${p.productTitle}`)
    .join(', ');

  printClause(
    'CLÁUSULA PRIMEIRA - DO OBJETO E SERVIÇOS CONTRATADOS',
    `1.1. O presente contrato tem por objeto a prestação contínua e implantação de soluções digitais pela CONTRATADA em favor da CONTRATANTE, compreendendo: Plano: "${contract.planName || 'Personalizado'}" (${cycleName}), integrando as soluções: ${productsSummary}.\n` +
    `1.2. Os serviços incluem, conforme o plano eleito: fornecimento de Cartões NFC Google Avaliação físicos com chip de aproximação instantânea, implantação e otimização de perfil Google Empresa (antigo Google Meu Negócio), demarcação de pin e rotas no Google Mapas, estruturação de perfil profissional no Instagram, configuração de caixas de e-mails corporativos (@suaempresa) e fornecimento de criativos de design publicitário para atração e conversão de clientes locais.`
  );

  const paymentLabel = {
    pix: 'PIX à Vista (com confirmação instantânea)',
    credit_card: `Cartão de Crédito ${contract.installments ? `em ${contract.installments}x sem juros` : 'à vista'}`,
    boleto: 'Boleto Bancário',
    recurrent: 'Assinatura Recorrente Mensal',
  }[contract.paymentMethod];

  printClause(
    'CLÁUSULA SEGUNDA - DOS VALORES, FORMA DE PAGAMENTO E RENOVAÇÃO',
    `2.1. Pela prestação dos serviços descritos neste contrato, a CONTRATANTE pagará à CONTRATADA o valor global de ${formatCurrencyBRL(contract.totalValue)} através da modalidade: ${paymentLabel}.\n` +
    `2.2. Nos contratos com vigência anual, o pagamento assegura todos os benefícios com desconto garantido durante os 12 (doze) meses de vigência.\n` +
    `2.3. O atraso no pagamento sujeitará a CONTRATANTE à multa de 2% (dois por cento) sobre o valor devido, acrescido de juros de mora de 1% ao mês.`
  );

  printClause(
    'CLÁUSULA TERCEIRA - DOS PRAZOS DE IMPLANTAÇÃO E ENTREGA',
    `3.1. A entrega dos Cartões NFC Google Avaliação e o início dos serviços de implantação do Google Empresa e Mapas ocorrerão no prazo de 3 (três) a 7 (sete) dias úteis a contar da confirmação do pagamento e do envio dos dados necessários pela CONTRATANTE.\n` +
    `3.2. As artes publicitárias e e-mails corporativos contratados serão entregues conforme cronograma alinhado conjuntamente entre as partes.`
  );

  printClause(
    'CLÁUSULA QUARTA - DAS OBRIGAÇÕES DAS PARTES',
    `4.1. Compete à CONTRATADA: executar os serviços com rigor técnico, prestar suporte comercial e operacional, garantir o funcionamento dos chips NFC fornecidos e manter sigilo sobre dados corporativos.\n` +
    `4.2. Compete à CONTRATANTE: fornecer logotipos, fotos, dados de acesso quando aplicável e colaborar ativamente para que a equipe utilize os cartões NFC nas abordagens com os clientes.`
  );

  if (contract.brokerName) {
    printClause(
      'CLÁUSULA QUINTA - DO ATENDIMENTO E INTERMEDIAÇÃO COMERCIAL',
      `5.1. A intermediação e atendimento da CONTRATANTE foram conduzidos pelo(a) Consultor(a) Comercial Credenciado(a) ${contract.brokerName}, profissional credenciado pela CONTRATADA para orientação técnica, implantação dos serviços digitais e suporte operacional.`
    );
  }

  printClause(
    contract.brokerName ? 'CLÁUSULA SEXTA - DA PROTEÇÃO DE DADOS (LGPD)' : 'CLÁUSULA QUINTA - DA PROTEÇÃO DE DADOS (LGPD)',
    `As partes comprometem-se a cumprir a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), tratando os dados dos clientes estritamente para os fins desta contratação, vedado qualquer compartilhamento indevido.`
  );

  printClause(
    contract.brokerName ? 'CLÁUSULA SÉTIMA - DO FORO' : 'CLÁUSULA SEXTA - DO FORO',
    `As partes elegem o Foro da Comarca de Rio Branco, Estado do Acre, com expressa renúncia a qualquer outro, por mais privilegiado que seja, para dirimir quaisquer dúvidas oriundas deste contrato.`
  );

  // Check signature area space
  checkPageBreak(50);
  y += 4;

  // Digital Signature Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 42, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('TERMO DE ACEITE E ASSINATURA ELETRÔNICA DIGITAL', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Data e Hora da Assinatura: ${new Date(contract.signedAt).toLocaleString('pt-BR')}`, margin + 4, y + 11);
  doc.text(`Hash de Autenticação Digital: ${contract.digitalSignatureHash}`, margin + 4, y + 15);
  doc.text('Validade jurídica conferida nos termos do art. 10, § 2º da Medida Provisória nº 2.200-2/2001.', margin + 4, y + 19);

  // Signatures columns
  const colWidth = (contentWidth - 12) / 2;

  // Left col: Contratada
  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 4, y + 33, margin + 4 + colWidth, y + 33);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(RETOMA_COMPANY_NAME, margin + 4, y + 37);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`CNPJ: ${RETOMA_CNPJ} • Contratada`, margin + 4, y + 40);

  // Right col: Contratante
  const rightX = margin + 8 + colWidth;

  if (contract.signatureDataUrl) {
    try {
      doc.addImage(contract.signatureDataUrl, 'PNG', rightX + 10, y + 21, 35, 11);
    } catch {
      // Fallback if image fails
    }
  }

  doc.line(rightX, y + 33, rightX + colWidth, y + 33);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(contract.client.representativeName || contract.client.companyName, rightX, y + 37);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`${contract.client.documentType}: ${contract.client.documentNumber} • Contratante`, rightX, y + 40);

  // Apply comprehensive footer with developer copyright to all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Contrato Nº ${contract.contractNumber} • ${RETOMA_COMPANY_NAME} • Página ${p} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 11.5,
      { align: 'center' }
    );

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(
      PROJECT_COPYRIGHT_TEXT,
      pageWidth / 2,
      pageHeight - 7.5,
      { align: 'center' }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Autenticação Digital: ${contract.digitalSignatureHash}`,
      pageWidth / 2,
      pageHeight - 3.8,
      { align: 'center' }
    );
  }

  return doc;
}

export function generateCommissionVoucherPDF(contract: ContractItem, brokerName: string, pixKey?: string): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5', // Sleek voucher format
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  // Header Box
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 20, 'F');
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(margin, y + 19, contentWidth, 1.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('RETOMA DIGITAL • COMPROVANTE DE COMISSÃO (50%)', margin + 4, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Recibo Ref. Contrato ${contract.contractNumber} | Venda Fechada`, margin + 4, y + 14);

  y += 28;

  const commissionVal = contract.commissionValue || contract.totalValue * 0.5;

  // Amount Callout
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.rect(margin, y, contentWidth, 24, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52);
  doc.text('VALOR DA COMISSÃO DE VENDA (50%):', margin + 4, y + 7);

  doc.setFontSize(16);
  doc.setTextColor(5, 150, 105);
  doc.text(formatCurrencyBRL(commissionVal), margin + 4, y + 18);

  y += 30;

  // Details
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const lines = [
    `Corretor Beneficiário: ${brokerName}`,
    `Chave Pix Registrada: ${pixKey || 'Cadastrada no Sistema'}`,
    `Cliente / Empresa Contratante: ${contract.client.companyName}`,
    `Valor Total do Contrato: ${formatCurrencyBRL(contract.totalValue)}`,
    `Forma de Pagamento: ${contract.paymentMethod.toUpperCase()}`,
    `Data do Fechamento: ${new Date(contract.signedAt).toLocaleDateString('pt-BR')}`,
    `Status do Pagamento: ${contract.commissionStatus === 'paid' ? 'PAGO VIA PIX' : 'LIBERADO / AGUARDANDO PIX'}`,
    `Autenticação: ${contract.digitalSignatureHash}`,
  ];

  lines.forEach((line) => {
    doc.text(line, margin, y);
    y += 5.2;
  });

  y += 7;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5.5;

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text(`${RETOMA_COMPANY_NAME} • CNPJ: ${RETOMA_CNPJ}`, pageWidth / 2, y, { align: 'center' });
  doc.text(`Rio Branco - AC • WhatsApp: ${RETOMA_PHONE_DISPLAY}`, pageWidth / 2, y + 4, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    PROJECT_COPYRIGHT_TEXT,
    pageWidth / 2,
    y + 9,
    { align: 'center' }
  );

  return doc;
}


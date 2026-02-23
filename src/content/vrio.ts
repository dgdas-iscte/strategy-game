/* ═══════════════════════════════════════════════════════════
   CONTEÚDO VRIO — 8 recursos (jogador escolhe 4)
   ═══════════════════════════════════════════════════════════ */

export interface VRIOContent {
  id: string;
  name: string;
  shortDesc: string;
  recommendedUse: string;
  baseline: { V: boolean; R: boolean; I: boolean; O: boolean };
  preSelected: boolean;
}

const VRIO_CONTENT: VRIOContent[] = [
  {
    id: 'brand',
    name: 'Herança de Marca',
    shortDesc: 'Décadas de capital de marca e profunda confiança dos clientes.',
    recommendedUse: 'Campanhas de marca, programas de fidelização, preço premium',
    baseline: { V: true, R: true, I: true, O: true },
    preSelected: true,
  },
  {
    id: 'tech',
    name: 'Tecnologia Proprietária',
    shortDesc: 'Algoritmos patenteados e uma plataforma técnica única.',
    recommendedUse: 'Transformação digital, lançamento de produtos, investimento em I&D',
    baseline: { V: true, R: true, I: true, O: false },
    preSelected: true,
  },
  {
    id: 'talent',
    name: 'Pipeline de Talento',
    shortDesc: 'Motor de recrutamento de elite e forte cultura de retenção.',
    recommendedUse: 'Iniciativas operacionais, I&D, programas de colaboradores',
    baseline: { V: true, R: false, I: false, O: true },
    preSelected: true,
  },
  {
    id: 'supply',
    name: 'Rede de Cadeia de Abastecimento',
    shortDesc: 'Logística global otimizada e parcerias fiáveis com fornecedores.',
    recommendedUse: 'Otimização de custos, diversificação de fornecedores, resiliência',
    baseline: { V: true, R: false, I: false, O: true },
    preSelected: true,
  },
  {
    id: 'data',
    name: 'Plataforma de Dados de Clientes',
    shortDesc: 'Dados comportamentais ricos e motor de analítica preditiva.',
    recommendedUse: 'Estudos de mercado, fidelização de clientes, personalização',
    baseline: { V: true, R: true, I: false, O: false },
    preSelected: false,
  },
  {
    id: 'finance',
    name: 'Reservas Financeiras',
    shortDesc: 'Balanço sólido com acesso a financiamento e folga financeira.',
    recommendedUse: 'Aquisições, expansão de capacidade, resistência a crises',
    baseline: { V: true, R: false, I: false, O: true },
    preSelected: false,
  },
  {
    id: 'partners',
    name: 'Alianças Estratégicas',
    shortDesc: 'Rede de parcerias, joint-ventures e relações de ecossistema.',
    recommendedUse: 'Expansão de mercado, acordos de parceria, co-desenvolvimento',
    baseline: { V: true, R: true, I: false, O: true },
    preSelected: false,
  },
  {
    id: 'culture',
    name: 'Excelência Operacional',
    shortDesc: 'Profundo compromisso organizacional com a qualidade e eficiência.',
    recommendedUse: 'Programas de eficiência, conformidade, melhoria de processos',
    baseline: { V: true, R: false, I: true, O: false },
    preSelected: false,
  },
];

export default VRIO_CONTENT;

/* ═══════════════════════════════════════════════════════════
   CONTEÚDO PESTEL — 18 cartas (3 por categoria)
   ═══════════════════════════════════════════════════════════ */

export type ExpectedImpactTypeContent =
  | 'cost_pressure'
  | 'demand_shift'
  | 'compliance_risk'
  | 'operational_disruption'
  | 'innovation_shift'
  | 'reputation_pressure';

export interface PestelCardContent {
  id: string;
  category: 'P' | 'E' | 'S' | 'T' | 'Ec' | 'L';
  title: string;
  description: string;
  defaultPolarity: 'opportunity' | 'threat';
  suggestedMetric: 'cash' | 'share' | 'brand' | 'ops';
  expectedImpactType: ExpectedImpactTypeContent;
  tags: string[];
}

const PESTEL_CONTENT: PestelCardContent[] = [
  /* ── Político ─────────────────────────────── */
  {
    id: 'p-sanctions',
    category: 'P',
    title: 'Sanções Comerciais Impostas',
    description:
      'Novos controlos de exportação restringem o acesso a mercados internacionais-chave, forçando uma reconfiguração rápida da cadeia de abastecimento.',
    defaultPolarity: 'threat',
    suggestedMetric: 'cash',
    expectedImpactType: 'cost_pressure',
    tags: ['comércio', 'geopolítica', 'cadeia-abastecimento'],
  },
  {
    id: 'p-deregulation',
    category: 'P',
    title: 'Vaga de Desregulação no Setor',
    description:
      'O governo levanta restrições históricas, reduzindo barreiras à entrada e intensificando a pressão competitiva.',
    defaultPolarity: 'opportunity',
    suggestedMetric: 'ops',
    expectedImpactType: 'demand_shift',
    tags: ['regulação', 'concorrência', 'barreiras'],
  },
  {
    id: 'p-subsidy',
    category: 'P',
    title: 'Subsídio Setorial Anunciado',
    description:
      'Generosos créditos fiscais e financiamento público visam a expansão de capacidade doméstica e relocalização.',
    defaultPolarity: 'opportunity',
    suggestedMetric: 'cash',
    expectedImpactType: 'cost_pressure',
    tags: ['política-fiscal', 'investimento', 'incentivos'],
  },

  /* ── Económico ──────────────────────────────── */
  {
    id: 'e-rates',
    category: 'E',
    title: 'Taxas de Juro Disparam',
    description:
      'O banco central sobe as taxas em 200 pontos base para combater a inflação persistente, restringindo o acesso ao capital.',
    defaultPolarity: 'threat',
    suggestedMetric: 'cash',
    expectedImpactType: 'cost_pressure',
    tags: ['política-monetária', 'inflação', 'capital'],
  },
  {
    id: 'e-emerging',
    category: 'E',
    title: 'Boom nos Mercados Emergentes',
    description:
      'O crescimento rápido do PIB em economias em desenvolvimento abre grandes reservas de procura de consumo inexplorada.',
    defaultPolarity: 'opportunity',
    suggestedMetric: 'share',
    expectedImpactType: 'demand_shift',
    tags: ['crescimento', 'mercados-emergentes', 'procura'],
  },
  {
    id: 'e-recession',
    category: 'E',
    title: 'Receios de Recessão Crescem',
    description:
      'A confiança do consumidor cai acentuadamente à medida que os indicadores económicos sinalizam uma recessão iminente.',
    defaultPolarity: 'threat',
    suggestedMetric: 'share',
    expectedImpactType: 'demand_shift',
    tags: ['recessão', 'consumo', 'retração'],
  },

  /* ── Social ────────────────────────────────── */
  {
    id: 's-talent',
    category: 'S',
    title: 'Guerra pelo Talento Intensifica',
    description:
      'A escassez de mão-de-obra qualificada pressiona os salários em toda a indústria, comprimindo as margens operacionais.',
    defaultPolarity: 'threat',
    suggestedMetric: 'ops',
    expectedImpactType: 'operational_disruption',
    tags: ['força-trabalho', 'salários', 'talento'],
  },
  {
    id: 's-genz',
    category: 'S',
    title: 'Mudança do Consumidor Gen-Z',
    description:
      'As gerações mais jovens exigem marcas com propósito e compromissos ESG transparentes.',
    defaultPolarity: 'opportunity',
    suggestedMetric: 'brand',
    expectedImpactType: 'reputation_pressure',
    tags: ['demografia', 'valores', 'propósito-marca'],
  },
  {
    id: 's-remote',
    category: 'S',
    title: 'Trabalho Remoto Torna-se Norma',
    description:
      'Modelos híbridos permanentes redefinem as expectativas da força de trabalho, os espaços de escritório e o acesso ao talento.',
    defaultPolarity: 'opportunity',
    suggestedMetric: 'ops',
    expectedImpactType: 'operational_disruption',
    tags: ['força-trabalho', 'híbrido', 'flexibilidade'],
  },

  /* ── Tecnológico ─────────────────────────── */
  {
    id: 't-ai',
    category: 'T',
    title: 'IA Automatiza Processos-Chave',
    description:
      'A IA generativa substitui fluxos de trabalho manuais, oferecendo ganhos de eficiência de 40% para adotantes precoces.',
    defaultPolarity: 'opportunity',
    suggestedMetric: 'ops',
    expectedImpactType: 'innovation_shift',
    tags: ['IA', 'automação', 'eficiência'],
  },
  {
    id: 't-breach',
    category: 'T',
    title: 'Violação de Cibersegurança',
    description:
      'Uma fuga de dados setorial erode a confiança dos clientes e desencadeia escrutínio regulatório.',
    defaultPolarity: 'threat',
    suggestedMetric: 'brand',
    expectedImpactType: 'reputation_pressure',
    tags: ['cibersegurança', 'confiança', 'dados'],
  },
  {
    id: 't-cloud',
    category: 'T',
    title: 'Migração Cloud Acelera',
    description:
      'A infraestrutura legada torna-se insustentável; concorrentes cloud-native ganham vantagens decisivas de velocidade.',
    defaultPolarity: 'opportunity',
    suggestedMetric: 'ops',
    expectedImpactType: 'innovation_shift',
    tags: ['cloud', 'infraestrutura', 'agilidade'],
  },

  /* ── Ecológico ────────────────────────────── */
  {
    id: 'ec-carbon',
    category: 'Ec',
    title: 'Taxa de Carbono Entra em Vigor',
    description:
      'A fixação obrigatória do preço do carbono atinge operações intensivas em energia em toda a cadeia de valor.',
    defaultPolarity: 'threat',
    suggestedMetric: 'cash',
    expectedImpactType: 'cost_pressure',
    tags: ['carbono', 'regulação', 'custos'],
  },
  {
    id: 'ec-climate',
    category: 'Ec',
    title: 'Choque Climático na Cadeia',
    description:
      'Eventos climáticos extremos cortam corredores logísticos críticos, causando atrasos generalizados.',
    defaultPolarity: 'threat',
    suggestedMetric: 'ops',
    expectedImpactType: 'operational_disruption',
    tags: ['clima', 'logística', 'disrupção'],
  },
  {
    id: 'ec-esg',
    category: 'Ec',
    title: 'Mandatos ESG Expandem-se',
    description:
      'Investidores e reguladores impõem requisitos mais rigorosos de divulgação e desempenho de sustentabilidade.',
    defaultPolarity: 'opportunity',
    suggestedMetric: 'brand',
    expectedImpactType: 'compliance_risk',
    tags: ['ESG', 'sustentabilidade', 'divulgação'],
  },

  /* ── Legal ─────────────────────────────────── */
  {
    id: 'l-antitrust',
    category: 'L',
    title: 'Investigação Concorrencial Aberta',
    description:
      'As autoridades da concorrência investigam posições dominantes de mercado por potencial abuso.',
    defaultPolarity: 'threat',
    suggestedMetric: 'ops',
    expectedImpactType: 'compliance_risk',
    tags: ['concorrência', 'regulação', 'conformidade'],
  },
  {
    id: 'l-privacy',
    category: 'L',
    title: 'Lei de Proteção de Dados',
    description:
      'Mandatos rigorosos de proteção de dados redefinem como as empresas digitais recolhem e monetizam informação.',
    defaultPolarity: 'threat',
    suggestedMetric: 'ops',
    expectedImpactType: 'compliance_risk',
    tags: ['privacidade', 'dados', 'conformidade'],
  },
  {
    id: 'l-ip',
    category: 'L',
    title: 'Vaga de Litígios de Patentes',
    description:
      'Reivindicações agressivas de propriedade intelectual por concorrentes ameaçam os prazos de lançamento de produtos.',
    defaultPolarity: 'threat',
    suggestedMetric: 'cash',
    expectedImpactType: 'cost_pressure',
    tags: ['PI', 'patentes', 'litígio'],
  },
];

export default PESTEL_CONTENT;

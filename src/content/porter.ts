/* ═══════════════════════════════════════════════════════════
   CONTEÚDO CINCO FORÇAS DE PORTER — 15 cartas (3 por força)
   ═══════════════════════════════════════════════════════════ */

export type ContentPorterForce =
  | 'Rivalry'
  | 'Entrants'
  | 'Substitutes'
  | 'Buyers'
  | 'Suppliers';

export interface PorterCardContent {
  id: string;
  force: ContentPorterForce;
  title: string;
  description: string;
  direction: 'up' | 'down';
  tags: string[];
}

const PORTER_CONTENT: PorterCardContent[] = [
  /* ── Rivalidade ───────────────────────────────── */
  {
    id: 'rv-price-war',
    force: 'Rivalry',
    title: 'Guerra de Preços Deflagra',
    description:
      'Os concorrentes cortam agressivamente os preços para capturar quota, comprimindo margens em toda a indústria.',
    direction: 'up',
    tags: ['preços', 'margens', 'concorrência'],
  },
  {
    id: 'rv-merger',
    force: 'Rivalry',
    title: 'Mega-Fusão de Rivais Concluída',
    description:
      'Dois dos principais concorrentes unem forças, criando um jogador dominante com escala superior.',
    direction: 'up',
    tags: ['F&A', 'consolidação', 'escala'],
  },
  {
    id: 'rv-growth',
    force: 'Rivalry',
    title: 'Crescimento Alivia a Pressão',
    description:
      'A rápida expansão da indústria cria espaço para todos os intervenientes crescerem com rentabilidade.',
    direction: 'down',
    tags: ['crescimento', 'expansão', 'rentabilidade'],
  },

  /* ── Novos Concorrentes ──────────────────────────── */
  {
    id: 'en-tech-giant',
    force: 'Entrants',
    title: 'Gigante Tecnológico Entra',
    description:
      'Uma empresa-plataforma bem capitalizada anuncia a entrada com preços agressivos e recursos profundos.',
    direction: 'up',
    tags: ['disrupção', 'plataforma', 'escala'],
  },
  {
    id: 'en-vc-flood',
    force: 'Entrants',
    title: 'Vaga de Capital de Risco',
    description:
      'Fluxos recorde de capital de risco para startups concorrentes em todo o setor.',
    direction: 'up',
    tags: ['startups', 'financiamento', 'concorrência'],
  },
  {
    id: 'en-barriers',
    force: 'Entrants',
    title: 'Barreiras Regulatórias Aumentam',
    description:
      'Novos requisitos regulamentares aumentam significativamente o custo e a complexidade de entrada no mercado.',
    direction: 'down',
    tags: ['regulação', 'barreiras', 'conformidade'],
  },

  /* ── Substitutos ───────────────────────────── */
  {
    id: 'sb-disruptor',
    force: 'Substitutes',
    title: 'Alternativa Disruptiva Emerge',
    description:
      'Uma solução radicalmente diferente ganha adoção mainstream, ameaçando os produtos-chave.',
    direction: 'up',
    tags: ['disrupção', 'inovação', 'substituição'],
  },
  {
    id: 'sb-opensource',
    force: 'Substitutes',
    title: 'Rival Open-Source Amadurece',
    description:
      'Uma alternativa gratuita e comunitária atinge qualidade e fiabilidade de nível empresarial.',
    direction: 'up',
    tags: ['open-source', 'gratuito', 'comunidade'],
  },
  {
    id: 'sb-switching',
    force: 'Substitutes',
    title: 'Custos de Mudança Aumentam',
    description:
      'A integração profunda na plataforma e o bloqueio de dados tornam as alternativas impraticáveis para os clientes.',
    direction: 'down',
    tags: ['bloqueio', 'integração', 'retenção'],
  },

  /* ── Compradores ────────────────────────────── */
  {
    id: 'bu-concentration',
    force: 'Buyers',
    title: 'Concentração de Clientes Cresce',
    description:
      'Os três maiores clientes representam agora mais de metade da receita total, reforçando a sua alavancagem.',
    direction: 'up',
    tags: ['concentração', 'risco', 'negociação'],
  },
  {
    id: 'bu-transparency',
    force: 'Buyers',
    title: 'Transparência de Preços Expande',
    description:
      'Plataformas de comparação tornam as diferenças de preço e funcionalidades instantaneamente visíveis para os compradores.',
    direction: 'up',
    tags: ['transparência', 'comparação', 'mudança'],
  },
  {
    id: 'bu-loyalty',
    force: 'Buyers',
    title: 'Lealdade à Marca Fortalece',
    description:
      'Programas de retenção fortes e efeitos de ecossistema reduzem o poder negocial dos compradores.',
    direction: 'down',
    tags: ['lealdade', 'retenção', 'ecossistema'],
  },

  /* ── Fornecedores ──────────────────────────── */
  {
    id: 'su-consolidation',
    force: 'Suppliers',
    title: 'Fornecedor-Chave Consolida-se',
    description:
      'Fusões de fornecedores críticos aumentam significativamente o poder de fixação de preços dos inputs.',
    direction: 'up',
    tags: ['consolidação', 'preços', 'dependência'],
  },
  {
    id: 'su-shortage',
    force: 'Suppliers',
    title: 'Escassez de Matérias-Primas',
    description:
      'A escassez de inputs essenciais faz subir os custos acentuadamente e prolonga os prazos de entrega.',
    direction: 'up',
    tags: ['escassez', 'custos', 'abastecimento'],
  },
  {
    id: 'su-platform',
    force: 'Suppliers',
    title: 'Plataforma de Sourcing Lançada',
    description:
      'Um marketplace digital expande dramaticamente as opções de fornecedores e promove licitação competitiva.',
    direction: 'down',
    tags: ['marketplace', 'diversificação', 'digital'],
  },
];

export default PORTER_CONTENT;

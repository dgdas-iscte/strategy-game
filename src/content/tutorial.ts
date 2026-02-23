/* ═══════════════════════════════════════════════════════════
   CONTEÚDO DO TUTORIAL & REGRAS — Fonte única de verdade
   para o tutorial de primeiro acesso e o modal de
   Regras/Ajuda sempre disponível.
   ═══════════════════════════════════════════════════════════ */

export interface TutorialStep {
  id: number;
  title: string;
  body: string;
  visual: 'welcome' | 'pestel' | 'porter' | 'vrio' | 'tokens' | 'actions' | 'movement' | 'final';
}

export interface RulesSection {
  id: string;
  title: string;
  body: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: 'Bem-vindo à Arena Estratégica',
    body: 'Lidere a NexaCorp ao longo de várias rondas de decisão estratégica (2, 4 ou 6, conforme a duração escolhida). Em cada ronda, diagnostica o ambiente externo usando PESTEL e as Cinco Forças de Porter, e depois alavanca as forças internas através de recursos VRIO. O seu objetivo: maximizar a posição no tabuleiro através de bom desempenho e estratégia coerente.',
    visual: 'welcome',
  },
  {
    id: 2,
    title: 'PESTEL — Ambiente Contextual',
    body: 'Cada ronda começa ao tirar uma carta PESTEL (Político, Económico, Social, Tecnológico, Ecológico, Legal) e lançar um dado de intensidade (Fraco / Médio / Forte). Interpreta o evento como Oportunidade ou Ameaça e escolhe qual métrica é mais afetada. Cada carta tem um tipo de impacto esperado — escolher uma métrica alinhada com esse tipo contribui para a coerência PESTEL.',
    visual: 'pestel',
  },
  {
    id: 3,
    title: 'Cinco Forças de Porter — Pressão da Indústria',
    body: 'Cinco medidores de forças competitivas variam de 0 a 5: Rivalidade, Novos Concorrentes, Substitutos, Compradores e Fornecedores. Valores mais altos significam mais pressão sobre a sua empresa. As cartas Porter deslocam estas forças para cima ou para baixo com base na intensidade. Atenção às forças que atingem o máximo — ativam armadilhas se a justificação Porter não for coerente.',
    visual: 'porter',
  },
  {
    id: 4,
    title: 'VRIO — Recursos Internos',
    body: 'A NexaCorp tem um perfil VRIO pré-definido com 8 recursos e flags baseline. Pode confirmar o perfil com um clique ou ajustar até 2 recursos antes de iniciar. Cada recurso é avaliado em: Valioso (V), Raro (R), Inimitável (I) e Organizado (O). A flag O é crítica — sem ela, ações grandes arriscam falha de execução e tokens de resiliência não podem ser gerados.',
    visual: 'vrio',
  },
  {
    id: 5,
    title: 'Tokens de Alavancagem & Resiliência',
    body: 'Os recursos VRIO geram tokens em cada ronda. Tokens de Alavancagem (A) vêm de V+R e potenciam efeitos positivos nas métricas em +30%. Tokens de Resiliência (R) vêm de I+O e cancelam penalidades de recuo de armadilhas. Importante: gastar um token de Resiliência requer que o recurso ativado tenha O=ON.',
    visual: 'tokens',
  },
  {
    id: 6,
    title: 'Ações & Coerência',
    body: 'Escolha entre 3 ações contextuais por ronda e justifique a sua escolha. A coerência é avaliada em 3 componentes: (1) PESTEL — métrica alinhada + intenção correta. (2) Porter — justificação é a força tirada OU a mais alta. (3) VRIO — recurso ativado E compatível com a ação. A coerência influencia o movimento no tabuleiro: 2 ou mais componentes coerentes garantem +1 bónus.',
    visual: 'actions',
  },
  {
    id: 7,
    title: 'Movimento & Armadilhas',
    body: 'O movimento base é +1 por ronda, com bónus de +1 se a coerência for 2 ou superior. Três tipos de armadilhas causam recuo: (A) Choque PESTEL — intensidade ≥ 5 E coerência PESTEL falhou. (B) Pressão Máxima Porter — qualquer força a 5 E coerência Porter falhou. (C) Falha de Execução VRIO — ação grande E O=OFF. Tokens de resiliência mitigam armadilhas mitigáveis.',
    visual: 'movement',
  },
  {
    id: 8,
    title: 'Memorando & Relatório',
    body: 'Após a última ronda, é gerado automaticamente um Memorando do Conselho com: 2 fatores PESTEL dominantes, a força mais crítica, 2 recursos VRIO-chave, e uma ação recomendada. Pode editar qualquer campo e adicionar uma nota opcional. O relatório final mostra a posição no tabuleiro, classificação, cronologia completa e o memorando — use Ctrl+P / Cmd+P para exportar como PDF.',
    visual: 'final',
  },
];

export const RULES_SECTIONS: RulesSection[] = [
  {
    id: 'how-to-win',
    title: 'Como Vencer',
    body: 'Avance a sua posição no tabuleiro ao longo das rondas (2, 4 ou 6). Cada ronda: tire cartas PESTEL + Porter, ative um recurso VRIO, escolha uma ação estratégica e justifique-a. Estratégias coerentes ganham movimento bónus. A posição máxima do tabuleiro depende da duração escolhida (5 em 2 rondas, 9 em 4, 13 em 6). Classificação: ≥75% do máximo = Excelente, ≥50% = Bom, <50% = Arriscado.',
  },
  {
    id: 'pestel',
    title: 'PESTEL',
    body: 'O PESTEL diagnostica o ambiente contextual mais amplo através de seis categorias: Político, Económico, Social, Tecnológico, Ecológico, Legal. Tire uma carta, lance a intensidade (Fraco ×0.5, Médio ×1.0, Forte ×1.5). Interprete como Oportunidade (+métricas) ou Ameaça (−métricas) e escolha qual das 4 métricas é mais afetada. Cada carta tem um tipo de impacto esperado — escolher uma métrica alinhada com esse tipo contribui para a coerência.',
  },
  {
    id: 'five-forces',
    title: 'Cinco Forças',
    body: 'As Cinco Forças de Porter analisam a pressão da indústria: Rivalidade, Novos Concorrentes, Substitutos, Compradores, Fornecedores — cada uma avaliada de 0–5. Mais alto = mais pressão, menor atratividade da indústria. As cartas Porter deslocam forças para cima ou para baixo com base na intensidade. Forças a 5 ativam armadilhas "Pressão Máxima" se a justificação Porter não for coerente.',
  },
  {
    id: 'vrio',
    title: 'VRIO',
    body: 'O VRIO avalia se um recurso pode sustentar vantagem competitiva. V = Valioso (ajuda a explorar oportunidades ou neutralizar ameaças). R = Raro (poucos concorrentes o possuem). I = Inimitável (difícil ou caro de copiar). O = Organizado (estrutura/processos para o explorar). VRIO completo = Vantagem Competitiva Sustentada. Sem O = Vantagem Inexplorada e sem tokens de resiliência. O perfil baseline pode ser confirmado diretamente ou ajustado em até 2 recursos.',
  },
  {
    id: 'tokens',
    title: 'Tokens (A / R)',
    body: 'Alavancagem (A): gerado quando V+R estão ON. Gaste para potenciar efeitos positivos nas métricas em +30%. Máximo um por ronda. Resiliência (R): gerado quando I+O estão ON. Gaste para cancelar a penalidade de recuo de uma armadilha. Requer que o recurso ativado tenha O=ON.',
  },
  {
    id: 'scoring',
    title: 'Classificação & Desempenho',
    body: 'A classificação final baseia-se na posição no tabuleiro como percentil do máximo atingível (≥75% = Excelente, ≥50% = Bom, <50% = Arriscado). O desempenho é a média das 4 métricas ao fecho (Fluxo de Caixa, Quota de Mercado, Capital de Marca, Operações). A coerência total é a soma das coerências de todas as rondas (máximo 3 por ronda). Estes três indicadores — posição, desempenho e coerência — resumem o resultado da simulação no relatório final.',
  },
  {
    id: 'movement',
    title: 'Movimento & Armadilhas',
    body: 'Base: +1 por ronda. Bónus: +1 se coerência ≥ 2. Armadilhas causam recuo: (A) Choque PESTEL — intensidade ≥ 5 E coerência PESTEL falhou → penalidade de −5 na métrica + recuo. (B) Pressão Máxima Porter — qualquer força a 5 E coerência Porter falhou → −3 em todas as métricas + recuo. (C) Falha de Execução VRIO — ação grande E O=OFF → 50% de eficácia da ação + recuo. Tokens de resiliência podem mitigar armadilhas mitigáveis.',
  },
  {
    id: 'memo',
    title: 'Memorando do Conselho',
    body: 'Após a última ronda, é gerado automaticamente um Memorando com base no seu desempenho: 2 categorias PESTEL dominantes (por intensidade), a força de Porter mais crítica (mais alta), 2 recursos VRIO-chave (por nível VRIO) e uma ação recomendada (melhor afinidade com o contexto final). Pode editar qualquer campo e adicionar uma nota justificativa opcional (até 140 caracteres). Campos editados são marcados no relatório.',
  },
];

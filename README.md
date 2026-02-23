# Arena Estratégica

PESTEL + Cinco Forças + VRIO — um jogo de simulação estratégica offline, single-page, construído para a cadeira de Estratégia Executiva.

## Início Rápido

```bash
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no seu browser.

## Build para Produção

```bash
npm run build
npm run preview   # serve o build de produção localmente
```

## Como Jogar

1. **Prólogo** — Responda a 3 questões de cenário que moldam as suas métricas iniciais. Escolha a duração: Rápido (2), Regular (4) ou Longo (6 rondas).
2. **Auditoria VRIO** — Selecione 4 de 8 recursos e atribua flags V/R/I/O.
3. **Rondas** — Cada ronda segue a sequência:
   - Tirar uma carta PESTEL e lançar intensidade
   - Interpretar como Oportunidade ou Ameaça, escolher métrica afetada (com feedback de alinhamento)
   - Tirar uma carta das Cinco Forças de Porter e lançar intensidade
   - Ativar um recurso VRIO
   - Escolher uma ação estratégica e justificar com 3 seletores (PESTEL, Porter, VRIO)
   - Resolução: coerência decomposta (PESTEL ✓/✗, Porter ✓/✗, VRIO ✓/✗), armadilhas, gasto de tokens, alterações nas métricas, movimento no tabuleiro
4. **Memorando do Conselho** — Resumo gerado automaticamente com campos editáveis: 2 PESTEL dominantes, força crítica, 2 recursos-chave, ação recomendada, nota opcional.
5. **Relatório** — Sumário executivo, fórmulas de pontuação, cronologia completa, memorando com marcadores de edição e métricas finais.

## Pontuação

Três pontuações distintas determinam o resultado:

1. **Pontuação de Desempenho** = média das 4 métricas: (Caixa + Quota + Marca + Ops) / 4
2. **Coerência Estratégica** = soma da coerência por ronda (0–3 cada):
   - **PESTEL**: métrica alinhada com o tipo de impacto esperado E intenção da ação corresponde à leitura (ameaça → mitigar, oportunidade → explorar)
   - **Porter**: justificação é a força tirada OU a força mais alta
   - **VRIO**: recurso justificado é o ativado E ação compatível com esse recurso
3. **Posição no Tabuleiro** = percentil do máximo atingível. Classificação: ≥75% Excelente, ≥50% Bom, <50% Arriscado

## Armadilhas

- **Choque PESTEL**: Intensidade ≥ 5 E coerência PESTEL falhou → penalidade de -5 na métrica + recuo
- **Pressão Máxima Porter**: Qualquer força em 5/5 E coerência Porter falhou → -3 em todas as métricas + recuo
- **Falha de Execução VRIO**: Ação "BIG" com recurso não Organizado → 50% de eficácia da ação + recuo

Tokens de Resiliência (R) podem cancelar recuos de armadilhas mitigáveis. Tokens de Alavancagem (A) amplificam efeitos positivos em +30%.

## Memorando do Conselho

Após a última ronda, é gerado automaticamente um Memorando com base no desempenho:
- **2 Categorias PESTEL Dominantes** — selecionadas por intensidade dos eventos
- **Força de Porter Mais Crítica** — a de nível mais alto (empates requerem escolha do jogador)
- **2 Recursos VRIO-Chave** — classificados por nível VRIO e frequência de ativação
- **Ação Recomendada** — melhor afinidade com o contexto final

Todos os campos são editáveis. Campos modificados são marcados como "editado" no relatório. Uma nota justificativa opcional (até 140 caracteres) pode ser adicionada.

## Imprimir Relatório em PDF

No ecrã do Relatório, use a função de impressão do browser (`Ctrl+P` / `Cmd+P`). A página do relatório inclui CSS otimizado para impressão que:

- Remove animações e fundos
- Adiciona bordas às tabelas e preservação de cor
- Evita órfãos nas quebras de página

Selecione "Guardar como PDF" como destino da impressora.

## Stack Tecnológica

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS v4** para estilos
- **Framer Motion** para animações
- **localStorage** para auto-save (sem servidor necessário)

## Resolução de Problemas

| Problema | Solução |
|---|---|
| Ecrã branco após atualização | Limpar localStorage: `localStorage.removeItem('strategy-game-save')` e recarregar |
| Baralho fica sem cartas | Automático — descartes são reembaralhados de volta ao baralho |
| Erro de formato do save após atualização de código | A app migra automaticamente saves de v1 para v2. Se persistir, limpe o localStorage |
| Erros de build | Execute `npx tsc --noEmit` para verificar erros de tipo, depois `npm run build` |

## Estrutura do Projeto

```
src/
  content/        # Conteúdo do jogo: 18 PESTEL, 15 Porter, 8 cartas VRIO
  components/     # UI reutilizável: FlipCard, DiceRoll, ProgressBoard, SidePanel, Tooltip, ConfirmDialog
  screens/        # Ecrãs de página: Início, Prólogo, AuditoriaVRIO, Ronda, DecisãoFinal, Relatório
  store.tsx        # Gestão de estado com useReducer + Context
  utils.ts         # Funções puras do motor de jogo
  data.ts          # Mapeamentos de cartas/ações/rótulos
  types.ts         # Definições de tipos TypeScript
  App.tsx          # Raiz com transições de página AnimatePresence
```

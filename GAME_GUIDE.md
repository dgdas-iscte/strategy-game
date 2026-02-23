# Arena Estratégica — Guia do Jogo

## Visão Geral

Arena Estratégica é uma simulação estratégica para um jogador onde assume o papel de Diretor de Estratégia da NexaCorp. Ao longo de **6 rondas**, diagnostica o ambiente externo usando **PESTEL** e as **Cinco Forças de Porter**, alavanca forças internas através de recursos **VRIO**, e toma decisões estratégicas. O seu objetivo é avançar a posição no tabuleiro através de bom desempenho e estratégia coerente.

---

## Fluxo do Jogo

```
Início → Prólogo (3 cenas) → Auditoria VRIO → 6 Rondas → Sala de Decisão Final → Relatório
```

### 1. Prólogo

Três questões de cenário moldam o contexto da sua empresa e métricas iniciais:

- **Setor** — Plataforma Tecnológica, Bens de Consumo, ou Manufatura Industrial
- **Posição de Mercado** — Líder, Desafiante, ou Especialista de Nicho
- **Prioridade Estratégica** — Crescimento, Excelência Operacional, ou Inovação

Cada escolha ajusta as suas métricas iniciais de Fluxo de Caixa, Quota de Mercado, Capital de Marca e Operações.

### 2. Auditoria VRIO

São apresentados 8 recursos internos. Selecione **4** e avalie cada um no framework VRIO:

| Flag | Questão | O que significa |
|------|---------|-----------------|
| **V** — Valioso | Ajuda a explorar oportunidades ou neutralizar ameaças? | O recurso proporciona benefício estratégico |
| **R** — Raro | Poucos concorrentes o têm? | Não está amplamente disponível no mercado |
| **I** — Inimitável | É difícil ou caro de copiar? | Os concorrentes não conseguem replicá-lo facilmente |
| **O** — Organizado | A empresa tem estrutura/processos para o explorar? | A organização consegue capturar o valor |

Os resultados VRIO determinam a sua posição competitiva:

| Flags | Resultado Competitivo |
|-------|----------------------|
| Nenhuma ou sem V | Desvantagem Competitiva |
| Apenas V | Paridade Competitiva |
| V + R | Vantagem Temporária |
| V + R + I | Vantagem Inexplorada |
| V + R + I + O | Vantagem Competitiva Sustentada |

**Importante:** A flag **O** é crítica. Sem ela, ações grandes arriscam falha de execução, e tokens de resiliência não podem ser gerados.

### 3. Rondas (×6)

Cada ronda segue uma sequência fixa de seis sub-fases:

#### Fase 1 — Tirar Carta PESTEL

Uma carta é tirada do baralho PESTEL representando um evento macro-ambiental. O PESTEL diagnostica o ambiente contextual mais amplo através de seis categorias:

- **P** — Político: política governamental, regulação, estabilidade política
- **E** — Económico: crescimento do PIB, inflação, taxas de juro, confiança do consumidor
- **S** — Social: demografia, mudanças no estilo de vida, mudanças de valores
- **T** — Tecnológico: inovação, automação, ciclos de I&D
- **Ec** — Ecológico: sustentabilidade, clima, restrições ambientais
- **L** — Legal: conformidade, propriedade intelectual, legislação laboral, concorrência

Lance um **dado de intensidade** para determinar quão fortemente o evento afeta o ambiente:

| Dado | Intensidade | Multiplicador |
|------|-------------|---------------|
| 1–2 | Fraco | ×0.5 |
| 3–4 | Médio | ×1.0 |
| 5–6 | Forte | ×1.5 |

Os contextos PESTEL não são independentes — efeitos cruzados entre categorias podem acumular-se ao longo das rondas.

#### Fase 2 — Interpretar PESTEL

Escolha como interpretar o evento:

- **Oportunidade** — Alavancá-lo para vantagem competitiva (+métricas)
- **Ameaça** — Mitigar o risco negativo (−métricas)

Depois selecione qual métrica é mais afetada: Fluxo de Caixa, Quota de Mercado, Capital de Marca ou Operações. Um valor sugerido é fornecido, mas pode escolher diferente.

#### Fase 3 — Tirar Carta Porter

Uma carta é tirada do baralho das Cinco Forças de Porter, representando uma mudança na estrutura competitiva da indústria. As cinco forças são:

| Força | O que mede |
|-------|-----------|
| **Rivalidade** | Intensidade da concorrência entre empresas existentes |
| **Novos Concorrentes** | Ameaça de novos concorrentes a entrar no mercado |
| **Substitutos** | Ameaça de produtos ou serviços alternativos |
| **Compradores** | Poder negocial dos clientes |
| **Fornecedores** | Poder negocial dos fornecedores |

Cada força é avaliada de 0–5. **Valores mais altos = mais pressão = menor atratividade da indústria.**

A carta Porter desloca uma força para **cima** (pior) ou para **baixo** (melhor) com base no dado de intensidade. As forças são limitadas ao intervalo 0–5.

#### Fase 4 — Ativar Recurso VRIO

Escolha um dos seus 4 recursos selecionados para ativar nesta ronda. O recurso ativado:

- Gera **tokens** com base nas suas flags (ver secção Tokens)
- Determina bónus de afinidade para certas ações
- Afeta se as armadilhas podem ser mitigadas

#### Fase 5 — Escolher Ação e Justificar

Três ações contextuais são apresentadas, selecionadas com base no contexto da ronda atual (categoria PESTEL, força Porter, recurso VRIO ativado). As ações têm:

- **Efeitos base** em Caixa, Quota de Mercado, Marca e Operações
- **Bónus de afinidade** que ativam quando o contexto da ronda corresponde
- Uma tag **BIG** (algumas ações são de alto risco/alta recompensa)

Após selecionar uma ação, deve **justificar** a sua escolha ligando-a a:

1. Uma **categoria PESTEL** que está a visar
2. Uma **força Porter** que está a endereçar
3. Um **recurso VRIO** que está a alavancar

Este é um teste de coerência estratégica — consegue lembrar-se e conectar corretamente as cartas que acabou de tirar?

#### Fase 6 — Resolução

Uma revelação cinemática em 5 passos mostra o resultado da ronda:

1. **Pontuação de Coerência (0–3)** — Cada correspondência correta de justificação ganha 1 ponto
2. **Armadilhas** — Verificação de armadilhas ativadas (ver secção Armadilhas)
3. **Tokens Ganhos** — Do recurso VRIO ativado
4. **Alterações nas Métricas** — Efeitos da ação + impacto PESTEL + penalidades de armadilhas, com gasto opcional de Alavancagem
5. **Movimento no Tabuleiro** — Mudança final de posição

---

## Métricas

Quatro métricas acompanham o desempenho da sua empresa, cada uma variando de **0 a 100**:

| Métrica | O que representa |
|---------|-----------------|
| **Fluxo de Caixa** | Saúde financeira e liquidez |
| **Quota de Mercado** | Posição competitiva e base de receitas |
| **Capital de Marca** | Reputação, confiança e força da marca |
| **Operações** | Eficiência, qualidade e capacidade operacional |

As métricas mudam cada ronda com base nos efeitos das ações, impacto PESTEL e penalidades de armadilhas. Todos os valores são limitados a 0–100.

---

## Tokens

Os recursos VRIO geram dois tipos de tokens:

### Alavancagem (A)

- **Gerado quando:** Recurso ativado tem V + R = ON
- **Efeito:** Gastar para amplificar todos os efeitos positivos nas métricas em **+30%** nesta ronda
- **Limite:** Um por ronda

### Resiliência (R)

- **Gerado quando:** Recurso ativado tem I + O = ON
- **Efeito:** Gastar para **cancelar a penalidade de recuo de uma armadilha**
- **Requisito:** O recurso ativado deve ter **O = ON** para gastar resiliência
- **Limite:** Um por armadilha

---

## Tabuleiro e Movimento

O tabuleiro é uma pista linear da posição **0 a 13**. Movimento por ronda:

| Componente | Valor |
|-----------|-------|
| Movimento base | +1 |
| Bónus de coerência (se pontuação ≥ 2) | +1 |
| Recuos de armadilhas não mitigadas | −1 cada |

**Melhor caso:** +2 por ronda. **Pior caso:** −2 por ronda.

Classificação final baseada na posição do tabuleiro após a ronda 6:

| Posição | Classificação |
|---------|--------------|
| 11–13 | Excelente |
| 7–10 | Bom |
| 4–6 | Médio |
| 0–3 | Fraco |

---

## Armadilhas

Três tipos de armadilha podem ativar durante a resolução, cada uma causando um **recuo de −1** no tabuleiro:

### A) Choque PESTEL

- **Gatilho:** Intensidade PESTEL ≥ 5 E coerência < 2
- **Penalidade:** −5 na métrica afetada + recuo
- **Mitigável:** Sim (com token de Resiliência, se O = ON)

### B) Pressão Máxima Porter

- **Gatilho:** Qualquer força em 5/5 E essa força não foi endereçada na justificação
- **Penalidade:** −3 em todas as quatro métricas + recuo
- **Mitigável:** Sim (com token de Resiliência, se O = ON)

### C) Falha de Execução VRIO

- **Gatilho:** Ação BIG E recurso ativado tem O = OFF
- **Penalidade:** Eficácia da ação reduzida a 50% + recuo
- **Mitigável:** Não

---

## Sala de Decisão Final

Após a ronda 6, sintetiza a sua análise estratégica:

1. **2 Categorias PESTEL Dominantes** — Com base na frequência ao longo das 6 rondas
2. **Força Porter Mais Crítica** — A força mais alta (desempate se necessário)
3. **2 Recursos VRIO-Chave** — Do seu portfólio auditado
4. **Ação para o Próximo Trimestre** — Que ação estratégica tomaria a seguir, com justificações ligando PESTEL, Porter e VRIO

---

## Relatório

Um relatório abrangente de análise estratégica é gerado com:

- **Sumário Executivo** — Gerado automaticamente a partir da sua decisão final e desempenho no jogo
- **Tabela de Análise PESTEL** — Todas as cartas tiradas, interpretações e efeitos
- **Visualização das Cinco Forças** — Níveis finais das forças com a mais crítica destacada
- **Tabela de Avaliação VRIO** — Flags de recursos e resultados competitivos
- **Cronologia das Rondas** — Deltas de métricas, pontuações de coerência, armadilhas e movimento por ronda

Use **Ctrl+P / Cmd+P** e selecione "Guardar como PDF" para exportar o relatório.

---

## Modo Demo / Professor

Clique em **Modo Demo (Professor)** no ecrã inicial para uma sessão totalmente automatizada e determinística:

- RNG com semente produz cartas e dados idênticos sempre
- Prólogo e auditoria VRIO são preenchidos automaticamente
- Cada ronda avança automaticamente por todas as fases
- Útil para demonstrações em sala de aula e testes

---

## Referência dos Frameworks Estratégicos

### PESTEL

O PESTEL é uma ferramenta de diagnóstico estratégico para o **ambiente contextual/macro**. Os seis contextos não são independentes — existem frequentemente relações cruzadas entre tendências. Alguns fatores são controláveis, outros não. O ambiente externo muda continuamente.

### Cinco Forças de Porter

As Cinco Forças de Porter analisam o **ambiente da indústria/competitivo**. Níveis de força mais altos significam mais pressão competitiva e menor atratividade da indústria:

- **Rivalidade** — Mais rivais ou concorrência agressiva comprime as margens
- **Novos Concorrentes** — Barreiras mais baixas convidam nova concorrência
- **Substitutos** — Melhores alternativas erosionam a diferenciação
- **Compradores** — Compradores consolidados ou sensíveis ao preço reduzem o poder de fixação de preços
- **Fornecedores** — Fornecedores concentrados ou escassos aumentam os custos dos inputs

### VRIO

O VRIO é uma metodologia da Visão Baseada em Recursos (RBV) para avaliar se os recursos/capacidades internos conseguem sustentar vantagem competitiva. As quatro questões constroem-se sequencialmente — um recurso deve passar cada teste para alcançar vantagem sustentada. A dimensão **Organizado** é particularmente importante: mesmo um recurso valioso, raro e inimitável falha em entregar resultados se a organização não tiver a estrutura e processos para o explorar.

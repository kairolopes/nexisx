# PRODUCT.md — Visão de produto

## Públicos
- **Famílias / responsáveis** — acompanham filhos, registram o dia a dia.
- **Profissionais** — gerenciam pacientes vinculados, registram evolução e pareceres.
- **Escolas / clínicas** — registram comportamento, adaptação e interação social.
- **Consultores** — gerenciam solicitações comerciais (salas sensoriais e exames).
- **Administradores** — operam tudo.

## Módulos

### Site público
Home, Sobre, Salas Sensoriais, DNA/Exoma, Para Famílias, Para Profissionais,
Para Escolas e Clínicas, Contato, Login.

### Triagem (interno)
Fluxo de 10 etapas: login → cadastro da criança → dados do responsável → consentimento
→ upload da foto → resultado preliminar (análise facial) → M-CHAT → resultado → relatório
preliminar → encaminhamento.
- **Análise facial:** upload, preview, consentimento, status, resultado, observações,
  recomendação. *Aviso: não fecha diagnóstico.*
- **Triagem Digital Assistiva:** análise comportamental por vídeo curto (ou foto),
  combinada ao M-CHAT — fenotipagem comportamental digital (pipeline de 18 etapas; hoje
  mock). Mostra qualidade da coleta, sinais (olhar, cabeça, expressões, piscar, resposta ao
  nome, motor), risco, confiança, explicabilidade e fusão com M-CHAT. *Aviso: é triagem
  assistiva, não diagnóstico; resultados interpretados por profissional habilitado.*
- **M-CHAT:** questionário em cards, progresso, Sim/Não, salvamento automático,
  classificação (baixo / moderado / alto). *Aviso: é triagem, não diagnóstico.*
- **Relatório:** consolida dados, resultados, prioridade e próximos passos.

### Acompanhamento do neurodivergente (interno)
Perfil completo, linha do tempo, tarefas e rotina (status + pontuação + recompensas),
jogos e atividades (cognição, atenção, memória, associação, comunicação, coordenação,
regulação, sensorial), relatórios evolutivos, diário dos pais, área do profissional,
área da escola.

### Genética
Solicitação de exames (DNA, exoma, genoma, CGH Array), upload de laudos, histórico,
resumos para família e para profissional, status. *Aviso: não substitui geneticista.*

### Salas sensoriais
Página pública (o que é, indicações, benefícios, ambientes, recursos, CTAs) + gestão
interna de solicitações comerciais.

### Administração
Dashboard com indicadores (crianças, triagens, acompanhamento, tarefas, salas, exames,
relatórios pendentes, leads), gráficos, tabelas e busca; gestão de responsáveis,
profissionais, escolas, usuários/permissões e configurações.

## Princípios de design
Sofisticado, futurista e acolhedor (saúde + tecnologia): glassmorphism leve, gradientes,
tipografia moderna (Sora + Inter), muito espaço em branco, cards com hover, transições
suaves e responsividade total.

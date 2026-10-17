# Histórico consolidado de alterações - MarIA, Fase 02

Versão atual: **1.2, 17/10/2026**. Especificação: 38 páginas; arquitetura: 9 páginas; relatório de alterações: 3 páginas. Molde, identidade institucional, seções 1 a 27 e códigos anteriores preservados. Apêndices adicionados sem deslocar a paginação das seções anteriores.

## Novidades da versão 1.2

- Prazos de autorização de 10, 30, 60 ou 90 dias, contados da solicitação, com novo aceite por pedido. Contrato muda de expires_at fornecido pelo cliente para duration_days.
- Navegação separada de Pacientes e Autorizações, além de Meu histórico e Meu perfil para o paciente.
- Histórico integral do próprio paciente, contribuições com autoria identificada e envio de exames.
- Anexo opcional no atendimento médico autorizado. Um PDF/JPG/PNG por registro, até 10 MB, armazenado privadamente no PostgreSQL.
- Câmera móvel quando suportada; sem recorte/OCR e sem validação física de scanner em celular.
- Download original restrito ao paciente. A implementação inicial permitia ao médico baixar; essa política foi corrigida. Agora recebe 403 no original, inclusive se autor.
- Visualizador médico no HUB com páginas PNG geradas no servidor, identificação de usuário/horário, acesso por página e revalidação em 30 segundos. Não promete impedir prints, cópia de imagens ou reproduções anteriores.
- Perfis editáveis: nome e contato; nascimento e identificador do paciente; especialidade e CRM/UF do médico. CRM declarado, não verificado. Papéis, usuário e habilitação não são alterados.
- AccountProfile e Attachment no modelo/DER; migrações 0005/0006. Stack inclui Pillow 12.3.0 e pypdfium2 5.14.0.
- 45 testes aprovados no PostgreSQL em 17/10/2026. Visualizador conferido no navegador; inspeção visual dos perfis bloqueada pela ferramenta.

## Rastreabilidade atual

- Parte 00: versão 1.2 no histórico (p. 4).
- Parte 02: situação, cronograma e evidências (pp. 8-9).
- Requisitos: RF-016 integrado, RF-018 restrito, RF-017 perfis e RF-024 prazos (pp. 16-17); novos RF-028/029/030 e RNE-025/026/027 (p. 38).
- Navegação: seção 16 (p. 20). Modelo/DER: seção 18 (pp. 24-25).
- Arquitetura/tecnologias/implementação: seções 20-23 (pp. 26-33), detalhamento complementar nas pp. 36-37.
- Qualidade/segurança/extensões: seções 24-27 (pp. 34-35).
- Arquitetura separada: páginas 1-7 revisadas; modelo, endpoints e limitações detalhados nas pp. 8-9.

Nenhum código de negócio, dado clínico, chave, senha ou permissão foi alterado nesta revisão documental. Não houve execução de seed ou envio ao GitHub. O relatório PDF reúne mudanças antigas e novas; o registro detalhado anterior está preservado abaixo como histórico da versão 1.1.

---

## Registro histórico da versão 1.1 (15/10/2026)

# Alterações no documento de especificação MarIA

Atualização de 15/10/2026, versão 1.1, 6º período, Fase 02.

Base: PDF de especificação da Fase 01 fornecido pela equipe e PDF de arquitetura anexado. O conteúdo foi confrontado com o código local e a documentação técnica do incremento profissional. Os arquivos de Downloads foram preservados; as cópias atualizadas estão em output/pdf/.

## Molde preservado

- Identidade institucional: logotipos, faixa superior, marca d'água e rodapé gráfico extraídos do próprio PDF de especificação.
- Ordem das Partes 00 a 06, seções 1 a 27 e subseções existentes.
- Organização tabular das regras e requisitos, com identificação, descrição, status e prioridade/referências.
- Matrículas, nomes, funções da equipe e histórico de versões anteriores, com redação condensada em algumas células.
- Códigos RNE-001 a RNE-018, RF-001 a RF-023 e RNF-001 a RNF-021 mantidos para rastreabilidade.
- A arquitetura separada mantém a sequência 20, 20.1, 20.2, 21, 21.1, 21.2, 22, 22.1, 22.2 e 22.3, com tabelas de grade preta.

A paginação da especificação passou de 34 para 35 páginas para acomodar os requisitos e manter a leitura; o sumário foi atualizado. O PDF de arquitetura continua com 7 páginas. Não se trata de edição do arquivo Word original: os insumos recebidos eram PDFs, e o conteúdo atualizado foi recomposto no molde visual fornecido.

## Mudanças por seção

As páginas abaixo se referem à nova especificação.

| Seção | Páginas | Mudança realizada |
| --- | --- | --- |
| Capa e sumário | 1-3 | Identificação do HUB profissional, Fase 02 e data; sumário e páginas corrigidos. |
| Parte 00 | 4 | Inclusão da versão 1.1 com integração, autorização pessoal, atendimento direto, banco compartilhado e validação. Histórico anterior mantido. |
| 1 e 2.1 | 5 | Descrição do produto alinhada ao médico independente e à identidade central do paciente. Retirada a afirmação de multitenancy como arquitetura implementada. Separados MVP e módulos futuros. |
| 2.2 | 6 | Problemas organizados em fragmentação de registros, dependência de sistemas locais e controle do compartilhamento pelo paciente, preservando o molde das tabelas. |
| 3 e 4 | 7 | Dados da equipe preservados. Artefatos distinguem Figma, GitHub, portal integrado, demo técnica e documentação. Registrado que o incremento local ainda não foi enviado. |
| Parte 02 / 5-7 | 8-9 | Situação técnica real, objetivos da integração e distribuição de responsabilidades informada por Carlos. Conclusão técnica separada da revisão pendente da equipe; não foram inventadas datas de sábado. |
| 8 e 9 | 9-10 | Médico como usuário principal; paciente decide o acesso; clínica como contexto/procedência. Retiradas garantias absolutas de segurança e conformidade. |
| 10-12 | 10-11 | Pesquisa e referência anterior preservadas como histórico, sem inventar nova pesquisa ou evidência clínica. Evolução visual descrita de acordo com o portal atual. |
| 13 | 11-14 | Regras existentes revisadas e status explicitado. Incluídas RNE-019 a RNE-024 para autorização, recorte temporal, revogação, autoria e auditoria. |
| 14 | 14-17 | Status dos requisitos confrontados com os fluxos existentes. Incluídos RF-024 a RF-027. Agenda, documentos, finanças e IA não são apresentados como integrados. |
| 15 | 18-19 | RNFs alinhados ao banco compartilhado, acesso por regras e stack efetiva; metas de desempenho/disponibilidade não medidas permanecem pendentes. |
| 16 e 17 | 20-23 | Navegação atual do médico/paciente e organização da equipe; substituição dos diagramas e estórias pelo fluxo de continuidade. Recursos antigos permanecem como backlog. |
| 18 | 24-25 | Modelo com identidades, vínculos, integração, registros, autorizações e auditoria. Explicação das migrações 0003/0004 e reaproveitamento da seed sem recriar o banco. |
| 19 | 25-26 | Experimentos anteriores diferenciados da stack atual; registro dos testes e da validação manual. |
| 20 | 26-27 | Arquitetura de apresentação, API e PostgreSQL compartilhado. Novo diagrama; retirada de schemas por médico e serviços inexistentes. |
| 21 | 27-28 | Python/Django/DRF, PostgreSQL, HTML/CSS/JS, JWT existente, Docker, Figma, Git e DBeaver. Tailwind, Celery/Redis e django-tenant-schemas retirados da stack implementada. |
| 22.1 | 28-29 | Funcionalidades realmente conectadas, arquivos responsáveis, sessão e limitações do frontend. Separadas páginas legadas e portal funcional. |
| 22.2 | 30-31 | Endpoints reais, organização backend/config e backend/hub, serviços, validações, transações e auditoria. Retirada a descrição de pastas /core e /apps inexistentes. |
| 22.3 | 31-32 | Texto de orientação do modelo substituído pela integração efetiva: Fetch, JSON, Bearer JWT, fluxos de ponta a ponta, respostas HTTP e ingestão anterior. |
| 23 | 32-33 | Árvore de pastas corrigida para a organização real e limites das proteções explicados. |
| 24 e 25 | 34 | Evidência de 31 testes no PostgreSQL e validação manual. Segurança implementada diferenciada das revisões pendentes de produção. |
| 26 e 27 | 35 | Extensões futuras e avaliação parcial da Fase 02, com limitações e próximos passos explícitos. |

## Regras de negócio alteradas ou acrescentadas

- **RNE-001 a 005, 007 a 010, 013 a 015 e 017:** preservadas como propostas futuras, sem afirmar que pagamentos, retornos, agenda, fila, aplicativo, documentos e IA já funcionam na API.
- **RNE-006:** identidade central do paciente com os campos efetivos; retirada a obrigação de cadastrar o paciente em um banco exclusivo do médico. Campos adicionais e cadastro público não foram declarados implementados.
- **RNE-011:** controle por perfil, autoria e autorização, substituindo isolamento total por tenant/schema.
- **RNE-012:** perfil profissional ativo existe; verificação real/automática de CRM continua pendente.
- **RNE-016:** autenticação JWT e verificação de perfis substituem roteamento de schema e seleção de módulos comerciais.
- **RNE-018:** solicitação de exclusão/anonimização permanece planejada. Revogação não apaga dados.
- **RNE-019, nova:** autorização pessoal temporária, sem exigir atendimento prévio ou nova aprovação da origem.
- **RNE-020, nova:** histórico limitado aos registros ocorridos e recebidos até o aceite.
- **RNE-021, nova:** efeito de expiração/revogação, considerando a possibilidade de outra autorização vigente.
- **RNE-022, nova:** autor identificado pelo servidor e clínica opcional com vínculo ativo quando informada.
- **RNE-023, nova:** consulta separada dos próprios registros após encerramento do compartilhamento.
- **RNE-024, nova:** auditoria, consistência e idempotência da ingestão anterior.

## Requisitos funcionais com mudança relevante

- **RF-001:** cadastro parcial pela seed; identidade central do paciente.
- **RF-008:** histórico integrado; agenda ainda não integrada.
- **RF-010:** cadastro direto implementado com data, descrição e contexto opcional; anamnese especializada/correções futuras.
- **RF-011:** leitura compartilhada por autorização e recorte temporal.
- **RF-017:** autenticação e perfis, sem multitenancy.
- **RF-021:** busca por nome na carteira; sem busca pública por CPF.
- **RF-024, novo:** solicitar acesso pessoal.
- **RF-025, novo:** aceitar, recusar e revogar.
- **RF-026, novo:** consultar registros de autoria própria.
- **RF-027, novo:** registrar auditoria das operações cobertas pelos serviços.

Nos demais RFs, a mudança principal foi o status e a distinção entre tela legada, planejamento e recurso efetivamente integrado. As prioridades anteriores foram mantidas para os códigos existentes; a reavaliação global de prioridades cabe à equipe.

## Requisitos não funcionais com mudança relevante

- **RNF-003:** arquitetura compartilhada substitui arquitetura multitenant.
- **RNF-006:** PostgreSQL passou de planejado para implementado.
- **RNF-010:** filtro/validação no backend substituem biblioteca de schemas individuais.
- **RNF-008 e RNF-012:** JWT e autorização existentes não foram confundidos com segurança de produção ou conformidade integral.
- **RNF-013 e RNF-021:** frontend nativo efetivamente utilizado, sem Tailwind.
- **RNF-020:** backend Python/Django passou de não iniciado para implementado.
- **RNF-005, RNF-007 e RNF-017:** metas de disponibilidade, falhas e desempenho não foram declaradas atingidas sem medição.
- **RNF-009 e RNF-018:** certificação documental e governança da IA permanecem planejamento, sem declaração de certificação.

## Mudanças correspondentes no PDF de arquitetura

1. Plataforma compartilhada centrada no médico substitui SaaS multitenant por schema.
2. Apresentação web, API e PostgreSQL são as camadas executadas; IA e tarefas assíncronas não aparecem como serviços ativos.
3. Diagrama mostra portal do médico, portal do paciente, API e persistência com controle de acesso.
4. Stack e estrutura de pastas conferidas com os arquivos locais.
5. Rotas de agenda, prescrição e processamento Celery descritas anteriormente foram substituídas pelas rotas reais.
6. Explicadas autoria própria, autorização temporal, decisão do paciente, contexto clínico e compatibilidade com ingestão anterior.
7. Incluídas evidências de testes e limites técnicos; retiradas garantias de certificação e segurança não demonstradas.

## O que esta atualização não alterou

Não houve alteração no código de negócio, banco, senhas, chaves ou permissões durante a edição documental. Não foi executada seed nem enviado código ao GitHub. Os 31 testes e o fluxo manual citados pertencem à validação técnica já realizada no incremento de atendimentos; não são uma nova rodada executada para editar os PDFs.

Antes da entrega, a equipe deve revisar a redação acadêmica e as prioridades do backlog. As métricas de produção, nova pesquisa com usuários e validação normativa não foram inventadas para preencher o molde.

# Validação manual do portal MarIA

Data: 15/10/2026. Ambiente local: Django em `127.0.0.1:8000`, PostgreSQL do projeto, navegador integrado. Execução pela interface, usando somente as contas e o paciente fictícios existentes. Senhas, chaves e registros clínicos não foram substituídos.

## Roteiro executado

| Etapa | Resultado observado |
| --- | --- |
| Entrar como `paciente_demo` | Perfil carregado e identificador MarIA exibido |
| Entrar como `medico_b` e solicitar acesso | Solicitação enviada pela janela, com finalidade e prazo futuro |
| Consultar antes do aceite | Carteira mostra o paciente; conteúdo clínico bloqueado |
| Entrar como paciente e ler o termo | Destinatário Medico B, finalidade, prazo, escopo e revogação exibidos |
| Autorizar pelo paciente | Decisão registrada e persistida |
| Voltar ao `medico_b` e consultar | Histórico exibido com um registro da Clínica Demo A, autoria Medico A e texto fictício original |
| Revogar pelo paciente | Autorização passou para Revogada |
| Consultar novamente pelo médico | Conteúdo bloqueado; carteira preservada sem acesso pessoal ativo |

Solicitação criada para esta execução: `94b3736b-8c3a-4149-9e12-e2cd1f1dec8a`.
Finalidade: “Validação manual do fluxo profissional em 15/10/2026 — dados fictícios”.
Prazo solicitado: 16/10/2026 às 18h, America/Sao_Paulo.
Estado final: **revogada**. A solicitação e a auditoria ficam disponíveis como evidência, sem permissão pessoal ativa criada por este teste.

## Auditoria conferida no PostgreSQL

Sequência encontrada para esta execução:

1. `doctor_grant_requested`: permitido.
2. `doctor_history`: negado, nenhum registro retornado.
3. `grant_approve`: permitido.
4. `doctor_history`: permitido, um registro retornado.
5. `grant_revoke`: permitido.
6. `doctor_history`: negado, nenhum registro retornado.

## Ajustes durante a validação

A primeira interface integrada havia simplificado excessivamente o frontend original. A tela foi readequada usando `pacientes.css` como base: menu lateral com ícones e expansão, pesquisa, tabela de pacientes, botões arredondados e ficha de histórico. A solicitação foi movida para um diálogo. Estados e contadores são calculados a partir da API; o histórico permanece condicionado à verificação do servidor.

O servidor foi reiniciado para carregar os templates atualizados: estava em execução sem recarga automática. Os arquivos das telas originais, como `pacientes.html`, não foram substituídos.

## Limites da evidência

Esta execução valida o fluxo manual acima. Não simula a passagem real do prazo de expiração nem todas as telas antigas. Expiração, isolamento entre médicos e ausência de vínculo clínico têm cobertura nos testes automatizados já executados na entrega anterior. O portal ainda é a primeira parte da adaptação do frontend completo.

Capturas locais em `tmp/validacao-01-pendente.png`, `tmp/validacao-02-termo.png`, `tmp/validacao-03-historico.png` e `tmp/validacao-04-revogada.png`; essa pasta permanece ignorada pelo Git.

"""Incremento documental 1.2; executado pelo gerador no mesmo contexto visual."""

replacements = {
    '31 testes': '45 testes',
    'Login real emite JWT; API verifica identidade e perfil. Não há roteamento por schema. Revisão das chaves de desenvolvimento permanece pendente.': 'JWT autentica as APIs. Médico e paciente editam dados próprios; CRM é declarado, sem validação no conselho. Papéis e habilitação não são editáveis. Revisão das chaves permanece pendente.',
    'Paciente: identificador, leitura do termo, aceite, recusa e revogação.': 'Paciente: histórico pessoal, documentos, perfil, identificador e decisão das autorizações.',
    'Médico: login, carteira, solicitações, histórico compartilhado, registros próprios e cadastro de atendimento.': 'Médico: carteira, perfil, autorizações, histórico, atendimentos e visualizador de documentos.',
    '0001 a 0004': '0001 a 0006',
    'Andamento em 15/10/2026': 'Andamento em 17/10/2026',
    'evidência disponível em 15/10/2026': 'evidência disponível em 17/10/2026',
    'patient_id, purpose e expires_at': 'patient_id, purpose e duration_days (10, 30, 60 ou 90)',
    'validade futura. Solicitação': 'prazo de 10, 30, 60 ou 90 dias a partir do envio. Solicitação',
    'sem coleta de CPF, telefone e endereço': 'sem coleta de CPF e endereço',
    'não há cadastro público nem coleta de CPF, telefone e endereço no fluxo atual.': 'há edição de perfil e telefone; cadastro público, CPF e endereço permanecem ausentes.',
    'Não há atualização automática, aplicativo dedicado': 'O visualizador revalida acesso a cada 30 segundos; listas usam atualização manual. Não há aplicativo dedicado',
    'Recursos de agenda, finanças, documentos e IA continuam planejados.': 'Agenda, finanças, emissão certificada e IA continuam planejadas. Anexos privados e perfis estão integrados.',
    'JSON e Authorization: Bearer': 'JSON ou multipart/form-data e Authorization: Bearer',
    'HTTP/JSON para /api/v1/': 'HTTP com JSON, multipart e páginas PNG para /api/v1/',
    'contas fictícias; não há cadastro público nem coleta de CPF, telefone e endereço no fluxo atual.': 'contas fictícias; perfil editável, sem cadastro público, CPF ou endereço.',
    'Upload pelo médico ou paciente será definido em incremento posterior.': 'PDF/JPG/PNG privado, um arquivo por registro, até 10 MB. Paciente e médico enviam; médico visualiza páginas PNG no HUB e recebe 403 no download original.',
    'Não há geração e impressão de artefatos clínicos na API atual.': 'Somente o paciente baixa seus arquivos originais. Médico não baixa nem imprime pelo HUB. Capturas e cópia das imagens exibidas não podem ser impedidas de forma absoluta.',
    'Cadastro público e campos adicionais ainda não implementados.': 'Perfil permite editar dados pessoais e telefone; cadastro público permanece ausente.',
    'Regras atuais, contrato HTTP, migrações e roteiro de validação.': 'Regras atuais, anexos, perfis, contrato HTTP, migrações e validação.',
}

paragraph_updates = {
    'Ainda não há atualização automática entre abas, edição de atendimentos, upload': 'As listas usam atualização manual; o visualizador revalida acesso periodicamente. Upload de exames e edição dos próprios perfis estão integrados. Correção de atendimentos, aplicativo dedicado e scanner completo permanecem pendentes.',
    'Agenda unificada, anexos de exames, triagem, notificações': 'Agenda, triagem, notificações, assinatura certificada, aplicativo dedicado e IA permanecem no planejamento. Anexos privados e perfis já estão integrados ao portal web.',
    'Aplicação móvel, upload de exames pelo paciente, IA assistiva': 'Upload de exames, histórico pessoal e edição de perfis estão integrados ao portal. Aplicação móvel dedicada, scanner com recorte/OCR, IA, telemedicina, assinatura certificada e notificações permanecem no planejamento. A captura pela câmera é oferecida quando suportada pelo navegador móvel, sem validação física em celular concluída.',
    'Os principais limites atuais são cadastro público ausente': 'Permanecem pendentes: cadastro público, correção/exclusão de registros, scanner completo, aplicativo dedicado, serviços comerciais, implantação e revisão de segurança de produção. Carteira e histórico usam limite de 100 itens, sem paginação completa. O original dos documentos é bloqueado para médicos, mas a visualização não impede prints ou cópias das páginas exibidas.',
    'Validação em 15/10/2026:': 'Validação consolidada em 17/10/2026: 45 testes passaram no PostgreSQL. Migrações 0001 a 0006 aplicadas. Fluxos anteriores e visualizador foram conferidos no navegador; a inspeção visual dos novos perfis ficou bloqueada pela política da ferramenta. Revisão de chaves, correções de registros e implantação permanecem pendentes.',
    'Ações em outra aba exigem': 'As listagens em outra aba exigem atualização manual. O visualizador revalida acesso a cada 30 segundos e a cada página; limpa a imagem ao fechar ou receber negativa. Não há atualização em tempo real das carteiras, aplicativo dedicado ou integração das telas legadas. Listas limitadas a 100 itens.',
    'Os testes de autoria verificam': 'A suíte cobre autoria, isolamento, revogação e recorte temporal; inclui anexos privados, bloqueio do original para médicos, rasterização e documentos inválidos. Também verifica edição exclusiva da própria conta, sincronização do nome, validação de nascimento e tentativas de alterar papéis ou habilitação.',
    'A verificação de modelos/migrações não identificou': 'A verificação de modelos/migrações não identificou alterações pendentes. Os 45 testes passaram em 17/10/2026. A revisão visual dos perfis não foi concluída: a ferramenta bloqueou a inspeção da aba. A chave JWT local permanece pendente de revisão, sem mudança silenciosa.',
    'O paciente autentica-se no mesmo portal': 'O paciente acessa Autorizações, Meu histórico e Meu perfil. Consulta todos os seus registros, adiciona relatos e documentos com autoria identificada, decide pedidos e edita dados próprios. O médico usa telas separadas de Pacientes, Autorizações e Meu perfil. O acesso compartilhado continua sujeito ao consentimento.',
    'Na Fase 02, o portal web integra autenticação': 'Na Fase 02, o portal integra login, carteira, autorizações por prazo fixo, histórico, atendimentos, anexos privados e perfis. O paciente consulta o próprio histórico e contribui com relatos e exames. A clínica permanece como contexto organizacional e origem de registros recebidos por integração.',
    'O protótipo possui integração real': 'O frontend reaproveitado, a API Django REST Framework e o PostgreSQL operam integrados. O incremento inclui consentimento pessoal, histórico compartilhado, registros próprios, anexos privados, histórico do paciente e edição dos perfis. As funções futuras continuam distinguidas do que está implementado.',
    'As migrações 0001 a 0004 foram': 'As migrações 0001 a 0006 foram aplicadas sem recriar os dados. A seed não foi reexecutada. A estrutura inclui perfis profissionais, atendimentos diretos, anexos e contato pessoal. A suíte consolidada possui 45 testes aprovados; testes visuais e em dispositivo móvel têm limites registrados.',
}


def revised_text(value):
    for prefix, replacement in paragraph_updates.items():
        if value.startswith(prefix):
            return replacement
    for old, new in replacements.items():
        value = value.replace(old, new)
    return value


def revise_pages(pages):
    for page in pages:
        for index, item in enumerate(page):
            if isinstance(item, Paragraph):
                page[index] = Paragraph(revised_text(item.text), item.style)
            elif isinstance(item, Table):
                for row in item._cellvalues:
                    for column, cell in enumerate(row):
                        if isinstance(cell, Paragraph):
                            row[column] = Paragraph(revised_text(cell.text), cell.style)


revise_pages(P)
revise_pages(ARCH)

# Histórico anterior mantido; uma nova versão formaliza os incrementos posteriores.
versions.append(('1.2', '6º', '02', '17/10/2026', 'Prazos fixos, navegação separada, histórico pessoal, anexos privados, visualizador médico sem original e perfis editáveis. 45 testes aprovados.'))
P[3] = [h('PARTE 00 - HISTÓRICO DE VERSÃO DO PROJETO'), table(['Versão','Período','Fase','Data','Descrição'], versions, [43,44,34,69,320]), p('Versão 1.1 preservada como marco anterior. A versão 1.2 consolida os incrementos de 15 a 17/10/2026.', 'small')]

# Status dos requisitos existentes, preservando os códigos e prioridades.
for page in P:
    for item in page:
        if isinstance(item, Table) and len(item._cellvalues) > 1:
            row = item._cellvalues[1]
            code = getattr(row[0], 'text', '')
            if code == 'RF-016': row[2] = p('Integrado', 'cell')
            if code == 'RF-018': row[2] = p('Parcial / restrito', 'cell')

# Detalhamento acrescido em continuação da seção 22, com referência explícita.
# Apêndices mantêm a paginação original das seções 1 a 27.
P.append([
    h('APÊNDICE A - COMPLEMENTO DAS SEÇÕES 20 A 23'),
    sub('22.1 Frontend: incremento de navegação e documentos'),
    p('Pacientes concentra carteira, status e atendimentos. Autorizações apresenta finalidade, datas, termo e nova solicitação. Prazos de 10, 30, 60 e 90 dias contam do envio; o aceite não reinicia o prazo e não concede acesso antes da decisão.'),
    p('Meu histórico permite ao paciente consultar registros de todas as origens e adicionar informações ou exames. Contribuições do paciente são identificadas e não se apresentam como avaliação médica. Médico habilitado anexa ao registrar atendimento com consentimento vigente.'),
    p('Um arquivo por registro: PDF, JPG ou PNG, até 10 MB. Câmera traseira é sugerida pelo input capture quando suportado. Não há scanner com recorte, correção de perspectiva ou OCR.'),
    sub('22.2 Backend: identidade, anexos e persistência'),
    p('Attachment vincula um documento privado a Record e armazena os bytes no PostgreSQL do protótipo. AccountProfile vincula telefone à conta; DoctorProfile inclui especialidade e CRM/UF. Patient mantém nome, nascimento e identidade central. Migrações 0005 e 0006 preservam os registros.'),
    p('O perfil altera somente nome, contato e dados próprios permitidos. Não modifica usuário, papéis, UUID, habilitação ou validação profissional. CRM e UF são declarados em conjunto, sem consulta ao conselho. Mudanças são transacionais e auditadas.'),
    sub('21 e 23: tecnologias e módulos complementares'),
    p('Pillow 12.3.0 e pypdfium2 5.14.0 geram páginas PNG no servidor. Os serviços profiles, attachments e document_preview e os módulos hub-profile e hub-document-viewer separam responsabilidades. Dependências estão fixadas no requirements.lock.txt.'),
])
P.append([
    h('APÊNDICE A (continuação) - CONTRATOS E SEGURANÇA'),
    sub('22.3 Comunicação e endpoints acrescentados'),
    table(['Contrato em /api/v1/', 'Entrada / comportamento'], [
        ('POST doctor/grants/', 'patient_id, purpose, duration_days: 10/30/60/90. Servidor calcula expires_at.'),
        ('GET / POST patient/records/', 'Titular consulta histórico e cria relato; JSON ou multipart com occurred_at, summary e attachment opcional.'),
        ('POST doctor/patients/{id}/records/', 'Multipart com anexo opcional; médico e autoria definidos pelo backend; Grant vigente obrigatório.'),
        ('GET attachments/{id}/preview/', 'Metadados para o visualizador, com conferência de acesso.'),
        ('GET attachments/{id}/pages/{n}/', 'PNG rasterizado e identificado. PDF original não é entregue ao médico.'),
        ('GET attachments/{id}/download/', 'Original permitido somente ao próprio paciente. Médico recebe 403, inclusive autor.'),
        ('GET / PATCH me/profile/', 'Dados da própria conta; campos não editáveis são recusados.'),
    ], [230,280]), Spacer(1,10),
    sub('25 Segurança: limites explícitos da visualização'),
    p('Cada página verifica perfil, autoria ou autorização e recorte temporal. Arquivos posteriores ao aceite não entram automaticamente no compartilhamento. O médico autor habilitado consulta os próprios registros, mas não baixa o original. A revogação não apaga dados nem elimina a regra de autoria.'),
    p('Visualizador sem botões de download/impressão; páginas recebem identificação do usuário/horário, Cache-Control no-store e nosniff. PDFs têm até 100 páginas; lado rasterizado máximo de 1800 pixels. A tela revalida acesso a cada 30 segundos e a cada página.'),
    p('Não existe garantia contra prints, fotografias, extração das imagens ou cópias já feitas. Marca de identificação não é DRM. A revalidação não torna a revogação instantânea. Assinatura inicial/extensão são verificadas; não há antivírus, certificação ou proteção de produção demonstrada.', 'small'),
])
P.append([
    h('APÊNDICE B - RASTREABILIDADE DOS NOVOS REQUISITOS'),
    *compact_requirements([
        ('RF-028','Consultar e contribuir com meu histórico','Integrado','MUST','Paciente consulta seus registros e adiciona informações com autoria identificada; não depende de autorização médica.'),
        ('RF-029','Editar o próprio perfil','Integrado','MUST','Nome, contato e nascimento do paciente; especialidade e CRM/UF do médico. Sem alteração de credenciais, papéis ou habilitação.'),
        ('RF-030','Visualizar documentos no HUB','Integrado','MUST','Páginas PNG autenticadas; médico não obtém o original na rota de download. Paciente pode baixar o próprio arquivo.'),
    ]),
    *compact_requirements([
        ('RNE-025','Anexos privados e titularidade','RF-016, RF-028, RF-030','','Um anexo por registro, até 10 MB. Envio médico exige autorização; relato do paciente usa a própria identidade. Originais somente para o titular.'),
        ('RNE-026','Prazos predefinidos','RF-024, RF-025','','10, 30, 60 ou 90 dias contados da solicitação. Pedido novo exige novo aceite e não altera termos anteriores.'),
        ('RNE-027','Edição restrita de perfil','RF-017, RF-029','','Somente dados da própria conta. Nome é sincronizado com Patient; CRM não é verificado nem concede permissões.'),
    ], True),
    p('RF-016 foi atualizado para integrado; RF-018 passou a parcial/restrito. RF-017 inclui os perfis editáveis; RF-024 utiliza duration_days. Os IDs antigos foram mantidos. As prioridades novas são propostas técnicas para revisão da equipe.', 'small'),
])

# Referências dos apêndices acrescentadas ao sumário sem deslocar seções anteriores.
P[2].append(p(f'APÊNDICES A E B - Incrementos, contratos e requisitos ........ {len(P)-2}', 'small'))

ARCH.append([
    h('20 A 22 - COMPLEMENTO DO INCREMENTO 1.2'),
    p('Versão consolidada em 17/10/2026. Pacientes e Autorizações usam visões separadas; Meu perfil existe para médico e paciente. Meu histórico oferece consulta integral ao titular e contribuição identificada.'),
    diagram('data'),
    p('AccountProfile (1:1 User) armazena telefone; DoctorProfile (1:1 User) inclui CRM/UF e especialidade. Attachment tem relação de 0..1 para cada Record. Conteúdo binário privado fica no mesmo PostgreSQL no protótipo. Não há endpoint público de mídia.'),
    p('Migrações 0005 e 0006 adicionam anexos e perfis. Atualização de perfil é transacional, auditada e restrita à conta autenticada; não altera habilitação, destinatários ou termos anteriores.'),
])
ARCH.append([
    h('22.2 E 22.3 - DOCUMENTOS, PERFIS E INTEGRAÇÃO'),
    table(['Endpoint / recurso', 'Regra implementada'], [
        ('POST doctor/grants/', 'duration_days: 10, 30, 60, 90; expires_at calculado no envio.'),
        ('GET/POST patient/records/', 'Titular consulta e contribui; autoria do paciente identificada.'),
        ('POST doctor/.../records/', 'Descrição e arquivo multipart; consentimento vigente.'),
        ('GET attachments/{id}/preview/', 'Metadados privados para o visualizador.'),
        ('GET attachments/{id}/pages/{n}/', 'PNG identificado, controle por página e sem arquivo original.'),
        ('GET attachments/{id}/download/', 'Somente titular. Médico, inclusive autor, recebe HTTP 403.'),
        ('GET/PATCH me/profile/', 'Contato, nome e dados específicos; sem alteração de papéis.'),
    ], [235,275]), Spacer(1,10),
    p('Pillow 12.3.0 e pypdfium2 5.14.0 rasterizam e recodificam os anexos. Um PDF/JPG/PNG por registro, até 10 MB; PDF de até 100 páginas, lado máximo de 1800 pixels. PDFium é serializado entre threads. Não há entrega do PDF original ao médico.'),
    p('Controle por titularidade, autoria médica habilitada ou Grant que inclua o registro. Cabeçalhos no-store/nosniff e auditoria por consulta. Revalidação no visualizador a cada 30 segundos e a cada página. Não impede captura de tela nem cópia da imagem recebida.'),
    p('45 testes aprovados no PostgreSQL em 17/10/2026. Visualizador conferido no navegador; perfis validados por testes, com inspeção visual bloqueada pela ferramenta. Scanner completo, validação física em celular e segurança de produção permanecem pendentes.'),
])

changes_out = OUT/'historico-alteracoes-maria-fase02.pdf'
changes_pages = [
    [h('MarIA - HISTÓRICO CONSOLIDADO DE ALTERAÇÕES'), p('Versão 1.2 | 17/10/2026 | 6º período - Fase 02'),
     sub('1. Mudanças anteriores: conceito e arquitetura'),
     p('O sistema de controle de clínica evoluiu para um HUB de continuidade centrado no médico. A interface manual deixou de ser apenas exemplo de clínica e tornou-se a base do produto. A clínica permanece como origem/contexto opcional do atendimento.'),
     p('O modelo de schemas exclusivos foi substituído por PostgreSQL e schema compartilhados. Patient centraliza identidade, DoctorProfile identifica o médico e Grant limita o acesso por profissional, finalidade, prazo e recorte do aceite. Carteira não equivale a permissão.'),
     p('Não é preciso atendimento prévio para solicitar acesso. O paciente decide sem nova aprovação da clínica ou profissional de origem. Registros futuros exigem novo aceite; revogação/expiração bloqueiam novos acessos compartilhados quando não há outro Grant válido.'),
     sub('2. Mudanças anteriores: integração e organização'),
     p('Frontend, Django/DRF e PostgreSQL passaram a funcionar integrados. JWT autentica; o backend decide permissões. Cadastro direto de atendimento dispensa chave de integração; essa chave continua restrita à ingestão clínica anterior.'),
     p('Autoria própria tem rota separada e persiste após término do consentimento, sem abrir registros de outros autores. Pastas frontend/backend/docs/tools foram organizadas; serviços, consultas e validações têm responsabilidades distintas.'),
     p('Especificação e arquitetura preservam identidade institucional, partes, seções e códigos antigos, diferenciando implementado, parcial e planejado. A versão 1.1 de 15/10/2026 fica preservada no histórico.'),
    ],
    [h('3. NOVAS ALTERAÇÕES: NAVEGAÇÃO E DOCUMENTOS'),
     bullet('Solicitação usa prazos de 10, 30, 60 ou 90 dias, calculados pelo servidor a partir do envio. Nova solicitação exige novo aceite.'),
     bullet('Pacientes concentra carteira, status, histórico e atendimentos. Autorizações detalha pedidos, finalidade, datas e termos.'),
     bullet('Meu histórico permite ao paciente consultar registros próprios e contribuir com descrições e exames; autoria é identificada como informação do paciente.'),
     bullet('Médico pode anexar arquivo ao registrar atendimento autorizado. PDF/JPG/PNG de até 10 MB, um documento por registro. Conteúdo privado armazenado atomicamente no PostgreSQL.'),
     bullet('Captura por câmera móvel quando suportada; scanner com recorte/OCR e validação física no celular ainda pendentes.'),
     sub('4. Correção da política de documentos'),
     p('A primeira implementação oferecia download a quem pudesse consultar o documento. Essa política foi substituída: somente o paciente titular baixa o original. Médico recebe 403 nessa rota, mesmo quando autor.'),
     p('O médico usa visualizador no HUB, com páginas PNG geradas no servidor e identificação do usuário/horário. Não recebe o PDF original nem botões de download/impressão. Acesso é conferido por página e a cada 30 segundos.'),
     p('A restrição não elimina prints, fotografia, cópia das imagens recebidas ou capturas anteriores à revogação. Não foi declarada garantia absoluta contra reprodução ou certificação de segurança.'),
    ],
    [h('5. NOVAS ALTERAÇÕES: PERFIS E ENTREGA'),
     p('Meu perfil permite ao paciente editar nome, e-mail, telefone e nascimento e consultar o identificador MarIA. Para o médico, inclui nome, contato, especialidade e CRM/UF. O nome do paciente é sincronizado com a conta.'),
     p('CRM é declarado e não verificado. O formulário não altera usuário de login, identificadores, papéis ou habilitação profissional. Dados são validados, atualizados em transação e auditados, sem copiar contatos para o evento.'),
     sub('6. Onde a documentação foi atualizada'),
     p('Parte 00: versão 1.2. Parte 02: situação e validação. Seções 13 a 15: status e rastreabilidade. Seções 16 a 18: navegação e DER. Seções 20 a 23: componentes, stack, contratos e módulos. Seções 24 a 27: evidências, segurança, pendências e avaliação. Apêndices A/B complementam os detalhes sem renumerar as seções antigas.'),
     p('Requisitos existentes: RF-016 anexos integrado; RF-018 download restrito; RF-017 perfis; RF-024 prazos. Acrescidos RF-028 a RF-030 e RNE-025 a RNE-027. Diagramas incluem AccountProfile e Attachment.'),
     sub('7. Evidências e limites'),
     p('45 testes aprovados em 17/10/2026; migrações até 0006 aplicadas preservando os dados. Visualizador conferido no navegador; inspeção visual dos perfis bloqueada pela política da ferramenta. Não houve seed, alteração de chaves/senhas ou envio ao GitHub nesta revisão documental.'),
     p('Permanecem pendentes: revisão JWT/segredos, higiene e envio do repositório, cadastro público, correção/exclusão de registros, política de retenção, produção, aplicativo dedicado, scanner completo, verificação de CRM, assinatura certificada e IA. Nenhuma dessas funções foi apresentada como concluída.'),
    ],
]
build(changes_out, changes_pages, False)

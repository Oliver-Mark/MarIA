# Organização e padrões da base MarIA

## Responsabilidades
O projeto mantém uma aplicação Django `hub` com módulos por responsabilidade. Não é necessário criar uma aplicação para cada tabela neste tamanho de projeto.

```text
backend/
  config/                 # Configurações, URLs e WSGI
  hub/
    models.py             # Entidades, escolhas, restrições e validação
    serializers.py        # Entrada/saída HTTP
    views.py              # Entrada validada e resposta
    permissions.py        # Integração, vínculo e contexto
    selectors.py          # Consultas reutilizáveis
    constants.py          # Decisões, termo e limite
    exceptions.py         # Conflito HTTP 409
    services/
      records.py          # Ingestão, idempotência e histórico
      grants.py           # Solicitação, decisão e revogação
    tests/
      test_flows.py       # Jornada e massa compartilhada
      test_integrity.py   # Restrições e casos negativos
    static/hub/           # CSS e JavaScript da demonstração
    migrations/           # Evolução versionada do banco
    management/commands/ # Provisionamento da demonstração
  templates/              # Estrutura visual
```

## Regras de manutenção
- Views delegam decisões e persistência a serviços com argumentos explícitos, sem depender do objeto HTTP request.
- Seletores não concedem acesso; serviços verificam vínculo e contexto antes de consultar dados.
- Papéis, estados e escopos usam TextChoices; strings públicas da API continuam compatíveis.
- Listagens têm ordenação explícita; paginação permanece pendente.
- Operações com autorização usam transações e bloqueio das linhas. Negação de histórico e conflitos preservam auditoria mesmo com resposta de erro.
- Alterações de modelo exigem migration e teste; não modificar tabelas manualmente no visualizador.
- `Record.clean()` e `Grant.clean()` verificam relações. Django não chama `full_clean()` automaticamente ao salvar; APIs usam verificações nos serviços. Scripts administrativos devem chamar `full_clean()` antes de gravar e preferir os serviços. Estado, datas, unicidade e escopo têm restrições no banco.
- Auditoria bloqueia update/delete pelos caminhos normais do ORM. SQL direto e superusuário ainda podem alterar dados; permissões de banco e retenção precisam ser definidas antes de produção.
- A API não sobrescreve atendimentos; correções versionadas são uma evolução futura.

## Formatação e verificação

Ferramentas opcionais:

```powershell
.\.venv\Scripts\python.exe -m pip install -r backend/requirements-dev.txt
.\.venv\Scripts\python.exe -m black --workers 1 backend
npm exec --yes --package=prettier@3.6.2 -- prettier --write backend/hub/static/hub/demo.js backend/hub/static/hub/demo.css backend/templates/hub-demo.html
```

Verificações no PostgreSQL:

```powershell
.\.venv\Scripts\python.exe backend/manage.py check
.\.venv\Scripts\python.exe backend/manage.py makemigrations --check --dry-run
.\.venv\Scripts\python.exe backend/manage.py test hub
```

Os 19 testes usam hasher rápido exclusivamente na massa de testes, sem mudar o hasher da aplicação. Testam autenticação JWT, mas não geração/rotação de chaves de produção. A chave atual mantém aviso de comprimento, pois essa tarefa foi adiada pelo usuário.

## Antes de enviar ao GitHub
Não houve commit/push ou alteração de credenciais nesta rodada. A remoção de `node_modules` rastreado foi adiada junto da preparação do Git. `.gitignore` protege arquivos novos, mas não retira arquivos já rastreados.

Antes da publicação: configurar chave aleatória adequada e retirar fallback fixo, substituir senha placeholder sincronizando PostgreSQL e `.env`, revisar o commit e retirar dependências instaladas do índice. Não incluir `.env`, dumps, bancos, chaves de integração ou logs com credenciais. `.dockerignore` reduz o envio desses arquivos ao contexto de build.

## Organização da raiz

O frontend legado fica em `frontend/`, com suas telas HTML e pastas `css/`, `Js/` e `img/`. Os nomes e caminhos relativos foram preservados para manter navegação e assets funcionando. A demonstração integrada continua em `backend/templates/` e `backend/hub/static/`.

`docs/referencias/` guarda material de referência; `output/` guarda documentos gerados; `tools/` guarda scripts de apoio. Configurações de execução e dependências permanecem na raiz para manter os comandos atuais. `node_modules/`, `.venv/` e `tmp/` são diretórios locais de dependências ou trabalho.

No Live Server aberto na raiz, use `/frontend/login.html` e configure o Cypress com base URL terminada em `/frontend`. Docker publica o conteúdo de `frontend/` na raiz da porta 8080. A configuração Vercel aponta a saída estática para `frontend/`; a publicação não foi executada.

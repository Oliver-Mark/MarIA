# Iniciar e validar o MarIA HUB

## Portal por profissional — 15/10/2026

A nova entrada é `http://127.0.0.1:8000/hub/login/`. Aplique as migrations antes de abrir. Médicos existentes com vínculo ativo recebem perfil profissional pela migration 0003; dados, credenciais e autorizações antigas são preservados. Não reexecute `seed_demo` apenas para atualizar o modelo. Veja o [roteiro atual](evolucao-profissional.md). A tela `/demo/` continua disponível para ingestão técnica de registros. O estado abaixo registra a entrega anterior.

## Estado anterior
Backend reorganizado com 19 testes aprovados no PostgreSQL. A segunda migration adiciona restrições e índices e foi aplicada preservando os registros locais. As telas clínicas originais ainda usam localStorage. O cliente integrado está em `/demo/`; CSS e JavaScript ficam em `backend/hub/static/hub/`. A jornada original foi verificada pelo usuário; recarregar a página para carregar os estáticos novos e repetir o roteiro após a refatoração.

## Preparação (PowerShell, raiz do repositório)

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.lock.txt
Copy-Item .env.example .env
```

O ambiente virtual já foi criado nesta entrega. Edite `.env`: escolha senha local do PostgreSQL e chave aleatória Django. O arquivo é ignorado pelo Git.

Inicie Docker Desktop, então:

```powershell
docker compose up -d db
docker compose exec db pg_isready -U maria_dev -d maria
.\.venv\Scripts\python.exe backend/manage.py migrate
.\.venv\Scripts\python.exe backend/manage.py test hub
$env:MARIA_DEMO_PASSWORD='EscolhaUmaSenhaLocal123!'
.\.venv\Scripts\python.exe backend/manage.py seed_demo
.\.venv\Scripts\python.exe backend/manage.py runserver 127.0.0.1:8000
```

Abra http://127.0.0.1:8000/demo/. O seed imprime chaves das integrações A/B; guarde-as localmente, sem publicar. Reexecutar o seed troca chaves e senhas demo. Usuários: `medico_a`, `medico_b`, `paciente_demo`, `recepcao_b`. Todos usam a senha escolhida. O paciente é previamente vinculado às clínicas; cadastro e identificação real não estão implementados.

O serviço PostgreSQL usa nomes padrão `.env.example`. O usuário criado pela imagem é de desenvolvimento e possui privilégios elevados; não reutilizar essa credencial em produção. O servidor Django de desenvolvimento não deve ser publicado.

## Roteiro de demonstração
1. Login como medico_a; carregar pacientes; enviar atendimento passado usando chave A.
2. Reenvio idêntico retorna 200 sem duplicar; alterar conteúdo do mesmo ID retorna 409.
3. Login como medico_b; consultar paciente: 403 sem histórico próprio ou autorização.
4. Solicitar acesso por finalidade e validade futura; continua pendente.
5. Login como paciente_demo; atualizar pedidos; ler e autorizar o termo para B.
6. Login como medico_b; consultar o histórico com procedência de A.
7. Paciente revoga; B deixa de receber registros externos sustentados por essa autorização.
8. recepcao_b é bloqueada ao tentar consulta assistencial.

Outra autorização válida pode sustentar acesso; evite aprovar vários pedidos ao demonstrar uma revogação. Novos registros recebidos após o aceite não estão no escopo inicial. Tokens ficam em memória e vencem em 15 minutos; login novamente ou renovação pela API. Logout da página não invalida JWT já emitido antes da expiração.

## Alternativa explícita de testes sem PostgreSQL

```powershell
$env:MARIA_TEST_SQLITE='1'
.\.venv\Scripts\python.exe backend/manage.py check
.\.venv\Scripts\python.exe backend/manage.py test hub
.\.venv\Scripts\python.exe backend/manage.py makemigrations --check --dry-run
```

Para voltar ao PostgreSQL, remova a variável antes dos comandos:

```powershell
Remove-Item Env:MARIA_TEST_SQLITE -ErrorAction SilentlyContinue
```

SQLite não comprova locks/concorrência PostgreSQL. A API usa transações e lock das autorizações na consulta/revogação; repetir validação no banco alvo.

## Arquivos principais e próximas tarefas
- `docs/arquitetura-maria.md`: fonte da arquitetura e contrato.
- `output/pdf/arquitetura-maria-fase02.pdf`: versão para compartilhar.
- `backend/hub/models.py`: entidades; `views.py` e `serializers.py`: API.
- `backend/hub/tests/`: fluxo, permissões e integridade.
- `backend/hub/services/`: regras de ingestão, consulta e autorizações.
- `backend/hub/selectors.py`: consultas ao banco.
- `backend/hub/permissions.py`: integração e vínculos.
- `backend/templates/hub-demo.html`: cliente integrado.

Próximas tarefas: revisar chaves e senhas antes da publicação; adaptar frontend original; implementar cadastro/identificação verificada; paginação e correções versionadas; OpenAPI; adaptador externo. Chaves e senhas foram mantidas por solicitação do usuário nesta refatoração. Credencial de integração deve ficar no adaptador servidor em produção, não no navegador.

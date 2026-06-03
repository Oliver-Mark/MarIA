let temAlteracoes = false;
let fotoTempBase64 = null;

const toggleTema = document.getElementById('toggle-tema');
const rangeFonte = document.getElementById('range-fonte');
const rangeLinha = document.getElementById('range-linha');
const imgPreview = document.getElementById('foto-perfil-preview');

// Carrega o estado atual salvo e reverte as visualizações no DOM
function carregarConfiguracoes() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const userKey = usuarioLogado ? '_' + usuarioLogado.email : '';
    const config = JSON.parse(localStorage.getItem('maria_config' + userKey)) || JSON.parse(localStorage.getItem('maria_config')) || {};
    
    // Reverte o Tema
    if (toggleTema) toggleTema.checked = !!config.temaEscuro;
    if (config.temaEscuro) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    // Reverte a Fonte
    const fonteValor = config.fonte || 100;
    if (rangeFonte) rangeFonte.value = fonteValor;
    const valFonteEl = document.getElementById('valor-fonte');
    if (valFonteEl) valFonteEl.innerText = fonteValor + '%';
    document.documentElement.style.setProperty('--tamanho-fonte-base', (fonteValor / 100) + 'em');
    
    // Reverte o Espaçamento de Linha
    const linhaValor = config.linha || 1.5;
    if (rangeLinha) rangeLinha.value = linhaValor;
    const valLinhaEl = document.getElementById('valor-linha');
    if (valLinhaEl) valLinhaEl.innerText = linhaValor;
    document.documentElement.style.setProperty('--altura-linha-base', linhaValor);

    // DADOS DO USUÁRIO LOGADO
    const nomeCompleto = document.getElementById('input-nome-completo');
    const nomeExibicao = document.getElementById('input-nome-exibicao');
    const genero = document.getElementById('input-genero');
    const emailInst = document.getElementById('input-email-institucional');
    const emailRecup = document.getElementById('input-email-recuperacao');
    const cpf = document.getElementById('input-cpf');
    const crm = document.getElementById('input-crm');
    const rqe = document.getElementById('input-rqe');
    const especialidade = document.getElementById('input-especialidade');
    const dataNasc = document.getElementById('input-data-nasc');
    const rg = document.getElementById('input-rg');
    const cargo = document.getElementById('input-cargo');
    const pis = document.getElementById('input-pis');
    const cnpj = document.getElementById('input-cnpj');
    const cep = document.getElementById('input-cep');
    const logradouro = document.getElementById('input-logradouro');
    const numero = document.getElementById('input-numero');
    const complemento = document.getElementById('input-complemento');
    const bairro = document.getElementById('input-bairro');
    const cidade = document.getElementById('input-cidade');
    const estado = document.getElementById('input-estado');

    let fotoPadrao = "https://ui-avatars.com/api/?name=Usuario&background=5DAEE0&color=fff&size=100";

    if (usuarioLogado) {
        if (usuarioLogado.perfil === 'admin') {
            document.querySelectorAll('.campo-medico, .campo-funcionario, .campo-comum').forEach(el => el.style.display = 'none');
            const linhaDocs = document.getElementById('linha-pessoais-1');
            if (linhaDocs) linhaDocs.style.gridTemplateColumns = '1fr 1fr';

            fotoPadrao = "https://ui-avatars.com/api/?name=Marcos+Andrade&background=2D3748&color=fff&size=100";
            if (nomeCompleto) nomeCompleto.value = 'Marcos de Andrade';
            if (nomeExibicao) nomeExibicao.value = 'Administrador';
            if (emailInst) emailInst.value = 'admin@maria.com';
            if (emailRecup) emailRecup.value = 'admin@maria.com';
            if (cpf) cpf.value = '296.550.631-43';
            if (genero) genero.value = 'Masculino';
        }
        else if (usuarioLogado.perfil === 'medico') {
            document.querySelectorAll('.campo-funcionario').forEach(el => el.style.display = 'none');
            
            const medicos = JSON.parse(localStorage.getItem('medicos_maria')) || [];
            const medico = medicos.find(m => m.email === usuarioLogado.email);
            if (medico) {
                fotoPadrao = medico.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(medico.nome)}&background=5DAEE0&color=fff&size=100`;
                if (nomeCompleto) nomeCompleto.value = medico.nome;
                if (nomeExibicao) {
                    let partes = medico.nome.trim().split(' ');
                    let titulo = medico.sexo === 'Feminino' ? 'Dra.' : 'Dr.';
                    nomeExibicao.value = `${titulo} ${partes[0]}`;
                }
                if (emailInst) emailInst.value = medico.email;
                if (emailRecup) emailRecup.value = medico.email;
                if (cpf) cpf.value = medico.cpf || '';
                if (crm) crm.value = `${medico.crm || ''}-${medico.ufCrm || ''}`;
                if (rqe) rqe.value = medico.rqe || 'Não informado';
                if (especialidade) especialidade.value = medico.especialidade || '';
                if (genero) genero.value = medico.sexo || 'Prefiro não informar';
                if (dataNasc) dataNasc.value = medico.dataNasc || '';
                if (rg) rg.value = medico.rg || '';
                if (cnpj) cnpj.value = medico.cnpj || '';
                if (cep) cep.value = medico.cep || '';
                if (logradouro) logradouro.value = medico.logradouro || '';
                if (numero) numero.value = medico.numero || '';
                if (complemento) complemento.value = medico.complemento || '';
                if (bairro) bairro.value = medico.bairro || '';
                if (cidade) cidade.value = medico.cidade || '';
                if (estado) estado.value = medico.estado || '';
            }
        }
        else if (usuarioLogado.perfil === 'recepcao') {
            document.querySelectorAll('.campo-medico').forEach(el => el.style.display = 'none');

            const funcionarios = JSON.parse(localStorage.getItem('funcionarios_maria')) || [];
            const funcionario = funcionarios.find(f => f.email === usuarioLogado.email);
            if (funcionario) {
                fotoPadrao = funcionario.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(funcionario.nome)}&background=5DAEE0&color=fff&size=100`;
                if (nomeCompleto) nomeCompleto.value = funcionario.nome;
                if (nomeExibicao) nomeExibicao.value = funcionario.nome.split(' ')[0];
                if (emailInst) emailInst.value = funcionario.email;
                if (emailRecup) emailRecup.value = funcionario.email;
                if (cpf) cpf.value = funcionario.cpf || '';
                if (genero) genero.value = funcionario.sexo || 'Prefiro não informar';
                if (dataNasc) dataNasc.value = funcionario.dataNasc || '';
                if (rg) rg.value = funcionario.rg || '';
                if (cargo) cargo.value = funcionario.cargo || '';
                if (pis) pis.value = funcionario.pis || '';
                if (cep) cep.value = funcionario.cep || '';
                if (logradouro) logradouro.value = funcionario.logradouro || '';
                if (numero) numero.value = funcionario.numero || '';
                if (complemento) complemento.value = funcionario.complemento || '';
                if (bairro) bairro.value = funcionario.bairro || '';
                if (cidade) cidade.value = funcionario.cidade || '';
                if (estado) estado.value = funcionario.estado || '';
            }
        }
    }

    // Sobrepõe com alterações que o usuário tenha salvo manualmente
    const configPersonal = JSON.parse(localStorage.getItem('maria_config' + userKey)) || {};
    if (nomeCompleto && configPersonal.nomeCompleto) nomeCompleto.value = configPersonal.nomeCompleto;
    if (nomeExibicao && configPersonal.nomeExibicao) nomeExibicao.value = configPersonal.nomeExibicao;
    if (genero && configPersonal.genero) genero.value = configPersonal.genero;
    if (emailRecup && configPersonal.emailRecup) emailRecup.value = configPersonal.emailRecup;

    // Reverte a Foto
    if (imgPreview) {
        if (configPersonal.foto) {
            imgPreview.src = configPersonal.foto;
        } else {
            imgPreview.src = fotoPadrao;
        }
    }

    fotoTempBase64 = null;
    temAlteracoes = false;

    // Reverte o modo de edição das Informações Pessoais
    const inputsEditaveis = [document.getElementById('input-nome-completo'), document.getElementById('input-nome-exibicao'), document.getElementById('input-email-recuperacao')];
    inputsEditaveis.forEach(input => {
        if(input) input.setAttribute('readonly', true);
    });
    const inputGenero = document.getElementById('input-genero');
    if (inputGenero) inputGenero.setAttribute('disabled', true);
    const btnEditar = document.getElementById('btn-editar-pessoais');
    if (btnEditar) btnEditar.disabled = false;
}

// Lógica para mudança de Abas com alerta de perda de dados
window.abrirAba = function(abaId, elemento) {
    if (temAlteracoes) {
        const confirma = confirm('Você tem alterações não salvas nesta aba. Deseja descartá-las e sair?');
        if (!confirma) return;
        carregarConfiguracoes(); // Reverte para o que estava salvo
    }
    
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('ativo'));
    document.querySelectorAll('.config-menu li').forEach(l => l.classList.remove('active'));
    
    document.getElementById(abaId).classList.add('ativo');
    elemento.classList.add('active');
}

// Detecção de mudança nos inputs
document.querySelectorAll('.panel input, .panel select').forEach(input => {
    input.addEventListener('change', () => temAlteracoes = true);
    input.addEventListener('input', () => temAlteracoes = true);
});

// Live previews (Mostra a mudança em tempo real sem precisar salvar)
if (toggleTema) {
    toggleTema.addEventListener('change', (e) => {
        e.target.checked ? document.body.classList.add('dark-theme') : document.body.classList.remove('dark-theme');
    });
}
if (rangeFonte) {
    rangeFonte.addEventListener('input', (e) => {
        const valFonteEl = document.getElementById('valor-fonte');
        if (valFonteEl) valFonteEl.innerText = e.target.value + '%';
        document.documentElement.style.setProperty('--tamanho-fonte-base', (e.target.value / 100) + 'em');
    });
}
if (rangeLinha) {
    rangeLinha.addEventListener('input', (e) => {
        const valLinhaEl = document.getElementById('valor-linha');
        if (valLinhaEl) valLinhaEl.innerText = e.target.value;
        document.documentElement.style.setProperty('--altura-linha-base', e.target.value);
    });
}

// Alterar Foto
const btnAlterarFoto = document.getElementById('btn-alterar-foto');
if (btnAlterarFoto) {
    btnAlterarFoto.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file'; fileInput.accept = 'image/*';
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    fotoTempBase64 = event.target.result;
                    if (imgPreview) imgPreview.src = fotoTempBase64;
                    temAlteracoes = true;
                };
                reader.readAsDataURL(file);
            }
        };
        fileInput.click();
    });
}

// Remover Foto
const btnExcluirFoto = document.getElementById('btn-excluir-foto');
if (btnExcluirFoto) {
    btnExcluirFoto.addEventListener('click', () => {
        fotoTempBase64 = ""; // String vazia sinaliza a exclusão
        if (imgPreview) imgPreview.src = "https://ui-avatars.com/api/?name=Sandra+Helena&background=5DAEE0&color=fff&size=100";
        temAlteracoes = true;
    });
}

// Botão Editar Informações Pessoais
const btnEditarPessoais = document.getElementById('btn-editar-pessoais');
if (btnEditarPessoais) {
    btnEditarPessoais.addEventListener('click', () => {
        [document.getElementById('input-nome-completo'), document.getElementById('input-nome-exibicao'), document.getElementById('input-email-recuperacao')].forEach(input => input.removeAttribute('readonly'));
        const inputGenero = document.getElementById('input-genero');
        if (inputGenero) inputGenero.removeAttribute('disabled');
        document.getElementById('input-nome-completo').focus();
        btnEditarPessoais.disabled = true;
    });
}

// Salvar Alterações
document.querySelectorAll('.btn-salvar').forEach(btn => {
    if (btn.id === 'btn-editar-pessoais') return; // Evita que o botão Editar chame a função de salvar
    btn.addEventListener('click', () => {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        const userKey = usuarioLogado ? '_' + usuarioLogado.email : '';
        const config = JSON.parse(localStorage.getItem('maria_config' + userKey)) || JSON.parse(localStorage.getItem('maria_config')) || {};
        if (toggleTema) config.temaEscuro = toggleTema.checked;
        if (rangeFonte) config.fonte = rangeFonte.value;
        if (rangeLinha) config.linha = rangeLinha.value;
        
        if (document.getElementById('input-nome-completo')) config.nomeCompleto = document.getElementById('input-nome-completo').value;
        if (document.getElementById('input-nome-exibicao')) config.nomeExibicao = document.getElementById('input-nome-exibicao').value;
        if (document.getElementById('input-genero')) config.genero = document.getElementById('input-genero').value;
        if (document.getElementById('input-email-recuperacao')) config.emailRecup = document.getElementById('input-email-recuperacao').value;

        if (fotoTempBase64 !== null) {
            if (fotoTempBase64 === "") {
                delete config.foto; // Apaga a chave da foto no LocalStorage
            } else {
                config.foto = fotoTempBase64;
            }
        }

        localStorage.setItem('maria_config' + userKey, JSON.stringify(config));
        temAlteracoes = false;

        // Re-bloquear os inputs após salvar e reabilitar o botão de editar
        [document.getElementById('input-nome-completo'), document.getElementById('input-nome-exibicao'), document.getElementById('input-email-recuperacao')].forEach(input => {
            if(input) input.setAttribute('readonly', true);
        });
        const inputGenero = document.getElementById('input-genero');
        if (inputGenero) inputGenero.setAttribute('disabled', true);
        if (btnEditarPessoais) btnEditarPessoais.disabled = false;

        alert('Configurações salvas com sucesso!');
    });
});

// Alerta do navegador ao tentar fechar a aba toda com dados pendentes
window.addEventListener('beforeunload', (e) => {
    if (temAlteracoes) { e.preventDefault(); e.returnValue = ''; }
});

document.addEventListener('DOMContentLoaded', carregarConfiguracoes);
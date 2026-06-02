let temAlteracoes = false;
let fotoTempBase64 = null;

const toggleTema = document.getElementById('toggle-tema');
const rangeFonte = document.getElementById('range-fonte');
const rangeLinha = document.getElementById('range-linha');
const imgPreview = document.getElementById('foto-perfil-preview');

// Carrega o estado atual salvo e reverte as visualizações no DOM
function carregarConfiguracoes() {
    const config = JSON.parse(localStorage.getItem('maria_config')) || {};
    
    // Reverte o Tema
    toggleTema.checked = !!config.temaEscuro;
    if (config.temaEscuro) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    // Reverte a Fonte
    const fonteValor = config.fonte || 100;
    rangeFonte.value = fonteValor;
    document.getElementById('valor-fonte').innerText = fonteValor + '%';
    document.documentElement.style.setProperty('--tamanho-fonte-base', (fonteValor / 100) + 'em');
    
    // Reverte o Espaçamento de Linha
    const linhaValor = config.linha || 1.5;
    rangeLinha.value = linhaValor;
    document.getElementById('valor-linha').innerText = linhaValor;
    document.documentElement.style.setProperty('--altura-linha-base', linhaValor);

    // Reverte a Foto
    if (config.foto) {
        imgPreview.src = config.foto;
    } else {
        imgPreview.src = "https://ui-avatars.com/api/?name=Sandra+Helena&background=5DAEE0&color=fff&size=100";
    }

    fotoTempBase64 = null;
    temAlteracoes = false;

    // Reverte o modo de edição das Informações Pessoais
    const inputsEditaveis = [document.getElementById('input-nome-completo'), document.getElementById('input-nome-exibicao'), document.getElementById('input-email-recuperacao')];
    inputsEditaveis.forEach(input => {
        if(input) input.setAttribute('readonly', true);
    });
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
toggleTema.addEventListener('change', (e) => {
    e.target.checked ? document.body.classList.add('dark-theme') : document.body.classList.remove('dark-theme');
});
rangeFonte.addEventListener('input', (e) => {
    document.getElementById('valor-fonte').innerText = e.target.value + '%';
    document.documentElement.style.setProperty('--tamanho-fonte-base', (e.target.value / 100) + 'em');
});
rangeLinha.addEventListener('input', (e) => {
    document.getElementById('valor-linha').innerText = e.target.value;
    document.documentElement.style.setProperty('--altura-linha-base', e.target.value);
});

// Alterar Foto
document.getElementById('btn-alterar-foto').addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file'; fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                fotoTempBase64 = event.target.result;
                imgPreview.src = fotoTempBase64;
                temAlteracoes = true;
            };
            reader.readAsDataURL(file);
        }
    };
    fileInput.click();
});

// Remover Foto
document.getElementById('btn-excluir-foto').addEventListener('click', () => {
    fotoTempBase64 = ""; // String vazia sinaliza a exclusão
    imgPreview.src = "https://ui-avatars.com/api/?name=Sandra+Helena&background=5DAEE0&color=fff&size=100";
    temAlteracoes = true;
});

// Botão Editar Informações Pessoais
const btnEditarPessoais = document.getElementById('btn-editar-pessoais');
if (btnEditarPessoais) {
    btnEditarPessoais.addEventListener('click', () => {
        [document.getElementById('input-nome-completo'), document.getElementById('input-nome-exibicao'), document.getElementById('input-email-recuperacao')].forEach(input => input.removeAttribute('readonly'));
        document.getElementById('input-nome-completo').focus();
        btnEditarPessoais.disabled = true;
    });
}

// Salvar Alterações
document.querySelectorAll('.btn-salvar').forEach(btn => {
    if (btn.id === 'btn-editar-pessoais') return; // Evita que o botão Editar chame a função de salvar
    btn.addEventListener('click', () => {
        const config = JSON.parse(localStorage.getItem('maria_config')) || {};
        config.temaEscuro = toggleTema.checked;
        config.fonte = rangeFonte.value;
        config.linha = rangeLinha.value;
        
        if (fotoTempBase64 !== null) {
            if (fotoTempBase64 === "") {
                delete config.foto; // Apaga a chave da foto no LocalStorage
            } else {
                config.foto = fotoTempBase64;
            }
        }

        localStorage.setItem('maria_config', JSON.stringify(config));
        temAlteracoes = false;

        // Re-bloquear os inputs após salvar e reabilitar o botão de editar
        [document.getElementById('input-nome-completo'), document.getElementById('input-nome-exibicao'), document.getElementById('input-email-recuperacao')].forEach(input => {
            if(input) input.setAttribute('readonly', true);
        });
        if (btnEditarPessoais) btnEditarPessoais.disabled = false;

        alert('Configurações salvas com sucesso!');
    });
});

// Alerta do navegador ao tentar fechar a aba toda com dados pendentes
window.addEventListener('beforeunload', (e) => {
    if (temAlteracoes) { e.preventDefault(); e.returnValue = ''; }
});

document.addEventListener('DOMContentLoaded', carregarConfiguracoes);
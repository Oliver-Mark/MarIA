// Executa imediatamente para evitar piscar tela branca antes do dark mode
(function() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const userKey = usuarioLogado ? '_' + usuarioLogado.email : '';
    const config = JSON.parse(localStorage.getItem('maria_config' + userKey)) || JSON.parse(localStorage.getItem('maria_config')) || {};
    
    if (config.temaEscuro) {
        document.documentElement.classList.add('dark-theme');
    }
    
    if (config.fonte) {
        document.documentElement.style.setProperty('--tamanho-fonte-base', (config.fonte / 100) + 'em');
    }
    
    if (config.linha) {
        document.documentElement.style.setProperty('--altura-linha-base', config.linha);
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const userKey = usuarioLogado ? '_' + usuarioLogado.email : '';
    const config = JSON.parse(localStorage.getItem('maria_config' + userKey)) || JSON.parse(localStorage.getItem('maria_config')) || {};
    const configPersonal = JSON.parse(localStorage.getItem('maria_config' + userKey)) || {};
    if (config.temaEscuro) document.body.classList.add('dark-theme');

    let fotoPerfil = configPersonal.foto;
    
    if (!fotoPerfil && usuarioLogado) {
        if (usuarioLogado.perfil === 'medico') {
            const medicos = JSON.parse(localStorage.getItem('medicos_maria')) || [];
            const medico = medicos.find(m => m.email === usuarioLogado.email);
            if (medico && medico.foto) fotoPerfil = medico.foto;
        } else if (usuarioLogado.perfil === 'recepcao') {
            const funcionarios = JSON.parse(localStorage.getItem('funcionarios_maria')) || [];
            const funcionario = funcionarios.find(f => f.email === usuarioLogado.email);
            if (funcionario && funcionario.foto) fotoPerfil = funcionario.foto;
        }
    }

    if (fotoPerfil) {
        document.querySelectorAll('.foto-usuario').forEach(img => { 
            img.src = fotoPerfil; 
            img.style.display = 'block'; 
            // Procura o ícone ao lado da foto e oculta se existir
            const iconeUsuario = img.parentElement.querySelector('i.ph-user-circle');
            if (iconeUsuario) iconeUsuario.style.display = 'none';
        });
    }
});
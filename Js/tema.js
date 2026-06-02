// Executa imediatamente para evitar piscar tela branca antes do dark mode
(function() {
    const config = JSON.parse(localStorage.getItem('maria_config')) || {};
    
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
    const config = JSON.parse(localStorage.getItem('maria_config')) || {};
    if (config.temaEscuro) document.body.classList.add('dark-theme');

    if (config.foto) {
        document.querySelectorAll('.foto-usuario').forEach(img => { 
            img.src = config.foto; 
            img.style.display = 'block'; 
            // Procura o ícone ao lado da foto e oculta se existir
            const iconeUsuario = img.parentElement.querySelector('i.ph-user-circle');
            if (iconeUsuario) iconeUsuario.style.display = 'none';
        });
    }
});
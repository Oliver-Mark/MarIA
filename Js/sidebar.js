document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // 1. Evita que o menu feche e abra durante o recarregamento da página
    if (sessionStorage.getItem('sidebarAberta') === 'true') {
        sidebar.classList.add('mantem-aberto');
        
        const removerTrava = () => {
            sidebar.classList.remove('mantem-aberto');
        };

        // Ouve o primeiro movimento do mouse ou a saída dele para soltar a trava visual
        document.addEventListener('mousemove', removerTrava, { once: true });
        sidebar.addEventListener('mouseleave', removerTrava, { once: true });
        
        // Limpa o storage para não afetar quando o usuário vier de fora do sistema
        sessionStorage.removeItem('sidebarAberta');
    }

    // 2. Salva o estado ao clicar em qualquer link
    const links = sidebar.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href') === '#') e.preventDefault();
            
            // Independentemente da animação ter terminado ou não, se o usuário
            // clicou na barra, a próxima tela deve carregar com ela aberta!
            sessionStorage.setItem('sidebarAberta', 'true');
        });
    });
});
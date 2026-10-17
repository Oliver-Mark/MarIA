document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // 0. Controle de Acesso e Submenus (Super Admin)
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const navMenuUl = document.querySelector('.nav-menu ul');
    
    if (navMenuUl && usuarioLogado && usuarioLogado.perfil === 'admin') {
        const linksAtuais = Array.from(navMenuUl.children);
        let linkCadastro = null;
        let linksClinica = [];

        // Separa quem vai pra Gestão e quem vai pra Clínicas
        linksAtuais.forEach(li => {
            if (li.id === 'menu-cadastro') {
                linkCadastro = li;
                li.style.display = 'block'; // Garante que o cadastro ficará visível
            } else {
                linksClinica.push(li);
            }
        });

        // Reconstrói o menu apenas se ainda não foi agrupado
        if (!document.querySelector('.menu-group')) {
            navMenuUl.innerHTML = '';

            // Grupo Gestão
            const liGestao = document.createElement('li');
            liGestao.className = 'menu-group';
            liGestao.innerHTML = `<a href="#" class="menu-toggle"><i class="ph-light ph-briefcase"></i> <span class="menu-text">Gestão</span><i class="ph-bold ph-caret-down setinha"></i></a><ul class="sub-menu" id="submenu-gestao"></ul>`;
            navMenuUl.appendChild(liGestao);
            if (linkCadastro) document.getElementById('submenu-gestao').appendChild(linkCadastro);

            // Grupo Clínicas
            const liClinicas = document.createElement('li');
            liClinicas.className = 'menu-group';
            liClinicas.innerHTML = `<a href="#" class="menu-toggle"><i class="ph-light ph-buildings"></i> <span class="menu-text">Clínicas</span><i class="ph-bold ph-caret-down setinha"></i></a><ul class="sub-menu" id="submenu-clinicas"></ul>`;
            navMenuUl.appendChild(liClinicas);
            linksClinica.forEach(li => document.getElementById('submenu-clinicas').appendChild(li));

            // Marca qual grupo possui a página ativa para destacá-lo, mas mantém fechado
            let isClinicaAtiva = false;
            linksClinica.forEach(li => { if (li.querySelector('a.active')) isClinicaAtiva = true; });

            if (linkCadastro && linkCadastro.querySelector('a.active')) {
                liGestao.classList.add('has-active');
                liGestao.classList.add('open');
            } else if (isClinicaAtiva) {
                liClinicas.classList.add('has-active');
                liClinicas.classList.add('open');
            }

            // Lógica de clique para abrir/fechar os submenus
            document.querySelectorAll('.menu-toggle').forEach(toggle => {
                toggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Fecha os outros menus (Efeito Sanfona/Accordion)
                    document.querySelectorAll('.menu-group').forEach(group => {
                        if (group !== this.parentElement) {
                            group.classList.remove('open');
                        }
                    });

                    this.parentElement.classList.toggle('open');
                });
            });
        }
    }

    // Oculta opções e bloqueia acesso para Recepção/Assistentes
    if (navMenuUl && usuarioLogado && usuarioLogado.perfil === 'recepcao') {
        const linkAssinatura = navMenuUl.querySelector('a[href="assinatura_eletronica.html"]');
        if (linkAssinatura && linkAssinatura.parentElement) {
            linkAssinatura.parentElement.style.display = 'none';
        }
        if (window.location.pathname.includes('assinatura_eletronica.html')) {
            window.location.href = 'tela_inicial.html';
        }
    }

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
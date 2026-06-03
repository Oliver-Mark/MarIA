function filtrarAgenda() {
    const selectFiltro = document.getElementById('filtro-agenda');
    if (!selectFiltro) return;
    
    const filtro = selectFiltro.value;
    const cards = document.querySelectorAll('.lista-card');

    cards.forEach(card => {
        const tipoSpan = card.querySelector('.tipo');
        let tipoItem = '';
        
        if (tipoSpan) {
            tipoItem = tipoSpan.textContent.trim();
        }

        let mostrar = false;
        
        // Se o filtro for "Todos", exibe a lista completa
        if (filtro === 'Todos') {
            mostrar = true;
        } 
        // Se o tipo do card for igual ao filtro selecionado, exibe-o
        else if (tipoItem === filtro) {
            mostrar = true;
        }

        if (mostrar) {
            card.classList.remove('oculto');
        } else {
            card.classList.add('oculto');
        }
    });
}

// Aplica o filtro automaticamente caso a página seja recarregada mantendo o status do select
document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('filtro-agenda')) {
        filtrarAgenda();
    }
});
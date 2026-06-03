document.addEventListener('DOMContentLoaded', function() {
    if (typeof flatpickr !== 'undefined' && document.getElementById('calendario')) {
        flatpickr("#calendario", {
            inline: true,
            locale: "pt",
            defaultDate: "today",
            fixedWeeks: true,
            onChange: function(selectedDates, dateStr, instance) {
                console.log("O usuário clicou no dia: ", dateStr);
            }
        });
    }

    // Função para atualizar a data e o relógio dinamicamente
    function atualizarDataEHorario() {
        const elDataCompleta = document.getElementById('data-atual-completa');
        const elDataHora = document.getElementById('data-hora-atual');

        if (!elDataCompleta && !elDataHora) return;

        const agora = new Date();
        
        const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

        const dia = agora.getDate().toString().padStart(2, '0');
        const mes = meses[agora.getMonth()];
        const ano = agora.getFullYear();
        const diaSemana = diasSemana[agora.getDay()];
        
        const horas = agora.getHours().toString().padStart(2, '0');
        const minutos = agora.getMinutes().toString().padStart(2, '0');

        if (elDataCompleta) elDataCompleta.textContent = `${dia} de ${mes} de ${ano}`;
        if (elDataHora) elDataHora.innerHTML = `${diaSemana}, ${dia} de ${mes} <i class="ph-fill ph-dot-outline"></i> ${horas}:${minutos}`;
    }

    // Executa no momento em que a página carrega e agenda para atualizar a cada minuto
    atualizarDataEHorario();
    setInterval(atualizarDataEHorario, 60000);
});
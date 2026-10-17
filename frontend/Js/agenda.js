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
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const containerFiltroMedico = document.getElementById('container-filtro-medico');
    const filtroMedico = document.getElementById('filtro-medico');
    const filtroAgenda = document.getElementById('filtro-agenda');
    const listaAgenda = document.querySelector('.lista-agenda');

    // Se for Super Admin ou Recepção, mostra o filtro de médicos e esconde a agenda até ele escolher um
    if (usuarioLogado && (usuarioLogado.perfil === 'admin' || usuarioLogado.perfil === 'recepcao')) {
        if (containerFiltroMedico) containerFiltroMedico.style.display = 'flex';
        if (filtroAgenda) filtroAgenda.disabled = true;
        if (listaAgenda) listaAgenda.style.display = 'none';
        
        if (filtroMedico) {
            let medicosCadastrados = JSON.parse(localStorage.getItem('medicos_maria')) || [];
            medicosCadastrados.forEach(medico => {
                let partesNome = medico.nome.trim().split(' ');
                let primeiroNome = partesNome[0];
                let ultimoNome = partesNome.length > 1 ? partesNome[partesNome.length - 1] : '';
                
                let titulo = medico.sexo === 'Feminino' ? 'Dra.' : 'Dr.';
                let nomeFormatado = `${titulo} ${primeiroNome} ${ultimoNome}`.trim();
                
                filtroMedico.innerHTML += `<option value="${medico.email}">${nomeFormatado}</option>`;
            });
        }
    } else if (usuarioLogado && usuarioLogado.perfil === 'medico') {
        // Se for o próprio médico, já carrega a agenda dele diretamente e oculta os pacientes fictícios
        if (listaAgenda) {
            const medicos = JSON.parse(localStorage.getItem('medicos_maria')) || [];
            const medico = medicos.find(m => m.email === usuarioLogado.email);
            
            if (medico && medico.agenda && medico.agenda.inicio && medico.agenda.fim) {
                gerarAgendaHTML(medico.agenda.inicio, medico.agenda.fim, listaAgenda);
            } else {
                listaAgenda.innerHTML = '<p style="text-align:center; padding: 20px; font-weight: bold;">Sua agenda ainda não foi configurada pelo Administrador.</p>';
            }
        }
    }

    if(document.getElementById('filtro-agenda')) {
        filtrarAgenda();
    }
});

function selecionarMedicoAgenda() {
    const filtroMedico = document.getElementById('filtro-medico');
    const filtroAgenda = document.getElementById('filtro-agenda');
    const listaAgenda = document.querySelector('.lista-agenda');

    if (filtroMedico && filtroMedico.value === "") {
        if (filtroAgenda) filtroAgenda.disabled = true;
        if (listaAgenda) listaAgenda.style.display = 'none';
    } else {
        if (filtroAgenda) filtroAgenda.disabled = false;
        if (listaAgenda) {
            listaAgenda.style.display = 'flex';
            
            // Traz a configuração de agenda do médico e injeta os blocos de horário
            const medicos = JSON.parse(localStorage.getItem('medicos_maria')) || [];
            const medico = medicos.find(m => m.email === filtroMedico.value);
            
            if (medico && medico.agenda && medico.agenda.inicio && medico.agenda.fim) {
                gerarAgendaHTML(medico.agenda.inicio, medico.agenda.fim, listaAgenda);
            } else {
                listaAgenda.innerHTML = '<p style="text-align:center; padding: 20px; font-weight: bold;">Agenda não configurada para este médico.</p>';
            }

            filtrarAgenda(); // Reaplica o filtro de status que já estiver selecionado
        }
    }
}

function gerarAgendaHTML(inicio, fim, container) {
    container.innerHTML = '';
    let [hInicio, mInicio] = inicio.split(':').map(Number);
    let [hFim, mFim] = fim.split(':').map(Number);
    
    let minutosAtuais = (hInicio * 60) + mInicio;
    let minutosFim = (hFim * 60) + mFim;
    
    if (minutosAtuais >= minutosFim) {
        container.innerHTML = '<p style="text-align:center; padding: 20px;">Horários inválidos no cadastro.</p>';
        return;
    }

    let contadorMock = 0;
    while (minutosAtuais < minutosFim) {
        let hStr = Math.floor(minutosAtuais / 60).toString().padStart(2, '0');
        let mStr = (minutosAtuais % 60).toString().padStart(2, '0');
        let horaFormatada = `${hStr}:${mStr}`;

        // Mock dinâmico simulando alguns preenchimentos para teste de visualização do Super Admin
        if (contadorMock === 2) {
            container.innerHTML += `<div class="lista-card solid"><span class="time">${horaFormatada}</span><span class="paciente">Maria Eduarda</span><span class="tipo">Retorno</span></div>`;
        } else if (contadorMock === 5) {
            container.innerHTML += `<div class="lista-card solid"><span class="time">${horaFormatada}</span><span class="paciente">Carlos Augusto</span><span class="tipo">Exame</span></div>`;
        } else if (contadorMock === 8) {
            container.innerHTML += `<div class="lista-card solid"><span class="time">${horaFormatada}</span><span class="paciente">Ana Beatriz</span><span class="tipo">Consulta</span></div>`;
        } else {
            container.innerHTML += `<div class="lista-card outline"><span class="time">${horaFormatada}</span><span class="paciente" style="color: #A0AEC0;">Horário Vago</span><span class="tipo" style="display:none;">Livre</span></div>`;
        }

        minutosAtuais += 10;
        contadorMock++;
    }
}
//Funções para alternar entre lista de pacientes e ficha do paciente
function abrirFicha() {
    const viewLista = document.getElementById('lista-pacientes-view');
    const viewFicha = document.getElementById('ficha-paciente-view');
    if (viewLista && viewFicha) {
        viewLista.style.display = 'none';
        viewFicha.style.display = 'block';
    }
}

function voltarParaLista() {
    const viewLista = document.getElementById('lista-pacientes-view');
    const viewFicha = document.getElementById('ficha-paciente-view');
    if (viewLista && viewFicha) {
        viewFicha.style.display = 'none';
        viewLista.style.display = 'block';
    }
}

// Função para filtrar documentos em Assinatura Eletrônica
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('tabela-documentos')) {
        if (typeof flatpickr !== 'undefined') {
            flatpickr(".datepicker", {
                dateFormat: "d/m/Y",
                locale: "pt"
            });
        }
        filtrarDocumentos();
    }

    // Filtro da Sala de Espera
    const selectFiltroSalaEspera = document.getElementById('filtro-situacao');
    if (selectFiltroSalaEspera) {
        selectFiltroSalaEspera.addEventListener('change', filtrarSalaEspera);
        filtrarSalaEspera(); // Aplica o filtro da opção que estiver selecionada no carregamento
        inicializarBotoesChamar(); // Prepara a lógica do botão Chamar
    }
});

function filtrarDocumentos() {
    const selectFiltro = document.getElementById('filtro-status');
    if (!selectFiltro) return;
    const filtro = selectFiltro.value;
    const linhas = document.querySelectorAll('#tabela-documentos tr');

    linhas.forEach(linha => {
        const status = linha.getAttribute('data-status');
        
        if (filtro === status) {
            linha.style.display = '';
        } else {
            linha.style.display = 'none';
        }
    });
}

// Função para filtrar pacientes na Sala de Espera
function filtrarSalaEspera() {
    const selectFiltro = document.getElementById('filtro-situacao');
    if (!selectFiltro) return;
    
    const filtro = selectFiltro.value;
    const linhas = document.querySelectorAll('.tabela-sala-espera tbody tr, .paciente-row');

    linhas.forEach(linha => {
        const status = linha.getAttribute('data-status');
        
        if (filtro === status) {
            linha.style.display = '';
        } else {
            linha.style.display = 'none';
        }
    });
}

const chamadasPorPaciente = {};

// Inicializa as ações dos botões "Chamar" na Sala de Espera
function inicializarBotoesChamar() {
    const botoesChamar = document.querySelectorAll('.btn-chamar');
    
    botoesChamar.forEach((btn, index) => {
        // Criamos um ID único temporário para cada linha caso ainda não tenha
        const row = btn.closest('tr');
        if (!row.id) row.id = 'paciente-row-' + index;
        
        btn.addEventListener('click', () => {
            const pacienteNome = row.cells[2].innerText; // O nome está na 3ª coluna
            const pacienteId = row.id;
            const senha = "SE-" + (100 + index); // Mock de uma senha sequencial

            // Inicia ou atualiza o contador do paciente
            if (!chamadasPorPaciente[pacienteId]) chamadasPorPaciente[pacienteId] = 0;
            chamadasPorPaciente[pacienteId]++;
            
            btn.disabled = true; // Desabilita o botão ao abrir o modal
            btn.innerText = "Chamando...";

            mostrarModalChamar(pacienteNome, senha, btn, pacienteId);
        });
    });
}

// Função para coordenar a abertura e o fechamento do Modal de Chamada
function mostrarModalChamar(nome, senha, btn, pacienteId) {
    const modal = document.getElementById('modal-chamar-paciente');
    const timerEl = document.getElementById('modal-timer');
    if (!modal) return;

    document.getElementById('modal-nome-paciente').innerText = nome;
    document.getElementById('modal-senha-paciente').innerText = "Senha: " + senha;
    
    let tempoRestante = 10;
    timerEl.innerText = tempoRestante;
    modal.showModal(); // Função nativa do HTML <dialog>

    const intervalo = setInterval(() => {
        tempoRestante--;
        timerEl.innerText = tempoRestante;

        if (tempoRestante <= 0) {
            clearInterval(intervalo);
            modal.close();
            
            // Se atingir 3 chamadas, aplica a penalidade de 2 min (120000 ms)
            if (chamadasPorPaciente[pacienteId] >= 3) {
                btn.innerText = "Aguarde (2m)";
                setTimeout(() => {
                    chamadasPorPaciente[pacienteId] = 0; // Zera as tentativas
                    btn.disabled = false;
                    btn.innerText = "Chamar";
                }, 120000); 
            } else {
                btn.disabled = false;
                btn.innerText = "Chamar";
            }
        }
    }, 1000);
}

//Função para atualizar gráficos
let meuGraficoInstancia = null;

// Dados base para os gráficos
const dadosAtendimentos = {
    labels: ['Consultas', 'Retornos', 'Exames'],
    valores: [182, 52, 126],
    formato: 'numero'
};

const dadosValores = {
    labels: ['Consultas', 'Exames'],
    // Valores fictícios para representar as receitas
    valores: [36400, 18900], 
    formato: 'moeda'
};

// Registra o plugin de DataLabels do Chart.js (para mostrar o número em cima da barra)
if (window.Chart && window.ChartDataLabels) {
    window.Chart.register(window.ChartDataLabels);
}

document.addEventListener('DOMContentLoaded', function() {
    // Inicializa Calendários e Gráfico apenas se o canvas existir na página (Dashboard)
    if (document.getElementById('meuGrafico')) {
        if (typeof flatpickr !== 'undefined') {
            flatpickr(".datepicker", {
                dateFormat: "d/m/Y",
                locale: "pt",
                onChange: atualizarTextoData
            });
        }

        // Cria o gráfico inicial
        atualizarGrafico();
    }
});

function formatarDataParaTexto(dataStr) {
    // Converte "01/01/2026" para "01 Jan"
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const partes = dataStr.split('/');
    if(partes.length === 3) {
        return `${partes[0]} ${meses[parseInt(partes[1]) - 1]}`;
    }
    return dataStr;
}

function atualizarTextoData() {
    const elInicio = document.getElementById('data-inicial');
    const elFim = document.getElementById('data-final');
    const elTitulo = document.getElementById('titulo-data-grafico');
    
    if (!elInicio || !elFim || !elTitulo) return;
    
    const textoInicio = formatarDataParaTexto(elInicio.value);
    const textoFim = formatarDataParaTexto(elFim.value);
    
    elTitulo.innerText = `${textoInicio} - ${textoFim}`;
    
    // Aqui num sistema real, você buscaria novos dados do servidor baseado nas datas.
    // Para o protótipo, apenas atualizamos o título.
}

function atualizarGrafico() {
    const elFiltro = document.getElementById('filtro-tipo');
    const canvas = document.getElementById('meuGrafico');
    
    if (!elFiltro || !canvas || typeof window.Chart === 'undefined') return;

    const tipo = elFiltro.value;
    const dadosAtuais = tipo === 'atendimentos' ? dadosAtendimentos : dadosValores;

    const ctx = canvas.getContext('2d');

    // Destrói o gráfico antigo se existir para não sobrepor
    if (meuGraficoInstancia) {
        meuGraficoInstancia.destroy();
    }

    meuGraficoInstancia = new window.Chart(ctx, {
        type: 'bar',
        data: {
            labels: dadosAtuais.labels,
            datasets: [{
                data: dadosAtuais.valores,
                backgroundColor: '#5DAEE0', // Azul padrão MarIA
                barThickness: 80, // Largura das barras igual ao protótipo
                borderRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }, // Oculta legenda
                tooltip: { enabled: false }, // Oculta tooltip (usaremos o datalabel fixo)
                datalabels: {
                    anchor: 'end',
                    align: 'bottom',
                    offset: -25,
                    color: '#2D3748',
                    font: { weight: 'bold', size: 16 },
                    formatter: function(value) {
                        if (dadosAtuais.formato === 'moeda') {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                        return value;
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(93, 174, 224, 0.2)', // Linhas horizontais azuis
                        lineWidth: 2
                    },
                    border: { display: false }, // Remove a linha principal vertical
                    ticks: {
                        color: '#2D3748',
                        font: { weight: 'bold', size: 14 },
                        padding: 15,
                        callback: function(value) {
                            if (dadosAtuais.formato === 'moeda') {
                                if (value >= 1000) return 'R$ ' + (value/1000) + 'k';
                                return 'R$ ' + value;
                            }
                            return value;
                        }
                    }
                },
                x: {
                    grid: { display: false }, // Remove linhas verticais
                    border: { 
                        color: '#5DAEE0', 
                        width: 2 
                    },
                    ticks: {
                        color: '#2D3748',
                        font: { weight: 'bold', size: 16 }
                    }
                }
            }
        }
    });
}

function exportarPDF() {
    // Usa html2canvas para tirar print da div do gráfico
    const container = document.getElementById('area-exportacao');
    const elTitulo = document.getElementById('titulo-data-grafico');
    const elFiltro = document.getElementById('filtro-tipo');

    if (!container || !elTitulo || !elFiltro || typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') return;

    const dataTitulo = elTitulo.innerText;
    const tipo = elFiltro.value;

    html2canvas(container, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        
        // Criação do PDF
        const doc = new jsPDF('landscape', 'mm', 'a4');
        
        // Adiciona um título ao PDF
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text(`Relatório MarIA - ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`, 20, 20);
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text(`Período: ${dataTitulo}`, 20, 30);

        // Calcula tamanho e insere a imagem no PDF
        const pdfWidth = doc.internal.pageSize.getWidth() - 40;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        doc.addImage(imgData, 'PNG', 20, 40, pdfWidth, pdfHeight);
        
        // Baixa o arquivo
        doc.save(`MarIA_Relatorio_${tipo}.pdf`);
    });
}
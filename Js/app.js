//Funções para alternar entre lista de pacientes e ficha do paciente
function abrirFicha() {
    document.getElementById('lista-pacientes-view').style.display = 'none';
    document.getElementById('ficha-paciente-view').style.display = 'block';
}

function voltarParaLista() {
    document.getElementById('ficha-paciente-view').style.display = 'none';
    document.getElementById('lista-pacientes-view').style.display = 'block';
}

// Função para filtrar documentos em Assinatura Eletrônica
document.addEventListener('DOMContentLoaded', function() {
    flatpickr(".datepicker", {
        dateFormat: "d/m/Y",
        locale: "pt"
    });
    filtrarDocumentos();
});

function filtrarDocumentos() {
    const filtro = document.getElementById('filtro-status').value;
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
Chart.register(ChartDataLabels);

document.addEventListener('DOMContentLoaded', function() {
    // Inicializa Calendários
    flatpickr(".datepicker", {
        dateFormat: "d/m/Y",
        locale: "pt",
        onChange: atualizarTextoData
    });

    // Cria o gráfico inicial
    atualizarGrafico();
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
    const inicio = document.getElementById('data-inicial').value;
    const fim = document.getElementById('data-final').value;
    
    const textoInicio = formatarDataParaTexto(inicio);
    const textoFim = formatarDataParaTexto(fim);
    
    document.getElementById('titulo-data-grafico').innerText = `${textoInicio} - ${textoFim}`;
    
    // Aqui num sistema real, você buscaria novos dados do servidor baseado nas datas.
    // Para o protótipo, apenas atualizamos o título.
}

function atualizarGrafico() {
    const tipo = document.getElementById('filtro-tipo').value;
    const dadosAtuais = tipo === 'atendimentos' ? dadosAtendimentos : dadosValores;

    const ctx = document.getElementById('meuGrafico').getContext('2d');

    // Destrói o gráfico antigo se existir para não sobrepor
    if (meuGraficoInstancia) {
        meuGraficoInstancia.destroy();
    }

    meuGraficoInstancia = new Chart(ctx, {
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
    const dataTitulo = document.getElementById('titulo-data-grafico').innerText;
    const tipo = document.getElementById('filtro-tipo').value;

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
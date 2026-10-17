let pacienteAtualIndex = null;

// Cadastro e Controle de Pacientes
function mascaraCPFPaciente(cpf) {
    return cpf.replace(/\D/g, '')
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d{1,2})/, '$1-$2')
              .replace(/(-\d{2})\d+?$/, '$1');
}

function validarCPFPaciente(cpf) {
    cpf = cpf.replace(/[^\d]+/g,'');
    if(cpf === '' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let add = 0;
    for (let i=0; i < 9; i ++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;
    add = 0;
    for (let i = 0; i < 10; i ++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;
    return true;
}

function inicializarPacientes() {
    let pacientesCadastrados = JSON.parse(localStorage.getItem('pacientes_maria'));
    
    // Mocks iniciais para não ficar vazio e preservar os que você já via antes
    if (!pacientesCadastrados) {
        pacientesCadastrados = [
            {
                nome: "João Pedro Santos", dataNasc: "1956-04-16", sexo: "Masculino",
                cpf: "000.000.000-00", rg: "1234567", contato: "(62) 99999-9999", email: "joaopedro@email.com",
                cep: "75000-000", logradouro: "Rua das Flores", numero: "123", complemento: "Apt 101",
                bairro: "Primavera", cidade: "Anápolis", estado: "GO", convenio: "Particular"
            },
            {
                nome: "Maria Eduarda Oliveira", dataNasc: "1990-08-22", sexo: "Feminino",
                cpf: "111.222.333-44", rg: "7654321", contato: "(62) 98888-8888", email: "maria@email.com",
                cep: "75000-111", logradouro: "Av. Brasil", numero: "456", complemento: "",
                bairro: "Centro", cidade: "Anápolis", estado: "GO", convenio: "Unimed"
            },
            {
                nome: "Carlos Augusto Pereira", dataNasc: "1985-11-05", sexo: "Masculino",
                cpf: "555.666.777-88", rg: "1122334", contato: "(62) 97777-7777", email: "carlos@email.com",
                cep: "75000-222", logradouro: "Rua 10", numero: "789", complemento: "Casa",
                bairro: "Jundiaí", cidade: "Anápolis", estado: "GO", convenio: "Bradesco Saúde"
            }
        ];
        localStorage.setItem('pacientes_maria', JSON.stringify(pacientesCadastrados));
    }

    atualizarListaPacientes();
}

function atualizarListaPacientes(filtro = '') {
    const tabela = document.getElementById('tabela-lista-pacientes');
    if (!tabela) return;

    let pacientes = JSON.parse(localStorage.getItem('pacientes_maria')) || [];
    tabela.innerHTML = '';

    if (filtro) {
        filtro = filtro.toLowerCase();
        pacientes = pacientes.filter(p => p.nome.toLowerCase().includes(filtro) || p.cpf.includes(filtro));
    }

    if (pacientes.length === 0) {
        tabela.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px;">Nenhum paciente encontrado.</td></tr>';
        return;
    }

    pacientes.forEach((p, index) => {
        tabela.innerHTML += `
            <tr>
                <td>${p.nome}</td>
                <td>${p.cpf}</td>
                <td class="celula-acoes">
                    <button class="btn-visualizar" onclick="abrirFicha(${index})"><i class="ph-bold ph-file-text"></i> Visualizar ficha</button>
                </td>
            </tr>
        `;
    });
}

function pesquisarPacientes() {
    const input = document.getElementById('input-pesquisa-paciente');
    if (input) {
        atualizarListaPacientes(input.value);
    }
}

function calcularIdade(dataNasc) {
    if (!dataNasc) return "";
    const hoje = new Date();
    const partes = dataNasc.split('-');
    if (partes.length === 3) {
        const ano = parseInt(partes[0]);
        const mes = parseInt(partes[1]) - 1;
        const dia = parseInt(partes[2]);
        const nasc = new Date(ano, mes, dia);
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
            idade--;
        }
        return idade + " anos";
    }
    return "";
}

function abrirFicha(index) {
    const pacientes = JSON.parse(localStorage.getItem('pacientes_maria')) || [];
    const p = pacientes[index];
    if (!p) return;

    pacienteAtualIndex = index;

    if(document.getElementById('ficha-nome')) document.getElementById('ficha-nome').value = p.nome || '';
    if(document.getElementById('ficha-data-nasc')) document.getElementById('ficha-data-nasc').value = p.dataNasc || '';
    if(document.getElementById('ficha-sexo')) document.getElementById('ficha-sexo').value = p.sexo || '';
    if(document.getElementById('ficha-idade')) document.getElementById('ficha-idade').value = calcularIdade(p.dataNasc);
    if(document.getElementById('ficha-cpf')) document.getElementById('ficha-cpf').value = p.cpf || '';
    
    // Atualiza a foto se tiver
    const imgFicha = document.getElementById('foto-ficha-paciente');
    if (imgFicha) {
        imgFicha.src = p.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nome)}&background=5DAEE0&color=fff&size=300`;
    }

    if(document.getElementById('ficha-cep')) document.getElementById('ficha-cep').value = p.cep || '';
    if(document.getElementById('ficha-logradouro')) document.getElementById('ficha-logradouro').value = p.logradouro || '';
    if(document.getElementById('ficha-numero')) document.getElementById('ficha-numero').value = p.numero || '';
    if(document.getElementById('ficha-complemento')) document.getElementById('ficha-complemento').value = p.complemento || '';
    if(document.getElementById('ficha-bairro')) document.getElementById('ficha-bairro').value = p.bairro || '';
    if(document.getElementById('ficha-cidade')) document.getElementById('ficha-cidade').value = p.cidade || '';
    if(document.getElementById('ficha-uf')) document.getElementById('ficha-uf').value = p.estado || '';
    if(document.getElementById('ficha-contato')) document.getElementById('ficha-contato').value = p.contato || '';
    if(document.getElementById('ficha-email')) document.getElementById('ficha-email').value = p.email || '';
    if(document.getElementById('ficha-convenio')) document.getElementById('ficha-convenio').value = p.convenio || 'Particular';

    desabilitarEdicaoPaciente();

    const viewLista = document.getElementById('lista-pacientes-view');
    const viewFicha = document.getElementById('ficha-paciente-view');
    const viewNovo = document.getElementById('novo-paciente-view');
    
    if (viewLista && viewFicha) {
        viewLista.style.display = 'none';
        if (viewNovo) viewNovo.style.display = 'none';
        viewFicha.style.display = 'block';
    }
}

function voltarParaLista() {
    const viewLista = document.getElementById('lista-pacientes-view');
    const viewFicha = document.getElementById('ficha-paciente-view');
    const viewNovo = document.getElementById('novo-paciente-view');
    
    if (viewLista) viewLista.style.display = 'block';
    if (viewFicha) viewFicha.style.display = 'none';
    if (viewNovo) viewNovo.style.display = 'none';
}

function abrirNovoPaciente() {
    const viewLista = document.getElementById('lista-pacientes-view');
    const viewFicha = document.getElementById('ficha-paciente-view');
    const viewNovo = document.getElementById('novo-paciente-view');
    
    if (viewLista) viewLista.style.display = 'none';
    if (viewFicha) viewFicha.style.display = 'none';
    if (viewNovo) {
        document.getElementById('form-novo-paciente').reset();
        document.getElementById('foto-novo-paciente-preview').src = 'https://ui-avatars.com/api/?name=Novo+Paciente&background=E2E8F0&color=A0AEC0&size=150';
        viewNovo.style.display = 'block';
    }
}

window.desabilitarEdicaoPaciente = function() {
    const inputs = ['ficha-nome', 'ficha-data-nasc', 'ficha-cpf', 'ficha-convenio', 'ficha-cep', 'ficha-logradouro', 'ficha-numero', 'ficha-complemento', 'ficha-bairro', 'ficha-cidade', 'ficha-uf', 'ficha-contato', 'ficha-email'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('readonly', true);
    });
    
    const selectSexo = document.getElementById('ficha-sexo');
    if (selectSexo) selectSexo.setAttribute('disabled', true);

    const btnEditar = document.getElementById('btn-editar-paciente');
    const btnSalvar = document.getElementById('btn-salvar-paciente');
    
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (btnEditar && usuarioLogado && (usuarioLogado.perfil === 'admin' || usuarioLogado.perfil === 'recepcao')) {
        btnEditar.style.display = 'flex';
    } else if (btnEditar) {
        btnEditar.style.display = 'none';
    }
    if (btnSalvar) btnSalvar.style.display = 'none';
};

window.habilitarEdicaoPaciente = function() {
    const inputs = ['ficha-nome', 'ficha-data-nasc', 'ficha-cpf', 'ficha-convenio', 'ficha-cep', 'ficha-logradouro', 'ficha-numero', 'ficha-complemento', 'ficha-bairro', 'ficha-cidade', 'ficha-uf', 'ficha-contato', 'ficha-email'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.removeAttribute('readonly');
    });
    
    const selectSexo = document.getElementById('ficha-sexo');
    if (selectSexo) selectSexo.removeAttribute('disabled');

    document.getElementById('btn-editar-paciente').style.display = 'none';
    document.getElementById('btn-salvar-paciente').style.display = 'flex';
};

window.salvarEdicaoPaciente = function() {
    if (pacienteAtualIndex === null) return;
    
    let pacientes = JSON.parse(localStorage.getItem('pacientes_maria')) || [];
    let p = pacientes[pacienteAtualIndex];
    if (!p) return;

    p.nome = document.getElementById('ficha-nome').value;
    p.dataNasc = document.getElementById('ficha-data-nasc').value;
    p.sexo = document.getElementById('ficha-sexo').value;
    p.cpf = document.getElementById('ficha-cpf').value;
    p.convenio = document.getElementById('ficha-convenio').value;
    p.cep = document.getElementById('ficha-cep').value;
    p.logradouro = document.getElementById('ficha-logradouro').value;
    p.numero = document.getElementById('ficha-numero').value;
    p.complemento = document.getElementById('ficha-complemento').value;
    p.bairro = document.getElementById('ficha-bairro').value;
    p.cidade = document.getElementById('ficha-cidade').value;
    p.estado = document.getElementById('ficha-uf').value;
    p.contato = document.getElementById('ficha-contato').value;
    p.email = document.getElementById('ficha-email').value;

    if (p.cpf && !validarCPFPaciente(p.cpf)) {
        alert('CPF inválido!');
        return;
    }

    pacientes[pacienteAtualIndex] = p;
    localStorage.setItem('pacientes_maria', JSON.stringify(pacientes));
    
    alert('Paciente atualizado com sucesso!');
    
    if(document.getElementById('ficha-idade')) document.getElementById('ficha-idade').value = calcularIdade(p.dataNasc);
    
    desabilitarEdicaoPaciente();
    atualizarListaPacientes();
};

function previewFotoNovoPaciente(event) {
    const file = event.target.files[0];
    if (file) {
        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!tiposPermitidos.includes(file.type)) {
            alert('Formato de imagem inválido! Selecione um arquivo PNG ou JPG/JPEG.');
            event.target.value = ''; // Limpa o input
            document.getElementById('foto-novo-paciente-preview').src = 'https://ui-avatars.com/api/?name=Novo+Paciente&background=E2E8F0&color=A0AEC0&size=150';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('foto-novo-paciente-preview').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

function buscarCEPPaciente() {
    const cep = document.getElementById('cep-paciente').value.replace(/\D/g, '');
    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(res => res.json())
            .then(data => {
                if (!data.erro) {
                    document.getElementById('logradouro-paciente').value = data.logradouro;
                    document.getElementById('bairro-paciente').value = data.bairro;
                    document.getElementById('cidade-paciente').value = data.localidade;
                    document.getElementById('estado-paciente').value = data.uf;
                    document.getElementById('numero-paciente').focus();
                } else {
                    alert('CEP não encontrado!');
                }
            }).catch(() => alert('Erro ao buscar o CEP. Verifique sua conexão.'));
    }
}

function formatarDataBR(dataISO) {
    if (!dataISO) return "";
    const partes = dataISO.split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return dataISO;
}

function inicializarFilaEspera() {
    // Garante que a base de pacientes existe antes
    if (!localStorage.getItem('pacientes_maria')) inicializarPacientes();
    
    let fila = JSON.parse(localStorage.getItem('fila_espera_maria'));
    if (!fila) {
        fila = [
            { pacienteIndex: 0, chegada: "08:30", marcada: "09:30", motivo: "Consulta", status: "aguardando" },
            { pacienteIndex: 1, chegada: "09:53", marcada: "10:00", motivo: "Retorno", status: "em-atendimento" },
            { pacienteIndex: 2, chegada: "10:21", marcada: "10:30", motivo: "Exame", status: "atendido" }
        ];
        localStorage.setItem('fila_espera_maria', JSON.stringify(fila));
    }
    atualizarFilaEspera();
}

function atualizarFilaEspera() {
    const tbody = document.getElementById('tabela-sala-espera-body');
    if (!tbody) return;
    
    let fila = JSON.parse(localStorage.getItem('fila_espera_maria')) || [];
    let pacientes = JSON.parse(localStorage.getItem('pacientes_maria')) || [];
    
    tbody.innerHTML = '';
    
    fila.forEach((item, index) => {
        let p = pacientes[item.pacienteIndex];
        if (!p) return;
        
        let acoes = '';
        if (item.status === 'aguardando') {
            acoes = `
                <button class="btn-chamar">Chamar</button>
                <button class="btn-atender" onclick="atenderPaciente(${item.pacienteIndex})">Atender</button>
            `;
        } else if (item.status === 'em-atendimento') {
            acoes = `<span class="status-em-atendimento">Em Atendimento</span>`;
        } else if (item.status === 'atendido') {
            acoes = `<span class="status-atendido">Atendido</span>`;
        }

        tbody.innerHTML += `
            <tr class="paciente-row" data-status="${item.status}" id="paciente-row-${index}">
                <td>${item.chegada}</td>
                <td>${item.marcada}</td>
                <td>${p.nome}</td>
                <td>${item.motivo}</td>
                <td class="celula-acao">
                    ${acoes}
                </td>
            </tr>
        `;
    });
    
    inicializarBotoesChamar();
    filtrarSalaEspera();
}

window.atenderPaciente = function(pacienteIndex) {
    localStorage.setItem('pacienteEmAtendimento', pacienteIndex);
    window.location.href = 'triagem.html';
};

function carregarDadosTriagem() {
    if (document.querySelector('.secao-triagem')) {
        let pacienteIndex = localStorage.getItem('pacienteEmAtendimento');
        if (pacienteIndex !== null) {
            let pacientes = JSON.parse(localStorage.getItem('pacientes_maria')) || [];
            let p = pacientes[pacienteIndex];
            if (p) {
                if (document.getElementById('nome')) document.getElementById('nome').value = p.nome;
                if (document.getElementById('data_nasc')) document.getElementById('data_nasc').value = formatarDataBR(p.dataNasc);
                if (document.getElementById('sexo')) document.getElementById('sexo').value = p.sexo || 'Prefiro não informar';
                if (document.getElementById('idade')) document.getElementById('idade').value = calcularIdade(p.dataNasc);
                if (document.getElementById('cpf')) document.getElementById('cpf').value = p.cpf;
                if (document.getElementById('convenio')) document.getElementById('convenio').value = p.convenio || 'Particular';
                
                const imgFoto = document.querySelector('.foto-paciente img');
                if (imgFoto) {
                    imgFoto.src = p.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nome)}&background=5DAEE0&color=fff&size=300`;
                }
            }
        }
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

    // Filtro da Sala de Espera e Fila
    const selectFiltroSalaEspera = document.getElementById('filtro-situacao');
    const tbodyFila = document.getElementById('tabela-sala-espera-body');
    if (selectFiltroSalaEspera || tbodyFila) {
        if (selectFiltroSalaEspera) selectFiltroSalaEspera.addEventListener('change', filtrarSalaEspera);
        inicializarFilaEspera(); 
    }

    // Carregar Triagem se estiver na tela
    carregarDadosTriagem();

    // Inicialização da Tela de Pacientes
    if (document.getElementById('tabela-lista-pacientes')) {
        inicializarPacientes();
        
        const btnNovo = document.getElementById('btn-novo-paciente');
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        // Permite Novo Paciente para Admin e Recepção
        if (btnNovo && usuarioLogado && (usuarioLogado.perfil === 'admin' || usuarioLogado.perfil === 'recepcao')) {
            btnNovo.style.display = 'flex';
        }

        // Submissão do form
        const formNovoPaciente = document.getElementById('form-novo-paciente');
        if (formNovoPaciente) {
            formNovoPaciente.addEventListener('submit', function(e) {
                e.preventDefault();
                
                let fotoSrc = document.getElementById('foto-novo-paciente-preview').src;
                let foto = fotoSrc.startsWith('data:image') ? fotoSrc : null;
                
                const novo = {
                    foto: foto,
                    nome: document.getElementById('nome-paciente').value,
                    dataNasc: document.getElementById('data-nasc-paciente').value,
                    sexo: document.getElementById('sexo-paciente').value,
                    cpf: document.getElementById('cpf-paciente').value,
                    rg: document.getElementById('rg-paciente').value,
                    contato: document.getElementById('contato-paciente').value,
                    email: document.getElementById('email-paciente').value,
                    cep: document.getElementById('cep-paciente').value,
                    logradouro: document.getElementById('logradouro-paciente').value,
                    numero: document.getElementById('numero-paciente').value,
                    complemento: document.getElementById('complemento-paciente').value,
                    bairro: document.getElementById('bairro-paciente').value,
                    cidade: document.getElementById('cidade-paciente').value,
                    estado: document.getElementById('estado-paciente').value,
                    convenio: "Particular" // Padrão
                };
                
                let pacientes = JSON.parse(localStorage.getItem('pacientes_maria')) || [];
                pacientes.push(novo);
                localStorage.setItem('pacientes_maria', JSON.stringify(pacientes));
                
                alert('Paciente cadastrado com sucesso!');
                voltarParaLista();
                atualizarListaPacientes();
            });
        }
        
        const inputCpf = document.getElementById('cpf-paciente');
        if (inputCpf) {
            inputCpf.addEventListener('input', function() { this.value = mascaraCPFPaciente(this.value); });
            inputCpf.addEventListener('blur', function() {
                if (this.value && !validarCPFPaciente(this.value)) {
                    alert('CPF inválido!');
                    this.value = '';
                }
            });
        }
        
        // Auto-formatação do CPF também na Ficha
        const fichaCpf = document.getElementById('ficha-cpf');
        if (fichaCpf) {
            fichaCpf.addEventListener('input', function() { this.value = mascaraCPFPaciente(this.value); });
            fichaCpf.addEventListener('blur', function() {
                if (this.value && !validarCPFPaciente(this.value)) {
                    alert('CPF inválido!');
                    this.value = '';
                }
            });
        }
        
        const inputPesquisa = document.getElementById('input-pesquisa-paciente');
        if (inputPesquisa) {
            inputPesquisa.addEventListener('keyup', function(e) {
                if(e.key === 'Enter') pesquisarPacientes();
            });
        }
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
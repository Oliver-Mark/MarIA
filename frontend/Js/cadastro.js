// Alternância visual de abas
function mudarAba(abaId, evento) {
    document.querySelectorAll('.aba').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.conteudo-aba').forEach(conteudo => conteudo.classList.remove('active'));
    
    evento.currentTarget.classList.add('active');
    document.getElementById('aba-' + abaId).classList.add('active');
}

// Integração com a API ViaCEP
function buscarCEP() {
    const cep = document.getElementById('cep').value.replace(/\D/g, '');
    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(res => res.json())
            .then(data => {
                if (!data.erro) {
                    document.getElementById('logradouro').value = data.logradouro;
                    document.getElementById('bairro').value = data.bairro;
                    document.getElementById('cidade').value = data.localidade;
                    document.getElementById('estado').value = data.uf;
                    document.getElementById('numero').focus(); // Joga o cursor para o campo de preenchimento manual
                } else {
                    alert('CEP não encontrado!');
                }
            }).catch(() => alert('Erro ao buscar o CEP. Verifique sua conexão.'));
    }
}

// Integração com a API ViaCEP (Funcionário)
function buscarCEPFuncionario() {
    const cep = document.getElementById('cep-funcionario').value.replace(/\D/g, '');
    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(res => res.json())
            .then(data => {
                if (!data.erro) {
                    document.getElementById('logradouro-funcionario').value = data.logradouro;
                    document.getElementById('bairro-funcionario').value = data.bairro;
                    document.getElementById('cidade-funcionario').value = data.localidade;
                    document.getElementById('estado-funcionario').value = data.uf;
                    document.getElementById('numero-funcionario').focus(); // Joga o cursor para o campo de preenchimento manual
                } else {
                    alert('CEP não encontrado!');
                }
            }).catch(() => alert('Erro ao buscar o CEP. Verifique sua conexão.'));
    }
}

// Integração com a API ViaCEP (Médico)
function buscarCEPMedico() {
    const cep = document.getElementById('cep-medico').value.replace(/\D/g, '');
    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(res => res.json())
            .then(data => {
                if (!data.erro) {
                    document.getElementById('logradouro-medico').value = data.logradouro;
                    document.getElementById('bairro-medico').value = data.bairro;
                    document.getElementById('cidade-medico').value = data.localidade;
                    document.getElementById('estado-medico').value = data.uf;
                    document.getElementById('numero-medico').focus(); // Joga o cursor para o campo de preenchimento manual
                } else {
                    alert('CEP não encontrado!');
                }
            }).catch(() => alert('Erro ao buscar o CEP. Verifique sua conexão.'));
    }
}

// Validação de Arquivos
function previewFotoFuncionario(event) {
    const file = event.target.files[0];
    if (file) {
        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!tiposPermitidos.includes(file.type)) {
            alert('Formato de imagem inválido! Selecione um arquivo PNG ou JPG/JPEG.');
            event.target.value = ''; // Limpa o input
            document.getElementById('foto-funcionario-preview').src = 'https://ui-avatars.com/api/?name=Foto+Perfil&background=E2E8F0&color=A0AEC0&size=150';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('foto-funcionario-preview').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

function previewFotoMedico(event) {
    const file = event.target.files[0];
    if (file) {
        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!tiposPermitidos.includes(file.type)) {
            alert('Formato de imagem inválido! Selecione um arquivo PNG ou JPG/JPEG.');
            event.target.value = ''; // Limpa o input
            document.getElementById('foto-medico-preview').src = 'https://ui-avatars.com/api/?name=Foto+Perfil&background=E2E8F0&color=A0AEC0&size=150';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('foto-medico-preview').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

function validarPDF(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.type !== 'application/pdf') {
            alert('Formato de arquivo inválido! O documento deve ser um PDF.');
            event.target.value = ''; // Limpa o input
        }
    }
}

// Validação e Máscaras de CPF/CNPJ
function mascaraCPF(cpf) {
    return cpf.replace(/\D/g, '')
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d{1,2})/, '$1-$2')
              .replace(/(-\d{2})\d+?$/, '$1');
}

function mascaraCNPJ(cnpj) {
    return cnpj.replace(/\D/g, '')
               .replace(/(\d{2})(\d)/, '$1.$2')
               .replace(/(\d{3})(\d)/, '$1.$2')
               .replace(/(\d{3})(\d)/, '$1/$2')
               .replace(/(\d{4})(\d{1,2})/, '$1-$2')
               .replace(/(-\d{2})\d+?$/, '$1');
}

function validarCPF(cpf) {
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

function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g,'');
    if(cnpj === '' || cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0,tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) { soma += numeros.charAt(tamanho - i) * pos--; if (pos < 2) pos = 9; }
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;
    tamanho = tamanho + 1; numeros = cnpj.substring(0,tamanho); soma = 0; pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) { soma += numeros.charAt(tamanho - i) * pos--; if (pos < 2) pos = 9; }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false;
    return true;
}

// Função para atualizar as tabelas de listagem
function atualizarListas() {
    const tabelaClinicas = document.getElementById('tabela-clinicas');
    if (tabelaClinicas) {
        let clinicasCadastradas = JSON.parse(localStorage.getItem('clinicas_maria')) || [];
        tabelaClinicas.innerHTML = '';
        if (clinicasCadastradas.length === 0) {
            tabelaClinicas.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhuma clínica cadastrada.</td></tr>';
        } else {
            clinicasCadastradas.forEach((clinica, index) => {
                tabelaClinicas.innerHTML += `
                    <tr>
                        <td>${clinica.nome}</td>
                        <td>${clinica.gestor || '-'}</td>
                        <td>${clinica.qtdConsultorios}</td>
                        <td>${clinica.cidade || '-'}/${clinica.estado || '-'}</td>
                        <td><button type="button" class="btn-excluir-item" onclick="excluirItem('clinicas_maria', ${index})"><i class="ph-bold ph-trash"></i></button></td>
                    </tr>
                `;
            });
        }
    }

    const tabelaFuncionarios = document.getElementById('tabela-funcionarios');
    if (tabelaFuncionarios) {
        let funcionariosCadastrados = JSON.parse(localStorage.getItem('funcionarios_maria')) || [];
        tabelaFuncionarios.innerHTML = '';
        if (funcionariosCadastrados.length === 0) {
            tabelaFuncionarios.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum funcionário cadastrado.</td></tr>';
        } else {
            funcionariosCadastrados.forEach((func, index) => {
                tabelaFuncionarios.innerHTML += `
                    <tr>
                        <td>${func.nome}</td>
                        <td>${func.cargo}</td>
                        <td>${func.email}</td>
                        <td>${func.cpf || '-'}</td>
                        <td><button type="button" class="btn-excluir-item" onclick="excluirItem('funcionarios_maria', ${index})"><i class="ph-bold ph-trash"></i></button></td>
                    </tr>
                `;
            });
        }
    }

    const tabelaMedicos = document.getElementById('tabela-medicos');
    if (tabelaMedicos) {
        let medicosCadastrados = JSON.parse(localStorage.getItem('medicos_maria')) || [];
        tabelaMedicos.innerHTML = '';
        if (medicosCadastrados.length === 0) {
            tabelaMedicos.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum médico cadastrado.</td></tr>';
        } else {
            medicosCadastrados.forEach((medico, index) => {
                tabelaMedicos.innerHTML += `
                    <tr>
                        <td>${medico.nome}</td>
                        <td>${medico.especialidade}</td>
                        <td>${medico.crm || '-'}/${medico.ufCrm || '-'}</td>
                        <td>${medico.email}</td>
                        <td><button type="button" class="btn-excluir-item" onclick="excluirItem('medicos_maria', ${index})"><i class="ph-bold ph-trash"></i></button></td>
                    </tr>
                `;
            });
        }
    }
}

// Função global para excluir itens das tabelas
window.excluirItem = function(chaveStorage, index) {
    if (confirm('Tem certeza que deseja excluir este cadastro? Essa ação não pode ser desfeita.')) {
        let lista = JSON.parse(localStorage.getItem(chaveStorage)) || [];
        lista.splice(index, 1); // Remove 1 item na posição selecionada
        localStorage.setItem(chaveStorage, JSON.stringify(lista));
        alert('Cadastro excluído com sucesso!');
        atualizarListas();
    }
};

// Salvamento dos dados da clínica
document.addEventListener('DOMContentLoaded', () => {

    // Aplicação das Máscaras e Validação (Impede CPFs/CNPJs incorretos de entrarem)
    const camposCPF = ['cpf-funcionario', 'cpf-medico'];
    camposCPF.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function() { this.value = mascaraCPF(this.value); });
            el.addEventListener('blur', function() {
                if (this.value && !validarCPF(this.value)) {
                    alert('CPF inválido! Por favor, verifique a numeração informada.');
                    this.value = '';
                }
            });
        }
    });

    const campoCNPJ = document.getElementById('cnpj-medico');
    if (campoCNPJ) {
        campoCNPJ.addEventListener('input', function() { this.value = mascaraCNPJ(this.value); });
        campoCNPJ.addEventListener('blur', function() {
            if (this.value && !validarCNPJ(this.value)) {
                alert('CNPJ inválido! Por favor, verifique a numeração informada.');
                this.value = '';
            }
        });
    }

    const formClinica = document.getElementById('form-clinica');
    if (formClinica) {
        formClinica.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const novaClinica = {
                nome: document.getElementById('nome-clinica').value,
                gestor: document.getElementById('gestor-clinica').value,
                cidade: document.getElementById('cidade').value,
                estado: document.getElementById('estado').value,
                qtdConsultorios: document.getElementById('qtd-consultorios').value
            };

            let clinicasCadastradas = JSON.parse(localStorage.getItem('clinicas_maria')) || [];
            clinicasCadastradas.push(novaClinica);
            localStorage.setItem('clinicas_maria', JSON.stringify(clinicasCadastradas));
            
            alert('Clínica cadastrada com sucesso! Ela já estará disponível na seleção.');
            formClinica.reset();
            atualizarListas();
        });
    }

    // Salvamento dos dados do funcionário
    const formFuncionario = document.getElementById('form-funcionario');
    if (formFuncionario) {
        formFuncionario.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let fotoSrc = document.getElementById('foto-funcionario-preview').src;
            let foto = fotoSrc.startsWith('data:image') ? fotoSrc : null;

            const novoFuncionario = {
                foto: foto,
                nome: document.getElementById('nome-funcionario').value,
                dataNasc: document.getElementById('data-nasc-funcionario').value,
                sexo: document.getElementById('sexo-funcionario').value,
                cpf: document.getElementById('cpf-funcionario').value,
                rg: document.getElementById('rg-funcionario').value,
                cargo: document.getElementById('cargo-funcionario').value,
                pis: document.getElementById('pis-funcionario').value,
                cep: document.getElementById('cep-funcionario').value,
                logradouro: document.getElementById('logradouro-funcionario').value,
                numero: document.getElementById('numero-funcionario').value,
                complemento: document.getElementById('complemento-funcionario').value,
                bairro: document.getElementById('bairro-funcionario').value,
                cidade: document.getElementById('cidade-funcionario').value,
                estado: document.getElementById('estado-funcionario').value,
                email: document.getElementById('email-acesso-funcionario').value,
                senha: document.getElementById('senha-acesso-funcionario').value
            };

            let funcionariosCadastrados = JSON.parse(localStorage.getItem('funcionarios_maria')) || [];
            funcionariosCadastrados.push(novoFuncionario);
            localStorage.setItem('funcionarios_maria', JSON.stringify(funcionariosCadastrados));

            alert('Funcionário cadastrado com sucesso!');
            formFuncionario.reset();
            document.getElementById('foto-funcionario-preview').src = 'https://ui-avatars.com/api/?name=Foto+Perfil&background=E2E8F0&color=A0AEC0&size=150';
            atualizarListas();
        });
    }

    // Salvamento dos dados do médico
    const formMedico = document.getElementById('form-medico');
    if (formMedico) {
        formMedico.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let fotoSrc = document.getElementById('foto-medico-preview').src;
            let foto = fotoSrc.startsWith('data:image') ? fotoSrc : null;

            const diasSelecionados = Array.from(document.querySelectorAll('input[name="dias-medico"]:checked')).map(el => el.value);
            const inicioAgenda = document.getElementById('inicio-agenda-medico').value;
            const fimAgenda = document.getElementById('fim-agenda-medico').value;

            const novoMedico = {
                foto: foto,
                nome: document.getElementById('nome-medico').value,
                dataNasc: document.getElementById('data-nasc-medico').value,
                sexo: document.getElementById('sexo-medico').value,
                cpf: document.getElementById('cpf-medico').value,
                rg: document.getElementById('rg-medico').value,
                especialidade: document.getElementById('especialidade-medico').value,
                crm: document.getElementById('crm-medico').value,
                ufCrm: document.getElementById('uf-crm-medico').value,
                rqe: document.getElementById('rqe-medico').value,
                cnpj: document.getElementById('cnpj-medico').value,
                cep: document.getElementById('cep-medico').value,
                logradouro: document.getElementById('logradouro-medico').value,
                numero: document.getElementById('numero-medico').value,
                complemento: document.getElementById('complemento-medico').value,
                bairro: document.getElementById('bairro-medico').value,
                cidade: document.getElementById('cidade-medico').value,
                estado: document.getElementById('estado-medico').value,
                email: document.getElementById('email-acesso-medico').value,
                senha: document.getElementById('senha-acesso-medico').value,
                agenda: {
                    dias: diasSelecionados,
                    inicio: inicioAgenda,
                    fim: fimAgenda
                }
            };

            let medicosCadastrados = JSON.parse(localStorage.getItem('medicos_maria')) || [];
            medicosCadastrados.push(novoMedico);
            localStorage.setItem('medicos_maria', JSON.stringify(medicosCadastrados));

            alert('Médico cadastrado com sucesso!');
            formMedico.reset();
            document.getElementById('foto-medico-preview').src = 'https://ui-avatars.com/api/?name=Foto+Perfil&background=E2E8F0&color=A0AEC0&size=150';
            atualizarListas();
        });
    }

    atualizarListas();
});
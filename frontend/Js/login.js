let btnAcessar = document.getElementById('btnAcessar');
let senha = document.getElementById('senha');
let email = document.getElementById('email');

if (btnAcessar && senha && email) {
    btnAcessar.addEventListener('click', function(event){
        event.preventDefault();

        const emailDigitado = email.value;
        const senhaDigitada = senha.value;

        // Funcionários cadastrados dinamicamente pelo painel do Admin
        let funcionariosCadastrados = JSON.parse(localStorage.getItem('funcionarios_maria')) || [];
        let funcionarioEncontrado = funcionariosCadastrados.find(f => f.email === emailDigitado && f.senha === senhaDigitada);

        // Médicos cadastrados dinamicamente pelo painel do Admin
        let medicosCadastrados = JSON.parse(localStorage.getItem('medicos_maria')) || [];
        let medicoEncontrado = medicosCadastrados.find(m => m.email === emailDigitado && m.senha === senhaDigitada);

        // Super Admin
        if (emailDigitado === "admin@maria.com" && senhaDigitada === "Maria@admin@123") {
            localStorage.setItem('usuarioLogado', JSON.stringify({ email: emailDigitado, perfil: 'admin' }));
            window.location.href = 'tela_inicial.html'; // Pula a tela de seleção
        } 
        // Médico cadastrado dinamicamente
        else if (medicoEncontrado) {
            localStorage.setItem('usuarioLogado', JSON.stringify({ email: emailDigitado, perfil: 'medico' }));
            window.location.href = 'selecao.html'; // Redireciona para escolha de clínica
        }
        // Funcionário cadastrado dinamicamente
        else if (funcionarioEncontrado) {
            localStorage.setItem('usuarioLogado', JSON.stringify({ email: emailDigitado, perfil: 'recepcao' }));
            window.location.href = 'tela_inicial.html'; // Pula a tela de seleção
        } 
        else {
            alert('E-mail ou senha incorretos!');
        }
    });

    // Permite fazer login pressionando a tecla Enter
    const logarComEnter = function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            btnAcessar.click();
        }
    };
    email.addEventListener('keydown', logarComEnter);
    senha.addEventListener('keydown', logarComEnter);
}
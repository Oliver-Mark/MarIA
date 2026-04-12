let btnAcessar = document.getElementById('btnAcessar');
let senha = document.getElementById('senha');
let email = document.getElementById('email');

btnAcessar.addEventListener('click', function(event){
    event.preventDefault();

    const emailDigitado = email.value;
    const senhaDigitada = senha.value;
    if(emailDigitado == "admin@maria.com" && senhaDigitada == "123456"){
        window.location.href = 'selecao.html';
    } else {
        alert('E-mail ou senha incorretos. Tente: admin@maria.com e senha 123456.')
    }
});
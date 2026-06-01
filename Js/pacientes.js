function abrirFicha() {
    document.getElementById('lista-pacientes-view').style.display = 'none';
    document.getElementById('ficha-paciente-view').style.display = 'block';
}

function voltarParaLista() {
    document.getElementById('ficha-paciente-view').style.display = 'none';
    document.getElementById('lista-pacientes-view').style.display = 'block';
}
const modal = document.getElementById("modalEsqueci");
const btnAbrir = document.getElementById("btnRecuperar");
const btnFechar = document.getElementById("btnFechar");

btnAbrir.onclick = () => modal.showModal();
btnFechar.onclick = () => modal.close();

modal.onclick = (e) => {
    if (e.target === modal) modal.close();
}
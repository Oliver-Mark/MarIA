import { api } from "./hub-api.js?v=20261015-attachments";

const el = (id) => document.getElementById(id);
let current;
let imageUrl;
let accessTimer;

function clearImage() {
  el("document-image").removeAttribute("src");
  if (imageUrl) URL.revokeObjectURL(imageUrl);
  imageUrl = undefined;
}

function clearViewer() {
  current = undefined;
  clearInterval(accessTimer);
  clearImage();
}

function fail(error) {
  clearViewer();
  el("document-status").textContent = error.message;
  el("document-previous").disabled = true;
  el("document-next").disabled = true;
}

async function showPage(page) {
  const viewing = current;
  if (!viewing) return;
  clearImage();
  el("document-status").textContent = "Carregando página…";
  el("document-previous").disabled = true;
  el("document-next").disabled = true;
  try {
    const blob = await api(`attachments/${viewing.id}/pages/${page}/`, { binary: true });
    if (current !== viewing) return;
    viewing.page = page;
    imageUrl = URL.createObjectURL(blob);
    el("document-image").src = imageUrl;
    el("document-status").textContent = `Página ${page} de ${viewing.pages}`;
    el("document-previous").disabled = page === 1;
    el("document-next").disabled = page === viewing.pages;
  } catch (error) {
    if (current === viewing) fail(error);
  }
}

export async function openDocument(attachment) {
  clearViewer();
  el("document-title").textContent = attachment.filename;
  el("document-status").textContent = "Verificando acesso…";
  el("document-dialog").showModal();
  const viewing = { id: attachment.id };
  current = viewing;
  try {
    const info = await api(`attachments/${attachment.id}/preview/`);
    if (current !== viewing) return;
    viewing.pages = info.pages;
    await showPage(1);
    if (current !== viewing) return;
    accessTimer = setInterval(async () => {
      try {
        await api(`attachments/${viewing.id}/preview/`);
      } catch (error) {
        if (current === viewing) fail(error);
      }
    }, 30000);
  } catch (error) {
    if (current === viewing) fail(error);
  }
}

el("close-document").addEventListener("click", () => el("document-dialog").close());
el("document-dialog").addEventListener("close", clearViewer);
el("document-previous").addEventListener("click", () => showPage(current.page - 1));
el("document-next").addEventListener("click", () => showPage(current.page + 1));
el("document-image").addEventListener("contextmenu", (event) => event.preventDefault());

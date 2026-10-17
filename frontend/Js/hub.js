import { loadProfile } from "./hub-profile.js?v=20261017-1";
import { openDocument } from "./hub-document-viewer.js?v=20261015-1";
import { api, logout } from "./hub-api.js?v=20261015-attachments";

const el = (id) => document.getElementById(id);
let profile;
let patients = [];
let grants = [];
let encounterPatient;
const labels = { pending: "Pendente", approved: "Autorizada", denied: "Recusada", revoked: "Revogada", expired: "Expirada", neutral: "Sem autorização" };
const date = (value) => new Date(value).toLocaleString("pt-BR");
const initials = (value) => value.split(/[ _]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
function text(tag, value, className) {
  const node = document.createElement(tag);
  node.textContent = value;
  if (className) node.className = className;
  return node;
}
function message(value, error = false) {
  const target = el("encounter-dialog").open ? el("encounter-status") : el("request-dialog").open ? el("request-status") : el("status");
  target.hidden = false;
  target.textContent = value;
  target.classList.toggle("error", error);
}
function guarded(action) {
  return async (event) => {
    event?.preventDefault();
    const button = event?.target.closest("button") || event?.target.querySelector("button[type=submit]");
    if (button) button.disabled = true;
    try { await action(); }
    catch (error) { message(error.message, true); }
    finally { if (button) button.disabled = false; }
  };
}
function grantState(grant) {
  return ["approved", "pending"].includes(grant.status) && new Date(grant.expires_at) <= new Date() ? "expired" : grant.status;
}
function patientState(patient) {
  const related = grants.filter((grant) => grant.patient_id === patient.id);
  return ["approved", "pending", "revoked", "denied", "expired"].find((state) => related.some((grant) => grantState(grant) === state)) || "neutral";
}
async function history(patient, own = false) {
  el("records").replaceChildren(text("p", "Consultando autorização…", "empty-state"));
  el("history-title").textContent = (own ? "Meus atendimentos de " : "Histórico compartilhado de ") + patient.name;
  el("history-scope").textContent = own ? "Somente minha autoria" : "Autorização pessoal";
  try {
    const result = await api(`doctor/patients/${patient.id}/${own ? "records" : "history"}/`);
    renderRecords(result.records, el("records"));
    message("Histórico consultado. Acesso registrado.");
  } catch (error) {
    el("records").replaceChildren(text("p", own ? "Não há atendimentos de sua autoria disponíveis para este paciente." : "Histórico compartilhado indisponível. É necessária autorização pessoal vigente.", "empty-state"));
    throw error;
  }
}
function renderRecords(records, container) {
  container.replaceChildren();
  for (const record of records) {
    const card = document.createElement("article");
    card.append(text("h3", date(record.occurred_at)), text("p", record.summary),
      text("p", record.patient_reported ? "Informado pelo paciente • " + record.author_name :
        `${record.author_name} • ${record.clinic_name || "Atendimento independente"}`));
    for (const attachment of record.attachments || []) {
      const view = text("button", "Visualizar documento: " + attachment.filename, "secondary");
      view.type = "button";
      view.addEventListener("click", () => openDocument(attachment));
      card.append(view);
      if (!profile.patient_id) continue;
      const button = text("button", "Baixar meu documento: " + attachment.filename, "secondary");
      button.type = "button";
      button.addEventListener("click", guarded(async () => {
        const blob = await api(`attachments/${attachment.id}/download/`, { binary: true });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = attachment.filename;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }));
      card.append(button);
    }
    container.append(card);
  }
  if (!records.length) container.append(text("p", "Nenhum registro disponível.", "empty-state"));
}
async function loadPatientHistory() {
  const result = await api("patient/records/");
  renderRecords(result.records, el("patient-records"));
}
function renderPatients() {
  const query = el("patient-search").value.trim().toLocaleLowerCase("pt-BR");
  const filtered = patients.filter((patient) => patient.name.toLocaleLowerCase("pt-BR").includes(query));
  el("patients").replaceChildren();
  for (const patient of filtered) {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const identity = document.createElement("div");
    identity.className = "patient-name";
    const name = document.createElement("div");
    name.append(text("strong", patient.name), text("small", "Paciente MarIA"));
    identity.append(text("span", initials(patient.name), "avatar"), name);
    nameCell.append(identity);
    const state = patientState(patient);
    const stateCell = document.createElement("td");
    stateCell.append(text("span", labels[state], "badge " + state));
    const actionCell = document.createElement("td");
    const button = text("button", "Consultar histórico →", "record-button");
    button.type = "button";
    button.disabled = state !== "approved";
    button.setAttribute("aria-label", "Consultar histórico de " + patient.name);
    button.addEventListener("click", guarded(() => history(patient)));
    actionCell.append(button);
    const ownButton = text("button", "Meus atendimentos", "record-button");
    ownButton.type = "button";
    ownButton.setAttribute("aria-label", "Meus atendimentos de " + patient.name);
    ownButton.addEventListener("click", guarded(() => history(patient, true)));
    const createButton = text("button", "Registrar atendimento", "record-button");
    createButton.type = "button";
    createButton.disabled = state !== "approved";
    createButton.title = "Cadastro exige autorização pessoal vigente";
    createButton.addEventListener("click", () => openEncounter(patient));
    actionCell.append(ownButton, createButton);
    row.append(nameCell, stateCell, actionCell);
    el("patients").append(row);
  }
  if (!filtered.length) {
    const row = document.createElement("tr");
    const cell = text("td", query ? "Nenhum paciente encontrado para esta pesquisa." : "Sua carteira começa com uma solicitação de acesso ao paciente.", "empty-state");
    cell.colSpan = 3;
    row.append(cell);
    el("patients").append(row);
  }
  el("patient-count").textContent = patients.length;
  el("active-count").textContent = new Set(grants.filter((grant) => grantState(grant) === "approved").map((grant) => grant.patient_id)).size;
  el("pending-count").textContent = grants.filter((grant) => grantState(grant) === "pending").length;
}
async function loadGrants() {
  grants = await api(profile.patient_id ? "patient/grants/" : "doctor/grants/");
  el("grants").replaceChildren();
  for (const grant of grants) {
    const card = document.createElement("article");
    card.className = "grant-card";
    const recipient = grant.audience === "doctor" ? `Profissional ${grant.requester_name || grant.requester_id}` : `Equipe da clínica ${grant.clinic_name}`;
    const state = grantState(grant);
    const heading = document.createElement("div");
    heading.className = "grant-heading";
    heading.append(text("h3", profile.patient_id ? recipient : grant.patient_name), text("span", labels[state], "badge " + state));
    const term = document.createElement("details");
    term.open = Boolean(profile.patient_id && state === "pending");
    term.append(text("summary", "Ler termo de autorização"), text("p", grant.term_text));
    card.append(heading, text("p", "Finalidade: " + grant.purpose),
      text("p", "Solicitada em " + date(grant.requested_at)),
      text("p", "Acesso até " + date(grant.expires_at)),
      text("p", "Abrangência: registros anteriores disponíveis no aceite; " + (grant.audience === "doctor" ? "acesso pessoal." : "equipe assistencial da clínica.")),
      text("p", "Versão do termo: " + grant.term_version), term);
    if (grant.approved_at) card.append(text("p", "Autorizada em " + date(grant.approved_at)));
    if (grant.revoked_at) card.append(text("p", "Revogada em " + date(grant.revoked_at)));
    const actions = profile.patient_id ? (state === "pending" ? ["approve", "deny"] : grant.status === "approved" ? ["revoke"] : []) : [];
    const actionContainer = document.createElement("div");
    actionContainer.className = "grant-actions";
    for (const decision of actions) {
      const button = text("button", { approve: "Autorizar conforme o termo", deny: "Recusar", revoke: "Revogar novos acessos" }[decision], decision === "approve" ? "primary" : "secondary");
      button.type = "button";
      button.addEventListener("click", guarded(async () => {
        await api(`patient/grants/${grant.id}/decision/`, { method: "POST", data: { decision, term_version: grant.term_version } });
        await loadGrants();
        message("Decisão registrada.");
      }));
      actionContainer.append(button);
    }
    if (!profile.patient_id) {
      const renew = text("button", "Nova solicitação para este paciente", "secondary");
      renew.type = "button";
      renew.addEventListener("click", () => openRequest(grant));
      actionContainer.append(renew);
    }
    card.append(actionContainer);
    el("grants").append(card);
  }
  if (!grants.length) el("grants").append(text("p", "Nenhuma solicitação registrada.", "empty-state"));
}
async function refresh() {
  el("records").replaceChildren(text("p", "Selecione um paciente da carteira para consultar o histórico.", "empty-state"));
  await loadGrants();
  if (profile.patient_id) await loadPatientHistory();
  if (profile.is_doctor) {
    patients = await api("doctor/patients/");
    renderPatients();
  }
}
function openRequest(grant) {
  const form = el("grant-request");
  form.reset();
  if (grant) {
    form.elements.patient_id.value = grant.patient_id;
    form.elements.purpose.value = grant.purpose;
  }
  el("request-status").hidden = true;
  el("request-dialog").showModal();
}
function showView() {
  if (!profile || (!profile.is_doctor && !profile.patient_id)) return;
  const ownProfile = location.hash === "#profile";
  el("profile-view").hidden = !ownProfile;
  const myHistory = !ownProfile && Boolean(profile.patient_id) && location.hash === "#my-history";
  const requests = !ownProfile && (Boolean(profile.patient_id) ? !myHistory : location.hash === "#requests");
  el("patient-history").hidden = !myHistory;
  el("nav-history").hidden = !profile.patient_id;
  el("doctor").hidden = !profile.is_doctor || requests || ownProfile;
  el("patient").hidden = !profile.patient_id || myHistory || ownProfile;
  el("requests").hidden = !requests;
  el("nav-patients").hidden = !profile.is_doctor || Boolean(profile.patient_id);
  el("new-authorization").hidden = !profile.is_doctor || Boolean(profile.patient_id);
  for (const [id, active] of [["nav-patients", !requests && !myHistory && !ownProfile], ["nav-requests", requests], ["nav-history", myHistory], ["nav-profile", ownProfile]]) {
    el(id).classList.toggle("active", active);
    if (active) el(id).setAttribute("aria-current", "page");
    else el(id).removeAttribute("aria-current");
  }
  const title = ownProfile ? "Meu perfil" : profile.patient_id ? (myHistory ? "Meu histórico" : "Minhas autorizações") : requests ? "Autorizações" : "Meus pacientes";
  el("greeting").textContent = title;
  document.title = `${title} • MarIA`;
  el("workspace").scrollTop = 0;
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", showView);
window.addEventListener("popstate", showView);
for (const id of ["nav-patients", "nav-requests", "nav-history", "nav-profile"]) {
  el(id).addEventListener("click", (event) => {
    event.preventDefault();
    window.history.pushState(null, "", el(id).getAttribute("href"));
    showView();
  });
}
function closeRequest() { el("request-dialog").close(); }
function openEncounter(patient) {
  encounterPatient = patient;
  el("encounter-form").reset();
  el("encounter-title").textContent = profile.patient_id ? "Adicionar ao meu histórico" : "Atendimento de " + patient.name;
  el("encounter-clinic").closest("label").hidden = Boolean(profile.patient_id);
  el("encounter-status").hidden = true;
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  el("encounter-time").value = local;
  el("encounter-time").max = local;
  el("encounter-dialog").showModal();
}
el("close-encounter").addEventListener("click", () => el("encounter-dialog").close());
el("cancel-encounter").addEventListener("click", () => el("encounter-dialog").close());
el("encounter-form").addEventListener("submit", guarded(async () => {
  const values = new FormData(el("encounter-form"));
  const patient = encounterPatient;
  const file = values.get("attachment");
  const camera = values.get("camera_attachment");
  if (file?.size && camera?.size) throw new Error("Escolha apenas um arquivo ou uma fotografia por registro.");
  values.delete("camera_attachment");
  values.delete("attachment");
  if (file?.size || camera?.size) values.set("attachment", file?.size ? file : camera);
  values.set("occurred_at", new Date(values.get("occurred_at")).toISOString());
  values.set("summary", values.get("summary").trim());
  if (profile.patient_id || !values.get("clinic_id")) values.delete("clinic_id");
  await api(profile.patient_id ? "patient/records/" : `doctor/patients/${patient.id}/records/`, {
    method: "POST", data: values,
  });
  el("encounter-form").reset();
  el("encounter-dialog").close();
  if (profile.patient_id) await loadPatientHistory();
  else await history(patient, true);
  message("Registro salvo com sua autoria. Operação auditada.");
}));
el("add-patient-record").addEventListener("click", () => openEncounter({ id: profile.patient_id }));
el("refresh-my-history").addEventListener("click", guarded(loadPatientHistory));
el("refresh-authorizations").addEventListener("click", guarded(async () => { await refresh(); message("Autorizações atualizadas."); }));
el("logout").addEventListener("click", logout);
el("refresh").addEventListener("click", guarded(async () => { await refresh(); message("Acompanhamento atualizado."); }));
el("refresh-patient").addEventListener("click", guarded(async () => { await loadGrants(); message("Solicitações atualizadas."); }));
el("patient-search").addEventListener("input", renderPatients);
el("new-request").addEventListener("click", () => openRequest());
el("new-authorization").addEventListener("click", () => openRequest());
el("close-request").addEventListener("click", closeRequest);
el("cancel-request").addEventListener("click", closeRequest);
el("grant-request").addEventListener("submit", guarded(async () => {
  const form = el("grant-request");
  const values = new FormData(form);
  await api("doctor/grants/", { method: "POST", data: {
    patient_id: values.get("patient_id").trim(), purpose: values.get("purpose").trim(),
    duration_days: Number(values.get("duration_days")),
  } });
  form.reset();
  closeRequest();
  await refresh();
  message("Solicitação enviada. O paciente decide pelo portal dele.");
}));
guarded(async () => {
  profile = await api("me/");
  for (const clinic of profile.clinics.filter((clinic) => clinic.role === "doctor")) {
    const option = text("option", clinic.name);
    option.value = clinic.id;
    el("encounter-clinic").append(option);
  }
  el("workspace").hidden = false;
  el("doctor").hidden = !profile.is_doctor;
  el("patient").hidden = !profile.patient_id;
  el("greeting").textContent = profile.patient_id ? "Meu acompanhamento" : "Meus pacientes";
  el("account-name").textContent = profile.username;
  el("account-initials").textContent = initials(profile.username);
  el("account-role").textContent = profile.patient_id ? "Paciente" : "Profissional";
  el("welcome").textContent = profile.patient_id ? "Seu histórico. Suas escolhas. Seu cuidado." : "Seu acompanhamento, onde você estiver.";
  el("patient-id").textContent = profile.patient_id || "";
  if (!profile.is_doctor && !profile.patient_id) {
    el("requests").hidden = true;
    message("Esta conta não possui perfil de médico ou paciente habilitado.");
    return;
  }
  await loadProfile();
  showView();
  await refresh();
})();

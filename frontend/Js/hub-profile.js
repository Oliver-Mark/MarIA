import { api } from "./hub-api.js?v=20261015-attachments";

const el = (id) => document.getElementById(id);
let details;

export async function loadProfile() {
  details = await api("me/profile/");
  const form = el("profile-form");
  for (const field of ["full_name", "email", "phone"]) form.elements[field].value = details[field];
  el("profile-username").textContent = details.username;
  el("profile-kind").textContent = details.patient ? "Paciente" : details.doctor ? "Médico" : "Conta MarIA";
  el("profile-patient-fields").hidden = !details.patient;
  el("profile-doctor-fields").hidden = !details.doctor;
  if (details.patient) {
    form.elements.birth_date.value = details.patient.birth_date;
    el("profile-patient-id").textContent = details.patient.id;
  }
  if (details.doctor) {
    for (const field of ["specialty", "registration_number", "registration_state"]) {
      form.elements[field].value = details.doctor[field];
    }
    el("profile-professional-status").textContent = details.doctor.active ? "Perfil profissional habilitado" : "Perfil profissional desabilitado";
  }
  el("account-name").textContent = details.full_name || details.username;
  return details;
}

el("profile-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = el("profile-status");
  const button = el("save-profile");
  const values = new FormData(event.currentTarget);
  const data = {};
  for (const field of ["full_name", "email", "phone"]) data[field] = values.get(field).trim();
  if (details.patient) data.birth_date = values.get("birth_date");
  if (details.doctor) {
    for (const field of ["specialty", "registration_number", "registration_state"]) data[field] = values.get(field).trim();
  }
  button.disabled = true;
  status.textContent = "Salvando perfil…";
  try {
    await api("me/profile/", { method: "PATCH", data });
    await loadProfile();
    status.textContent = "Perfil atualizado.";
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

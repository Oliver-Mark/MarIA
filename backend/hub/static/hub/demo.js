let accessToken = "",
  profile = null,
  patientRows = [];
const el = (id) => document.getElementById(id);
function status(text) {
  el("status").textContent = text;
}
async function api(path, method = "GET", data, headers = {}) {
  const res = await fetch("/api/v1/" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: "Bearer " + accessToken } : {}),
      ...headers,
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  const body = await res.json();
  el("response").textContent = JSON.stringify(body, null, 2);
  if (!res.ok)
    throw new Error("HTTP " + res.status + ": " + JSON.stringify(body));
  return body;
}
function guarded(fn) {
  return async (event) => {
    event?.preventDefault();
    try {
      await fn();
    } catch (error) {
      status(error.message);
    }
  };
}
function reset() {
  accessToken = "";
  profile = null;
  patientRows = [];
  el("clinical").hidden = true;
  el("portal").hidden = true;
  el("clinic").replaceChildren();
  el("patient").replaceChildren();
  el("grants").replaceChildren();
  el("records").textContent = "Nenhuma consulta realizada.";
  el("response").textContent = "Aguardando operação.";
  el("integrationKey").value = "";
}
function option(value, text) {
  const item = document.createElement("option");
  item.value = value;
  item.textContent = text;
  return item;
}
el("login").onsubmit = guarded(async () => {
  reset();
  const result = await api("auth/login/", "POST", {
    username: el("username").value,
    password: el("password").value,
  });
  accessToken = result.access;
  el("password").value = "";
  profile = await api("me/");
  for (const clinic of profile.clinics)
    el("clinic").append(option(clinic.id, clinic.name + " · " + clinic.role));
  el("clinical").hidden = !profile.clinics.length;
  el("portal").hidden = !profile.patient_id;
  status("Autenticado como " + profile.username + ".");
});
el("logout").onclick = () => {
  reset();
  status("Sessão local encerrada.");
};
el("clinic").onchange = () => {
  patientRows = [];
  el("patient").replaceChildren();
  el("records").textContent = "Selecione e consulte novamente.";
  el("integrationKey").value = "";
};
el("loadPatients").onclick = guarded(async () => {
  patientRows = await api("clinics/" + el("clinic").value + "/patients/");
  el("patient").replaceChildren();
  for (const p of patientRows) el("patient").append(option(p.id, p.name));
  status("Pacientes vinculados carregados.");
});
el("ingest").onsubmit = guarded(async () => {
  const p = patientRows.find((x) => x.id === el("patient").value);
  if (!p) throw new Error("Carregue e selecione um paciente.");
  const integrationKey = el("integrationKey").value.trim();
  if (!/^[0-9a-f-]{36}\.[A-Za-z0-9_-]+$/i.test(integrationKey))
    throw new Error(
      "Cole a chave completa da integração (identificador.segredo), exibida pelo seed_demo para a clínica de origem.",
    );
  await api(
    "integration/records/",
    "POST",
    {
      external_patient_id: p.external_id,
      external_id: el("externalId").value,
      occurred_at: new Date(el("occurredAt").value).toISOString(),
      summary: el("summary").value,
    },
    { "X-Integration-Key": integrationKey },
  );
  status("Atendimento recebido pelo HUB.");
});
el("request").onsubmit = guarded(async () => {
  if (!el("patient").value) throw new Error("Selecione um paciente.");
  await api("clinics/" + el("clinic").value + "/grants/", "POST", {
    patient_id: el("patient").value,
    purpose: el("purpose").value,
    expires_at: new Date(el("expiry").value).toISOString(),
  });
  status("Solicitação enviada. O paciente precisa decidir pelo portal.");
});
el("history").onclick = guarded(async () => {
  el("records").textContent = "Consultando...";
  try {
    const data = await api(
      "clinics/" +
        el("clinic").value +
        "/patients/" +
        el("patient").value +
        "/history/",
    );
    el("records").textContent = JSON.stringify(data, null, 2);
    status("Histórico consultado e acesso registrado.");
  } catch (error) {
    el("records").textContent = "Acesso não realizado.";
    throw error;
  }
});
async function loadGrants() {
  const grants = await api("patient/grants/");
  el("grants").replaceChildren();
  for (const grant of grants) {
    const card = document.createElement("article"),
      title = document.createElement("h3"),
      term = document.createElement("p");
    title.textContent = (grant.audience === "doctor" ? "Profissional " + (grant.requester_name || grant.requester_id) : grant.clinic_name) + " · " + grant.status;
    term.textContent = grant.term_text;
    card.append(title, term);
    const actions =
      grant.status === "pending"
        ? ["approve", "deny"]
        : grant.status === "approved"
          ? ["revoke"]
          : [];
    for (const decision of actions) {
      const button = document.createElement("button");
      button.textContent = {
        approve: "Autorizar conforme o termo",
        deny: "Recusar",
        revoke: "Revogar novos acessos",
      }[decision];
      button.onclick = guarded(async () => {
        await api("patient/grants/" + grant.id + "/decision/", "POST", {
          decision,
          term_version: grant.term_version,
        });
        await loadGrants();
        status("Decisão registrada.");
      });
      card.append(button);
    }
    el("grants").append(card);
  }
}
el("loadGrants").onclick = guarded(loadGrants);
function localDate(date) {
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return shifted.toISOString().slice(0, 16);
}
el("occurredAt").value = localDate(new Date(Date.now() - 86400000));
el("expiry").value = localDate(new Date(Date.now() + 30 * 86400000));

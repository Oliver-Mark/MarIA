const TOKEN_KEY = "maria.hub.access";

export function setToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  location.assign("/hub/login/");
}

export async function api(path, { method = "GET", data, authenticated = true, binary = false } = {}) {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (authenticated && !token) {
    logout();
    throw new Error("Entre novamente para continuar.");
  }
  const response = await fetch("/api/v1/" + path, {
    method,
    headers: {
      ...(data instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(authenticated ? { Authorization: "Bearer " + token } : {}),
    },
    ...(data ? { body: data instanceof FormData ? data : JSON.stringify(data) } : {}),
  });
  const body = binary && response.ok ? await response.blob() : await response.json();
  if (response.status === 401 && authenticated) {
    logout();
    throw new Error("Sessão expirada. Entre novamente.");
  }
  if (!response.ok) {
    throw new Error(body.detail || Object.values(body).flat().join(" ") || "Não foi possível concluir a operação.");
  }
  return body;
}

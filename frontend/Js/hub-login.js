import { api, setToken } from "./hub-api.js";

const form = document.getElementById("hub-login");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button");
  button.disabled = true;
  try {
    const values = new FormData(form);
    const result = await api("auth/login/", {
      method: "POST", authenticated: false,
      data: { username: values.get("username"), password: values.get("password") },
    });
    setToken(result.access);
    form.reset();
    location.assign("/hub/");
  } catch (error) {
    document.getElementById("status").textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

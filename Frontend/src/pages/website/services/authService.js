const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.smansa.m-tech.fun";

const LOGIN_PATH = import.meta.env.VITE_LOGIN_PATH || "/login";

function normalizeBaseUrl(url) {
  return url.replace(/\/$/, "");
}

export async function loginRequest({ email, password }) {
  const response = await fetch(`${normalizeBaseUrl(API_BASE_URL)}${LOGIN_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Email atau password salah.");
  }

  return data;
}

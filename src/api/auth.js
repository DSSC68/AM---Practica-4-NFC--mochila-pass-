// Comunicacion con la API de login de la practica 2 (monsterballgo.com/api/login).
import * as Crypto from 'expo-crypto';

import { API } from '../config';

// Si la foto viene como ruta relativa ("/media/usr/x.png") le agrega el dominio;
// si no hay foto, usa la imagen por defecto del servidor
function absoluteUrl(url) {
  if (!url) return API.DEFAULT_PFP;
  if (/^https?:\/\//i.test(url)) return url;
  return API.BASE_URL + (url.startsWith('/') ? '' : '/') + url;
}

// Respuesta de la API: { username, id, email, firstname, lastname, pfp_url, ... } o { error }.
// La convierte al formato que usa la app (camelCase). Regresa null si no es un usuario valido.
function normalizeUser(raw) {
  if (raw?.id === undefined || raw?.id === null || !raw.username) return null;
  return {
    id: Number(raw.id),
    username: raw.username,
    firstName: raw.firstname ?? raw.first_name ?? '',
    lastName: raw.lastname ?? raw.last_name ?? '',
    email: raw.email ?? '',
    pfpUrl: absoluteUrl(raw.pfp_url),
  };
}

// Errores que regresa la API y su traduccion para el usuario
const API_ERRORS = {
  'Failed to login': 'Usuario o contraseña incorrectos.',
  Unauthorized: 'Token de la API no autorizado.',
};

// Inicia sesion. Regresa el usuario normalizado o lanza un Error con un mensaje legible.
export async function login(username, password) {
  // Igual que en la practica 2: la contraseña viaja como SHA-256 en hex minusculas
  const passHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
  // Cuerpo en formato formulario: user=...&pass=...&token=...
  const body = Object.entries({ user: username.trim(), pass: passHash, token: API.TOKEN })
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

  // Si el servidor no responde en TIMEOUT_MS se cancela la peticion
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API.TIMEOUT_MS);

  // Peticion POST a la API
  let res;
  try {
    res = await fetch(API.LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body,
      signal: controller.signal,
    });
  } catch (e) {
    throw new Error(
      e.name === 'AbortError' ? 'El servidor tardó demasiado en responder.' : 'No hay conexión con el servidor.'
    );
  } finally {
    clearTimeout(timer);
  }

  // Se lee como texto primero porque una pagina de error (p. ej. 503) no es JSON
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // respuesta que no es JSON (p. ej. pagina de error del servidor)
  }

  // Lo que respondio el servidor, recortado, para poder diagnosticar
  const detalle = `[HTTP ${res.status}] ${API.LOGIN_URL}\n${text.slice(0, 200)}`;
  console.log('LOGIN', detalle);

  // Errores: primero los que manda la API ({ error }), luego los de HTTP
  if (json?.error) throw new Error(API_ERRORS[json.error] ?? json.error);
  if (!res.ok) throw new Error(`Error del servidor.\n${detalle}`);

  const user = normalizeUser(json);
  if (!user) throw new Error(`Respuesta inesperada del servidor.\n${detalle}`);
  return user;
}

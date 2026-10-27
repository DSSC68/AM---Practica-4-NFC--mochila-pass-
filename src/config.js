// Configuracion general de la app. Si algo cambia el dia de la demo, se cambia aqui.

// Datos del servidor del profesor
export const API = {
  // Endpoint de login de la API de la practica 2:
  // POST form-urlencoded { user, pass: sha256(contraseña), token }
  LOGIN_URL: 'https://monsterballgo.com/api/login',
  TOKEN: 'code37',
  // Para completar URLs relativas de la foto de perfil
  BASE_URL: 'https://monsterballgo.com',
  // Foto que se muestra si el usuario no tiene una
  DEFAULT_PFP: 'https://monsterballgo.com/media/usr/default.png',
  // Tiempo maximo de espera de la API (10 s)
  TIMEOUT_MS: 10000,
};

// Ajustes de la comunicacion NFC con el escaner
export const NFC = {
  // El firmware del ESP32 hace memcpy(&id, bytes, 4) y el ESP32 es little-endian,
  // por eso el ID se manda con el byte menos significativo primero.
  // Ej: 700070 = 0x000AAEA6 -> A6 AE 0A 00
  BYTE_ORDER: 'little',
};

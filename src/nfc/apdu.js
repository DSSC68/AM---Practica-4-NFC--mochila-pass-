// Utilidades para el protocolo APDU: el escaner espera el ID de usuario en 4 bytes.
import { NFC } from '../config';

// Convierte el numero de usuario en 4 bytes (hex) que el servicio HCE manda al escaner.
// Ej: 700070 -> 0x000AAEA6 -> en little-endian "A6AE0A00"
export function idToHex(id, order = NFC.BYTE_ORDER) {
  const n = Number(id);
  if (!Number.isInteger(n) || n < 0 || n > 0xffffffff) {
    throw new Error(`ID de usuario invalido: ${id}`);
  }
  // Separa el numero en 4 bytes, del mas significativo al menos significativo
  const bytes = [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
  // El ESP32 es little-endian: el byte menos significativo va primero
  if (order === 'little') bytes.reverse();
  // Cada byte a 2 digitos hexadecimales
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// "A6AE0A00" -> "A6 AE 0A 00" para mostrarlo en pantalla
export function formatHex(hex) {
  return hex ? hex.match(/.{2}/g).join(' ') : '';
}

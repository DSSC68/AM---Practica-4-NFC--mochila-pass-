// Puente de JavaScript hacia el modulo nativo de Kotlin (HceCredencialModule.kt).
// Las pantallas usan estas funciones en lugar de hablar directo con Android.
import { requireOptionalNativeModule } from 'expo';

// null en web / Expo Go: la app sigue funcionando pero sin NFC
const HceCredencial = requireOptionalNativeModule('HceCredencial');

// false en Expo Go (no incluye este modulo), true en el APK
export const isAvailable = HceCredencial != null;

// { hasNfc, hasHce, nfcEnabled }
export function getStatus() {
  if (!HceCredencial) return { hasNfc: false, hasHce: false, nfcEnabled: false };
  return HceCredencial.getStatus();
}

// Guarda los 4 bytes (ej. "A6AE0A00") que se mandaran al escaner
export function setCredential(hexBytes) {
  HceCredencial?.setCredential(hexBytes);
}

export function getCredential() {
  return HceCredencial?.getCredential() ?? null;
}

// Borra la credencial (al cerrar sesion)
export function clearCredential() {
  HceCredencial?.clearCredential();
}

// Abre los ajustes de Android para encender el NFC
export function openNfcSettings() {
  HceCredencial?.openNfcSettings();
}

// callback({ apdu, sent, timestamp }) cada vez que el escaner nos lee
export function addScanListener(callback) {
  if (!HceCredencial) return { remove() {} };
  return HceCredencial.addListener('onScan', callback);
}

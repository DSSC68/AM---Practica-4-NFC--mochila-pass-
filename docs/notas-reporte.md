# Notas técnicas para el reporte (Práctica 4)

Material de apoyo para el desarrollo experimental y el análisis de resultados.
Las **conclusiones** (justificación a la empresa y desventajas para el usuario) deben redactarse
con palabras propias del equipo, como pide el profesor.

## Recursos utilizados
- Teléfono Android con NFC y HCE.
- Lector Elechouse PN532 v3 en modo HSU + Arduino Nano ESP32 (proporcionado por el profesor).
- Servidor web Node.js/Express + MySQL y panel web (`/app-access/panel`) del profesor.
- App Mochila Pass (React Native + Expo SDK 58, módulo nativo en Kotlin).
- Logo de la app: `docs/logo.png`.

## Flujo de comunicación
1. El PN532 detecta el teléfono (`readPassiveTargetID`).
2. El ESP32 manda el APDU `00 A4 04 00 05 F0 12 34 56 78 00` (SELECT AID).
3. Android enruta el comando a `CredencialApduService` porque el AID está registrado en `apduservice.xml`.
4. La app responde `[4 bytes del ID] 90 00`.
5. El ESP32 manda el ID al endpoint `/api/scanner`, que responde `si`/`no` según el `status` del usuario.
6. LED verde (acceso) o rojo (negado) y el panel web se actualiza por WebSocket.

## Problemas encontrados y solución
| Problema | Causa | Solución |
|---|---|---|
| Expo/React Native no tiene API para HCE | HCE requiere un `HostApduService` nativo | Se creó un módulo local de Expo en Kotlin (`modules/hce-credencial`) que declara el servicio en su `AndroidManifest.xml` |
| El ID llegaba "volteado" al servidor | El firmware hace `memcpy` a un `uint32_t` y el ESP32 es little-endian | Se envían los bytes en orden little-endian (`src/nfc/apdu.js`) |
| El servicio corre fuera de la pantalla de React | Android ejecuta el servicio de forma independiente | El ID se guarda en `SharedPreferences` y el servicio lo lee; un listener avisa a JS para mostrar "¡Escáner detectado!" |
| La app no funciona en Expo Go | Expo Go no incluye módulos nativos propios | Se compila un APK con `expo prebuild` + Gradle |
| Falla de compilación `ninja: error: mkdir ... No such file or directory` | Límite de 260 caracteres en rutas de Windows (carpeta en OneDrive con espacios) | Compilar desde una ruta corta (`C:\mp`) |
| Escaneo sin sesión iniciada | No hay ID que mandar | El servicio responde `6A 82` (no encontrado) y el lector no lo toma como credencial válida |

## Pruebas realizadas
- Conversión de ID a bytes: 700070 → `A6 AE 0A 00`, 690069 → `95 87 0A 00`, 680068 → `84 60 0A 00`
  (verificadas leyendo los bytes como `uint32` little-endian, igual que el ESP32).
- Login correcto / contraseña incorrecta / sin internet (mensajes de error en pantalla).
- NFC apagado → aviso y botón "Activar NFC".
- Escaneo con cada integrante (uno de ellos baneado por el profesor → LED rojo).
- Logs: `adb logcat -s APDU` muestra `APDU IN` / `APDU OUT`.

## Ideas para "mejoras a futuro"
- Usar HTTPS en el ESP32 y no mandar el token `code37` en la URL.
- Que el escáner mande un reto (nonce) y la app responda con un ID firmado, para evitar clonación/replay del ID fijo.
- Token de sesión con expiración en lugar de un ID estático de 4 bytes.
- Panel web: historial de accesos, filtros por usuario y fecha, sonido/alerta en accesos negados, exportar a CSV.
- Modo offline en el ESP32 con lista local de usuarios cuando no hay Wi-Fi.

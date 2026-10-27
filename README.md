# Mochila Pass

App cliente (React Native + Expo) del sistema de acceso físico por NFC del curso **Aplicaciones Móviles 900CIB**.
Dominio asignado: **Hostal para backpackers**. Equipo **Pythonistas**:

| Integrante | No. de usuario |
|---|---|
| Sebastian Soto | 700070 |
| Elias Ordoñez | 690069 |
| Diego Salinas | 680068 |

## Qué hace

1. **Login** con usuario y contraseña contra la API de la práctica 2.
2. **Credencial**: foto de perfil, nombre completo y número de usuario en grande.
3. **NFC (HCE + APDU)**: el teléfono emula una tarjeta. Cuando el escáner manda
   `SELECT AID F0 12 34 56 78`, la app responde con **4 bytes del número de usuario + `90 00`**.
   El escáner decide si da acceso (LED verde / rojo). La app **solo** avisa que se detectó el
   escáner (vibración + aviso en pantalla); no dice si hubo acceso ni llama al endpoint del escáner.
4. **Créditos**: integrantes, grupo, fecha y tech stack con logos oficiales.

## Estructura

```
mochila-pass/
├── src/
│   ├── app/                 # Pantallas (Expo Router)
│   │   ├── _layout.js       # Navegación + proveedor de sesión
│   │   ├── index.js         # Login
│   │   ├── credencial.js    # Credencial + retroalimentación del escáner
│   │   └── creditos.js      # Créditos y tech stack
│   ├── api/auth.js          # Llamada a la API de login
│   ├── context/SessionContext.js  # Sesión (guarda usuario y carga la credencial NFC)
│   ├── nfc/apdu.js          # Convierte el ID a 4 bytes
│   ├── components/          # Logo y botón
│   ├── data/                # Equipo y logos del tech stack
│   ├── config.js            # URL de la API y orden de bytes  <-- lo único que se configura
│   └── theme.js             # Colores
├── modules/hce-credencial/  # Módulo nativo propio (Kotlin)
│   └── android/src/main/
│       ├── java/.../CredencialApduService.kt  # HostApduService que responde al escáner
│       ├── java/.../HceCredencialModule.kt    # Puente JS <-> Android
│       └── res/xml/apduservice.xml            # Registra el AID F012345678
└── assets/                  # Ícono y splash
```

## Detalle importante: orden de bytes

El firmware (`ScannerHTTP.ino`) hace `memcpy(&id, userId, 4)` y el ESP32 es **little-endian**,
así que el ID se manda con el byte menos significativo primero:

| ID | Bytes enviados | Lo que lee el ESP32 |
|---|---|---|
| 700070 | `A6 AE 0A 00` | 700070 |
| 690069 | `95 87 0A 00` | 690069 |
| 680068 | `84 60 0A 00` | 680068 |

Si el profe cambiara el firmware para leer big-endian, basta con poner `BYTE_ORDER: 'big'` en `src/config.js`.

## Compilar en la nube (recomendado)

EAS Build compila en Linux, así que no le afecta el límite de rutas de Windows. Necesitas una cuenta gratis de Expo.

```bash
npx eas-cli@latest login
```

```bash
npx eas-cli@latest build -p android --profile preview
```

Al terminar te da un enlace/QR para descargar el `.apk` directo en el celular.

## Compilar e instalar en local (Windows)

Requisitos: Node 20+, Android Studio (trae el JDK) y el SDK de Android.

> **Ojo:** compilar desde una ruta larga o con espacios (p. ej. OneDrive\Escritorio\AM - Practica 4)
> falla en CMake/ninja por el límite de rutas de Windows. Copia el proyecto a una ruta corta como
> `C:\mp` (sin `node_modules` ni `android`) y compila desde ahí.

```bash
npm install
npx expo prebuild --platform android --clean
```

```bash
cd android && set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr && gradlew.bat assembleRelease
```

El APK queda en `android/app/build/outputs/apk/release/app-release.apk`.
Instalar con el celular conectado por USB (depuración USB activada):

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

> Expo Go **no** sirve para esta app porque usa un módulo nativo (HCE). Hay que usar el APK.

## Checklist para la demo

- [ ] NFC del teléfono **encendido** y la pantalla **desbloqueada** (el servicio lo exige).
- [ ] Si el teléfono pregunta por "app de pago predeterminada", no importa: usamos la categoría `other`.
- [ ] Iniciar sesión con cada integrante y acercar el teléfono (parte trasera, donde está la antena) al PN532.
- [ ] El teléfono vibra y aparece "¡Escáner detectado!" → el LED del Arduino se pone verde (activo) o rojo (baneado).
- [ ] Captura del panel web: `https://monsterballgo.com/app-access/panel`.
- [ ] Ver logs del lado Android: `adb logcat -s APDU`.
